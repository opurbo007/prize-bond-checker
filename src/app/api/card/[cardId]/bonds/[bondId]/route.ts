import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Card } from "@/models/card";
import { getUserFromCookie } from "@/lib/auth";
import { PrizeBond } from "@/lib/types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function DELETE(
  _req: NextRequest,
  context: { params: { cardId: string; bondId: string } }
) {
  try {
    await connectDB();

    const { cardId, bondId } = context.params;

    const card = await Card.findById(cardId);
    if (!card) {
      return NextResponse.json({ message: "Card not found" }, { status: 404 });
    }

    card.prizeBonds = card.prizeBonds.filter(
      (bond: PrizeBond) => bond._id.toString() !== bondId
    );

    await card.save();

    return NextResponse.json(
      { message: "Bond deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
export async function PUT(
  req: NextRequest,
  context: { params: { cardId: string; bondId: string } }
) {
  try {
    await connectDB();

    const user = await getUserFromCookie();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { cardId, bondId } = context.params;
    const { number, purchaseDate, status } = await req.json();

    const card = await Card.findOneAndUpdate(
      {
        _id: cardId,
        userId: user.id,
        "prizeBonds._id": bondId,
      },
      {
        $set: {
          "prizeBonds.$.number": number,
          "prizeBonds.$.purchaseDate": new Date(purchaseDate),
          "prizeBonds.$.status": status,
        },
      },
      { new: true }
    );

    if (!card) {
      return NextResponse.json({ message: "Bond not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Bond updated", card });
  } catch (err) {
    console.error("PUT /api/card/[cardId]/bonds/[bondId]", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
