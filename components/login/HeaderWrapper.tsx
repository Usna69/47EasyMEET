import { auth } from "@/auth";
import NavHeader from "../NavHeader";

export default async function HeaderWrapper() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  // Pass down the login flag and any needed user data
  return <NavHeader isLoggedIn={isLoggedIn} />;
}
