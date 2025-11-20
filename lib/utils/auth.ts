import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const getJWTSecret = (): string => {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    throw new Error(
      "Please define the ADMIN_JWT_SECRET environment variable inside .env.local"
    );
  }
  return secret;
};

export interface JWTPayload {
  email: string;
  userId: string;
}

export const signToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, getJWTSecret(), { expiresIn: "7d" });
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, getJWTSecret()) as JWTPayload;
  } catch (error) {
    return null;
  }
};

export const setAuthCookie = async (token: string): Promise<void> => {
  try {
    const cookieStore = await cookies();
    cookieStore.set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
  } catch (error) {
    // Silently fail - cookies can only be set in Server Components or Route Handlers
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("admin-token")?.value || null;
  } catch (error) {
    return null;
  }
};

export const removeAuthCookie = async (): Promise<void> => {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("admin-token");
  } catch (error) {
    // Silently fail
  }
};

export const verifyAuth = async (): Promise<JWTPayload | null> => {
  const token = await getAuthToken();
  if (!token) return null;
  return verifyToken(token);
};
