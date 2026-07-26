const mongoose = require("mongoose");

const hawanProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    hawan: { type: mongoose.Schema.Types.ObjectId, ref: "Hawan", required: true },
    guideRevision: { type: Date, default: null },
    selectedPurposeOfferingIds: [{ type: mongoose.Schema.Types.ObjectId }],
    saved: { type: Boolean, default: false },
    completedStepIds: [{ type: mongoose.Schema.Types.ObjectId }],
    readyMaterialIds: [{ type: mongoose.Schema.Types.ObjectId }],
    currentStepIndex: { type: Number, min: 0, default: 0 },
    mantraCounts: { type: Map, of: Number, default: {} },
    offeringCount: { type: Number, min: 0, default: 0 },
    language: { type: String, enum: ["hi-IN", "en-IN"], default: "hi-IN" },
    safetyConfirmedAt: { type: Date, default: null },
    startedAt: { type: Date, default: null },
    lastViewedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
    durationSeconds: { type: Number, min: 0, default: 0 },
    notes: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

hawanProgressSchema.index({ user: 1, hawan: 1 }, { unique: true });
hawanProgressSchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model("HawanProgress", hawanProgressSchema);
