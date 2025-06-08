import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromCookie } from "@/lib/auth";
import { Card } from "@/models/card";
import { ApiError } from "@/lib/ApiError";
import { ApiResponse } from "@/lib/ApiResponse";

export async function POST(
  req: NextRequest,
  { params }: { params: { cardId: string } }
) {
  try {
    await connectDB();

    const user = await getUserFromCookie();
    if (!user) throw new ApiError(401, "Unauthorized");

    const cardId = params.cardId;
    const { number } = await req.json();

    if (!number) throw new ApiError(400, "Bond number is required");

    const updatedCard = await Card.findOneAndUpdate(
      { _id: cardId, userId: user.id },
      {
        $push: {
          prizeBonds: {
            number,
            purchaseDate: new Date(),
            status: "hold",
          },
        },
      },
      { new: true }
    );

    if (!updatedCard) throw new ApiError(404, "Card not found");
    const cardWithCounts = {
      ...updatedCard.toObject(),
      totalBond: updatedCard.prizeBonds.filter(
        // @typescript-eslint/no-explicit-any
        (b: any) => b.status !== "sell" && b.status !== "win"
      ).length,
      // @typescript-eslint/no-explicit-any
      totalWin: updatedCard.prizeBonds.filter((b: any) => b.status === "win")
        .length,
    };
    return NextResponse.json(
      new ApiResponse(200, { card: cardWithCounts }, "Bond added")
    );
  } catch (error) {
    console.error("Bond adding error:", error);
    return NextResponse.json(
      new ApiResponse(500, null, "Internal Server Error"),
      { status: 500 }
    );
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { cardId: string } }
) {
  try {
    await connectDB();
    const card = await Card.findById(params.cardId).select("name prizeBonds");

    console.log("GET /api/card/[id]/bond - card:", card);
    if (!card) {
      return NextResponse.json({ message: "Card not found" }, { status: 404 });
    }

    return NextResponse.json({ data: { card } });
  } catch (err) {
    console.error("GET bond error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
