import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Card } from "@/models/card";
import { getUserFromCookie } from "@/lib/auth";
import { PrizeBond } from "@/lib/types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function DELETE(
  _: NextRequest,
  {
    params,
  }: {
    params: { cardId: string; bondId: string };
  }
) {
  await connectDB();

  try {
    const card = await Card.findById(params.cardId);
    if (!card) {
      return NextResponse.json({ message: "Card not found" }, { status: 404 });
    }

    card.prizeBonds = card.prizeBonds.filter(
      (bond: PrizeBond) => bond._id.toString() !== params.bondId
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
  { params }: { params: { cardId: string; bondId: string } }
) {
  try {
    await connectDB();
    const user = await getUserFromCookie();
    if (!user)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { number, purchaseDate, status } = await req.json();

    const card = await Card.findOneAndUpdate(
      {
        _id: params.cardId,
        userId: user.id,
        "prizeBonds._id": params.bondId,
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

    if (!card)
      return NextResponse.json({ message: "Bond not found" }, { status: 404 });

    return NextResponse.json({ message: "Bond updated", card });
  } catch (err) {
    console.error("PUT /api/card/:cardId/bond/:bondId", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
