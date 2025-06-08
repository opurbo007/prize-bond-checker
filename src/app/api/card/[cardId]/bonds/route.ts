import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserFromCookie } from "@/lib/auth";
import { Card } from "@/models/card";
import { ApiError } from "@/lib/ApiError";
import { ApiResponse } from "@/lib/ApiResponse";
import { PrizeBond } from "@/lib/types";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ cardId: string }> }
) {
  try {
    await connectDB();

    const user = await getUserFromCookie();
    if (!user) throw new ApiError(401, "Unauthorized");

    const { cardId } = await context.params;
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
        (b: PrizeBond) => b.status !== "sell" && b.status !== "win"
      ).length,
      totalWin: updatedCard.prizeBonds.filter(
        (b: PrizeBond) => b.status === "win"
      ).length,
    };

    return NextResponse.json(
      new ApiResponse(200, { card: cardWithCounts }, "Bond added")
    );
  } catch (error) {
    console.error("POST /api/card/[cardId]/bonds - error:", error);
    const statusCode = error instanceof ApiError ? error.statusCode : 500;
    const message =
      error instanceof ApiError ? error.message : "Internal Server Error";

    return NextResponse.json(new ApiResponse(statusCode, null, message), {
      status: statusCode,
    });
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ cardId: string }> }
) {
  try {
    await connectDB();

    const cardId = (await context.params).cardId;

    console.log("GET - cardId:", cardId);

    const card = await Card.findById(cardId).select("name prizeBonds");

    if (!card) {
      return NextResponse.json({ message: "Card not found" }, { status: 404 });
    }

    return NextResponse.json({ data: { card } });
  } catch (err) {
    console.error("GET bond error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
