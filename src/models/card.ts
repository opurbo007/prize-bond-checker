import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IPrizeBond {
  number: string;
  status: "hold" | "win" | "sell";
  purchaseDate: Date;
}

export interface ICard extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  prizeBonds: IPrizeBond[];
  totalWin: number;
  createdAt: Date;
  updatedAt: Date;
}

const PrizeBondSchema = new Schema<IPrizeBond>({
  number: { type: String, required: true },
  purchaseDate: { type: Date, required: true },
  status: { type: String, enum: ["hold", "win", "sell"], required: true },
});

const CardSchema = new Schema<ICard>(
  {
    name: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalWin: { type: Number, default: 0 },
    prizeBonds: [PrizeBondSchema],
  },
  { timestamps: true }
);

export const Card = models.Card || model<ICard>("Card", CardSchema);
