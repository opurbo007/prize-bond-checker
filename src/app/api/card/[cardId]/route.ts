import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Card } from "@/models/card";
import { getUserFromCookie } from "@/lib/auth";
import { ApiError } from "@/lib/ApiError";
import { ApiResponse } from "@/lib/ApiResponse";

export async function DELETE({ params }: { params: { cardId: string } }) {
  try {
    await connectDB();

    const user = await getUserFromCookie();
    if (!user) throw new ApiError(401, "Unauthorized");

    const card = await Card.findOneAndDelete({
      _id: params.cardId,
      userId: user.id,
    });

    if (!card) throw new ApiError(404, "Card not found or unauthorized");

    return NextResponse.json(new ApiResponse(200, { message: "Card deleted" }));
  } catch (error) {
    console.error("DELETE /api/card/:cardId error:", error);
    throw new ApiError(500, "Failed to delete card");
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { cardId: string } }
) {
  try {
    await connectDB();

    const user = await getUserFromCookie();
    if (!user)
      return NextResponse.json(new ApiResponse(401, {}, "Unauthorized"), {
        status: 401,
      });

    const { name } = await req.json();
    if (!name)
      return NextResponse.json(new ApiResponse(400, {}, "Name is required"), {
        status: 400,
      });

    const updated = await Card.findOneAndUpdate(
      { _id: params.cardId, userId: user.id },
      { name },
      { new: true }
    );

    if (!updated)
      return NextResponse.json(new ApiResponse(404, {}, "Card not found"), {
        status: 404,
      });

    return NextResponse.json(
      new ApiResponse(200, { card: updated }, "Card updated")
    );
  } catch (err) {
    console.error("PATCH /api/card/:id error:", err);
    return NextResponse.json(
      new ApiResponse(500, {}, "Internal Server Error"),
      { status: 500 }
    );
  }
}
