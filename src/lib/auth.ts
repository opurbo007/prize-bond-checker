import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export interface UserPayload {
  id: string;
  email: string;
  name?: string;
}

export async function getUserFromCookie(): Promise<UserPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    // console.log("Token from cookie:", token);

    if (!token) return null;

    const { payload } = await jwtVerify(token, secret);

    return {
      id: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string | undefined,
    };
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}
