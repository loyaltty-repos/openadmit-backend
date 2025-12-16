

import OpenAI from "openai";
import Prompts from "./universityFinderPrompt.js";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MODELS = {
  FAST: "gpt-5-mini",
  ACCURATE: "gpt-5",
};

/* =========================
 * Student -> compact profile
 * ========================= */
export function mapStudentToProfile(student) {
  const pick = (v, d = null) => (v === undefined ? d : v);

  const degree = pick(student?.degree);
  const program = pick(student?.programDetails?.program);
  const intake = pick(student?.programDetails?.intake);
  const duration = pick(student?.programDetails?.duration);
  const intakeMode = pick(student?.intakeMode); // BASIC / ADVANCED

  const wantsSTEM = pick(student?.stemRequired) === "YES";
  const wantsF1 = pick(student?.f1Required) === "YES";

  const college = student?.collegeDetails || {};
  const tests = {
    gre: {
      verbal: pick(student?.greDetails?.greScore?.verbal),
      quant: pick(student?.greDetails?.greScore?.quant),
      awa: pick(student?.greDetails?.greScore?.awa),
    },
    gmat: {
      verbal: pick(student?.gmatDetails?.gmatScore?.verbal),
      quant: pick(student?.gmatDetails?.gmatScore?.quant),
      total: pick(student?.gmatDetails?.gmatScore?.total),
    },
    ielts: student?.ieltsDetails?.ieltsScore || null,
    toefl: student?.toeflDetails?.toeflScore || null,
    duolingo: student?.duolingoDetails?.duolingoScore || null,
    sat: student?.satDetails?.satScore || null,
    act: student?.actDetails?.actScore || null,
  };

  const experience = {
    months: pick(student?.experienceDetails?.totalExperience),
    industry: pick(student?.experienceDetails?.experienceIndustry),
  };

  const englishTest =
    tests.ielts || tests.toefl || tests.duolingo ? "HAS_ENGLISH_TEST" : "UNKNOWN";

  return {
    degree,
    program,
    intake,
    duration,
    intakeMode,
    wantsSTEM,
    wantsF1,
    college: {
      branch: pick(college.branch),
      highestDegree: pick(college.highestDegree),
      university: pick(college.university),
      college: pick(college.college),
      tier: pick(college.tier),
      gpa: pick(college.gpa),
      gpaScale: pick(college.gpaScale),
      toppersGPA: pick(college.toppersGPA),
      backlogs: pick(college.noOfBacklogs),
      admissionTerm: pick(college.admissionTerm),
      coursesApplying: Array.isArray(college.coursesApplying)
        ? college.coursesApplying
        : null,
    },
    tests,
    englishTest,
    experience,
    visaPrefs: {
      countries: Array.isArray(student?.visa?.countriesPlanningToApply)
        ? student.visa.countriesPlanningToApply
        : null,
    },
  };
}

/* =========================
 * Normalization + Bucketing
 * ========================= */
function normalizeChanceToTier(raw) {
  const c = (raw || "").toString().toLowerCase().trim();
  const base = c.replace(/[^a-z ]/g, "").split(" ")[0];
  if (["ambitious", "target", "safe", "backup"].includes(base)) return base;
  if (c.includes("reach") || c.includes("stretch")) return "ambitious";
  if (c.includes("match") || c.includes("target")) return "target";
  if (c.includes("safe") || c.includes("safety")) return "safe";
  if (c.includes("backup") || c.includes("fallback") || c.includes("sure")) return "backup";
  return "target";
}

function coerceNullableNumber(x) {
  if (x === null || x === undefined) return null;
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

function sanitizeStr(x) {
  if (x === null || x === undefined) return null;
  const s = String(x).trim();
  return s.length ? s : null;
}

function normalizeItem(it) {
  return {
    university: sanitizeStr(it?.University),
    program: sanitizeStr(it?.Program),
    tier: normalizeChanceToTier(it?.Chance),
    location: sanitizeStr(it?.Location),
    length: sanitizeStr(it?.Length),
    tuition: sanitizeStr(it?.Tuition),
    probability: coerceNullableNumber(it?.Probability),
    stemDesignated: it?.STEMDesignated ?? null,
    f1Eligible: it?.F1Eligible ?? null,
    accepts3Year: it?.Accepts3Year ?? null,
    acceptanceRate: coerceNullableNumber(it?.AcceptanceRate),
    ranking: { national: coerceNullableNumber(it?.Ranking?.National) },
    description: sanitizeStr(it?.Description),
  };
}

function toBuckets(items) {
  const out = { ambitious: [], target: [], safe: [], backup: [], total: 0 };
  const wrap = (n, tier) => ({
    id: `${tier}-${n.university}`.toLowerCase().replace(/\s+/g, "-"),
    name: n.university,
    university: n.university,
    program: n.program,
    tier,
    length: n.length,
    probability: n.probability,
    ranking: n.ranking,
    location: n.location,
    tuition: n.tuition,
    description: n.description || `${n.program} program`,
    acceptanceRate: n.acceptanceRate,
    stemDesignated: n.stemDesignated === true,
    f1Eligible: n.f1Eligible === true,
    accepts3Year: n.accepts3Year !== false, // default true if unknown
    features: ["Research Opportunities", "Career Services"],
  });

  for (const n of items) {
    if (!n?.university || !n?.program) continue;
    out[n.tier].push(wrap(n, n.tier));
  }
  out.total =
    out.ambitious.length + out.target.length + out.safe.length + out.backup.length;

  if (out.total === 0) {
    const fallback = items.slice(0, Math.max(8, Math.min(12, items.length)));
    for (const n of fallback) out.target.push(wrap(n, "target"));
    out.total = out.target.length;
  }

  return out;
}

function extractJSONArray(text) {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON array found");
  }
  return text.slice(start, end + 1);
}

function parseModelOutput(rawText, { strictCount }) {
  const jsonCandidate = extractJSONArray(rawText);
  let arr = JSON.parse(jsonCandidate);
  if (!Array.isArray(arr)) throw new Error("Model output is not an array");

  if (strictCount) {
    if (arr.length !== 20) throw new Error(`Expected 20 items, received ${arr.length}`);
  } else {
    if (arr.length < 8) throw new Error(`Too few items (${arr.length})`);
    arr = arr.slice(0, 20);
  }

  const normalized = arr.map(normalizeItem);
  return toBuckets(normalized);
}

/* =========================
 * Responses API call helper
 * ========================= */
async function callResponsesModel({ model, system, user, withWeb = false }) {
  // Compose a single input string (Responses API friendly)
  const input = `${system.trim()}\n\n${user.trim()}`;

  const args = {
    model,
    input,
  };
  if (withWeb) {
    // Minimal, portable tool spec; omit for FAST
    args.tools = [{ type: "web_search" }];
  }

  // Some models reject extra params; keep payload minimal and avoid temperature.
  const res = await client.responses.create(args);

  // Robust output extraction across SDK/engine variants
  const text =
    res.output_text ||
    res?.output?.[0]?.content?.[0]?.text ||
    res?.outputs?.[0]?.content?.[0]?.text ||
    "";

  return String(text || "");
}

/* ===========
 * Public API
 * =========== */
export async function getUniversitiesFast(student, { degreeKind = "Masters" } = {}) {
  const profile = mapStudentToProfile(student);
  const system = Prompts.buildFastSystem(profile, degreeKind);
  const user = Prompts.buildFastUser();

  const raw = await callResponsesModel({
    model: MODELS.FAST,
    system,
    user,
    withWeb: false,
  });

  return parseModelOutput(raw, { strictCount: false });
}

export async function getUniversitiesAccurate(
  student,
  {
    degreeKind = "Masters",
    enrichFromFast = true,
    maxSearches = 6,
    topN = 8,
  } = {}
) {
  const profile = mapStudentToProfile(student);

  if (enrichFromFast) {
    // 1) shortlist quickly without web
    const shortlist = await getUniversitiesFast(student, { degreeKind });
    const pick = [
      ...shortlist.ambitious.slice(0, 2),
      ...shortlist.target.slice(0, 3),
      ...shortlist.safe.slice(0, 3),
    ].slice(0, topN);

    // 2) accurate verify ONLY these schools/programs
    const focus = pick.map((p) => ({ University: p.university, Program: p.program }));
    const focusHint = { ...profile, focus };

    const system = Prompts.buildAccurateSystem(focusHint, degreeKind, { maxSearches });
    const user = Prompts.buildAccurateUser();

    const raw = await callResponsesModel({
      model: MODELS.ACCURATE,
      system,
      user,
      withWeb: true,
    });

    const enriched = parseModelOutput(raw, { strictCount: false });

    // 3) merge: prefer enriched rows when the key matches
    const key = (u, p) => `${u}@@${p}`.toLowerCase();
    const idx = new Map();
    for (const t of ["ambitious", "target", "safe", "backup"]) {
      for (const r of shortlist[t]) idx.set(key(r.university, r.program), { tier: t, ref: r });
    }
    for (const t of ["ambitious", "target", "safe", "backup"]) {
      for (const r of enriched[t]) idx.set(key(r.university, r.program), { tier: t, ref: r });
    }

    const mergedItems = Array.from(idx.values()).map((v) => v.ref);
    const merged = { ambitious: [], target: [], safe: [], backup: [], total: 0 };
    for (const it of mergedItems) merged[it.tier].push(it);
    merged.total =
      merged.ambitious.length +
      merged.target.length +
      merged.safe.length +
      merged.backup.length;
    return merged;
  }

  // One-shot accurate (strict 20)
  const system = Prompts.buildAccurateSystem(profile, degreeKind, { maxSearches });
  const user = Prompts.buildAccurateUser();
  const raw = await callResponsesModel({
    model: MODELS.ACCURATE,
    system,
    user,
    withWeb: true,
  });
  return parseModelOutput(raw, { strictCount: true });
}

export default {
  getUniversitiesFast,
  getUniversitiesAccurate,
  mapStudentToProfile,
};
