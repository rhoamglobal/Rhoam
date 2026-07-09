import { redirect } from "next/navigation";
import { getAuthenticatedUser, isAdminUser } from "@/lib/supabaseServer";

// This runs on the server, before any /admin page (or its data) ever
// reaches the browser. It replaces relying only on the client-side
// AdminRoute component, which:
//   1. can only hide UI after the page has already loaded client-side, and
//   2. wasn't even applied to every admin page (add-property and the
//      properties list had no gate at all).
// RLS on your Supabase tables is still the real backstop for direct
// database access, but this closes the page/route-level gap.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const admin = await isAdminUser(user.id);

  if (!admin) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
        <p className="text-gray-500">You are not an administrator.</p>
      </div>
    );
  }

  return <>{children}</>;
}
