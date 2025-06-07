import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Card } from "@/models/card";
import { getUserFromCookie } from "@/lib/auth";
import { ApiError } from "@/lib/ApiError";
import { ApiResponse } from "@/lib/ApiResponse";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const user = await getUserFromCookie();
    if (!user) throw new ApiError(401, "Unauthorized");

    const cards = await Card.find({ userId: user.id }).lean();

    const cardsWithStats = cards.map((card) => {
      const heldBonds = card.prizeBonds.filter(
        (bond: any) => bond.status === "hold"
      );
      const winBonds = card.prizeBonds.filter(
        (bond: any) => bond.status === "win"
      );

      return {
        _id: card._id,
        name: card.name,
        prizeBonds: card.prizeBonds,
        totalBond: heldBonds.length,
        totalWin: winBonds.length,
      };
    });

    return NextResponse.json(new ApiResponse(200, { cards: cardsWithStats }), {
      status: 200,
    });
  } catch (error) {
    console.error("GET /api/cards error:", error);
    throw new ApiError(500, "Internal Server Error");
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const user = await getUserFromCookie();
    if (!user) throw new ApiError(401, "Unauthorized");

    const body = await req.json();
    const { name } = body;

    if (!name || name.trim() === "") {
      throw new ApiError(400, "Card name is required");
    }

    const newCard = await Card.create({
      name,
      userId: user.id,
      totalWin: 0,
      prizeBonds: [],
    });

    return NextResponse.json(
      new ApiResponse(201, { card: newCard }, "Card created"),
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/cards error:", error);
    throw new ApiError(500, "Internal Server Error");
  }
}
