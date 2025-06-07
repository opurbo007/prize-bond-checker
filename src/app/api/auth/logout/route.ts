import { NextResponse } from "next/server";

export async function POST() {
  try {
    const cookie = `auth_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict; ${
      process.env.NODE_ENV === "production" ? "Secure;" : ""
    }`;

    const res = NextResponse.json({ message: "Logout successful" });
    res.headers.set("Set-Cookie", cookie);

    return res;
  } catch (err) {
    return NextResponse.json({ message: "Logout failed" }, { status: 500 });
  }
}
