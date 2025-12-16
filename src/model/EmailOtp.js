import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const emailOtpSchema = new Schema(
  {
    // Email to verify (pre-signup)
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'],
    },

    // The 6-digit code (store as string to keep leading zeros)
    otp: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 6,
      trim: true,
      index: true,
    },

    // Has the code been consumed?
    isUsed: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Absolute expiry time (used for TTL index)
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
    versionKey: false,
    collection: 'email_otps',
  }
);

// TTL index: document auto-deletes once expiresAt is reached
emailOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Helpful compound index for common lookup: find active code for an email
emailOtpSchema.index({ email: 1, isUsed: 1, expiresAt: 1 });

// (Optional) Prevent too many active OTPs per email (soft-convention via code).
// If you want DB-level constraint for uniqueness of active OTPs,
// consider a partial index (MongoDB >= 3.2):
// emailOtpSchema.index(
//   { email: 1, isUsed: 1 },
//   { unique: true, partialFilterExpression: { isUsed: false } }
// );

// ---- Convenience helpers (optional but handy) ----

// Create an OTP that expires in `ttlSeconds` (default 5 minutes)
emailOtpSchema.statics.createForEmail = function (email, otp, ttlSeconds = 300) {
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
  return this.create({ email, otp, expiresAt });
};

// Verify & consume an OTP atomically
emailOtpSchema.statics.verify = async function (email, otp) {
  const doc = await this.findOneAndUpdate(
    {
      email: email.toLowerCase().trim(),
      otp,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    },
    { $set: { isUsed: true } },
    { new: true }
  );
  return Boolean(doc);
};

const EmailOtp = model('EmailOtp', emailOtpSchema);
export default EmailOtp;
