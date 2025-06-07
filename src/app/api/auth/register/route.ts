import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import { registerSchema } from "@/lib/validator";
import { ApiError } from "@/lib/ApiError";
import { ApiResponse } from "@/lib/ApiResponse";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const errorArray =
        Object.values(parsed.error.flatten().fieldErrors).flat() || [];
      throw new ApiError(400, "Validation failed", errorArray);
    }

    const { name, email, password } = parsed.data;

    await connectDB();

    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new ApiError(400, "Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashedPassword });

    const response = new ApiResponse(
      201,
      { userId: user._id },
      "User registered"
    );

    return NextResponse.json(response, { status: response.statusCode });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(err, { status: err.statusCode });
    }

    console.error("Internal error 500", err);
    const internalError = new ApiError(500, "Internal server error");
    return NextResponse.json(internalError, { status: 500 });
  }
}
