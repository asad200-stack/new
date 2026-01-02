import Link from "next/link";
import { requireUserId } from "@/lib/tenant";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await requireUserId();
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });

  return (
    <div className="min-h-dvh">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link className="font-semibold" href="/dashboard">
            Dashboard
          </Link>
          <div className="flex items-center gap-4 text-sm text-zinc-600">
            <span>{user?.email}</span>
            <Link className="font-medium text-zinc-900 underline" href="/logout">
              Logout
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}


