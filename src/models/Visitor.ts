import mongoose, { Schema, Document } from "mongoose";

export interface IVisitor extends Document {
  ip: string;
  country: string;
  date: string; // YYYY-MM-DD
}

const visitorSchema: Schema = new Schema(
  {
    ip: { type: String, required: true },
    country: { type: String, required: true },
    date: { type: String, required: true },
  },
  { timestamps: true }
);

// 🔒 One IP → One Visit → Per Day
visitorSchema.index({ ip: 1, date: 1 }, { unique: true });

export const Visitor =
  mongoose.models.Visitor ||
  mongoose.model<IVisitor>("Visitor", visitorSchema);
