// app/lib/loginActions.ts
"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { DatabaseError, safeQuery } from "../db";
import { LoginUser } from "../types/loginTypes";

export async function getUser(email: string): Promise<LoginUser | undefined> {
  try {
    const sql = `
      SELECT TOP 1
      u.id,
        u.email,
        u.password,
        u.role
      FROM [User] u
      WHERE u.email = @p1`;

    const { rows } = await safeQuery<LoginUser>(sql, [email]);
    return rows[0];
  } catch (error) {
    if (error instanceof DatabaseError) throw error;
    console.error("Failed to fetch user:", error);
    throw error;
  }
}

export async function authenticate(_state: unknown, formData: FormData) {
  try {
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));

    let user;
    try {
      user = await getUser(email);
    } catch (err) {
      if (err instanceof DatabaseError) {
        return (
          err.message ??
          "Our authentication service is temporarily unavailable. Please try again later."
        );
      }
      throw err;
    }

    if (!user) return "Invalid credentials.";

    if (!user.password) {
      return "Your account is not fully set up. Please check your email for the activation link or contact your supervisor.";
    }

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (!res.error) redirect("/admin");
  } catch (error) {
    if (error instanceof AuthError) {
      return error.type === "CredentialsSignin"
        ? "Invalid credentials. Please try again."
        : "Something went wrong.";
    }
    throw error;
  }
}
