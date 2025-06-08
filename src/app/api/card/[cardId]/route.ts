import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Card } from "@/models/card";
import { getUserFromCookie } from "@/lib/auth";
import { ApiResponse } from "@/lib/ApiResponse";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ cardId: string }> }
) {
  try {
    await connectDB();
    const { cardId } = await context.params;
    const user = await getUserFromCookie();
    if (!user) {
      return NextResponse.json(new ApiResponse(401, null, "Unauthorized"), {
        status: 401,
      });
    }

    const card = await Card.findOneAndDelete({
      _id: cardId,
      userId: user.id,
    });

    if (!card) {
      return NextResponse.json(
        new ApiResponse(404, null, "Card not found or unauthorized"),
        { status: 404 }
      );
    }

    return NextResponse.json(new ApiResponse(200, { message: "Card deleted" }));
  } catch (error) {
    console.error("DELETE /api/card/:cardId error:", error);
    return NextResponse.json(
      new ApiResponse(500, null, "Failed to delete card"),
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ cardId: string }> }
) {
  try {
    await connectDB();
    const { cardId } = await context.params;
    const user = await getUserFromCookie();
    if (!user) {
      return NextResponse.json(new ApiResponse(401, {}, "Unauthorized"), {
        status: 401,
      });
    }

    const { name } = await req.json();
    if (!name) {
      return NextResponse.json(new ApiResponse(400, {}, "Name is required"), {
        status: 400,
      });
    }

    const updated = await Card.findOneAndUpdate(
      { _id: cardId, userId: user.id },
      { name },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(new ApiResponse(404, {}, "Card not found"), {
        status: 404,
      });
    }

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
