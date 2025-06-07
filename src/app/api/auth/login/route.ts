import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import { ApiError } from "@/lib/ApiError";
import { ApiResponse } from "@/lib/ApiResponse";
import { loginSchema } from "@/lib/validator";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      const errorArray =
        Object.values(parsed.error.flatten().fieldErrors).flat() || [];
      throw new ApiError(400, "Validation failed", errorArray);
    }

    const { email, password } = parsed.data;

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(400, "Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(400, "Invalid email or password");
    }

    //  Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    //  Create cookie
    const cookie = serialize("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Set cookie
    const res = NextResponse.json(
      new ApiResponse(200, { userId: user._id }, "Login successful")
    );
    res.headers.set("Set-Cookie", cookie);

    return res;
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(err, { status: err.statusCode });
    }

    const internalError = new ApiError(500, "Internal server error");
    return NextResponse.json(internalError, { status: 500 });
  }
}
