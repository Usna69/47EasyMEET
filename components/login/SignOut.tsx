"use server";

import { auth, signOut } from "@/auth";

export async function signOutAction() {
  const session = await auth();

  if (!session) return;

  await signOut({ redirectTo: "/" });
}
