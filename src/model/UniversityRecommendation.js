import mongoose from "mongoose";

const { Schema } = mongoose;

// Let ranking be flexible because LLM is clearly returning an object
// (you see [Object] in console) and its structure may evolve.
const RankingSchema = new Schema(
  {
    national: { type: Number }, // keep if you want a known field
  },
  {
    _id: false,
    strict: false, // allow any extra ranking keys without failing validation
  }
);

const UniversityItemSchema = new Schema(
  {
    id: { type: String, required: true },           // e.g. "ambitious-massachusetts-institute-of-technology"
    name: { type: String, required: true },         // University name
    university: { type: String, required: true },
    program: { type: String, required: true },
    tier: {
      type: String,
      enum: ["ambitious", "target", "safe", "backup"],
      required: true,
    },
    length: { type: String },
    probability: { type: Number },                  // e.g., 8, 40, 75
    ranking: { type: RankingSchema, default: {} },  // matches the [Object] you logged
    location: { type: String },
    tuition: { type: String },                      // "$57,000 per year"
    description: { type: String },
    acceptanceRate: { type: Number },
    stemDesignated: { type: Boolean, default: false },
    f1Eligible: { type: Boolean, default: true },
    accepts3Year: { type: Boolean, default: true },
    features: { type: [String], default: [] },      // ["Research Opportunities", ...]
  },
  { _id: false }
);

const BucketsSchema = new Schema(
  {
    ambitious: { type: [UniversityItemSchema], default: [] },
    target: { type: [UniversityItemSchema], default: [] },
    safe: { type: [UniversityItemSchema], default: [] },
    backup: { type: [UniversityItemSchema], default: [] },
    total: { type: Number, required: true },        // 20 in your example
  },
  { _id: false }
);

const UniversityRecommendationSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true, // fast lookup by student
    },

    mode: {
      type: String,
      enum: ["FAST", "ACCURATE"],
      required: true,
    },

    degreeKind: {
      type: String,
      default: "MASTER",
      enum: ["BACHELOR", "MASTER", "MBA", "PHD", "Other"],
    },

    // This will now accept exactly the object you logged:
    // { ambitious: [...], target: [...], safe: [...], backup: [...], total: 20 }
    results: {
      type: BucketsSchema,
      required: true,
    },

    generatedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    rawLlmOutput: {
      type: String,
      select: false,
    },

    // Auto-expire after 90 days
    expiresAt: {
      type: Date,
      default: () =>
        new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      index: { expireAfterSeconds: 0 },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// "Get latest rec for student+mode" becomes cheap:
UniversityRecommendationSchema.index({
  student: 1,
  mode: 1,
  generatedAt: -1,
});

const UniversityRecommendation = mongoose.model(
  "UniversityRecommendation",
  UniversityRecommendationSchema
);

export default UniversityRecommendation;
