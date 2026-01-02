import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  const userId = await requireUserId();

  const memberships = await prisma.storeMembership.findMany({
    where: { userId },
    select: {
      role: true,
      store: { select: { id: true, name: true, slug: true, createdAt: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Your stores</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Each store has isolated data and its own public link.
          </p>
        </div>
        <Link
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          href="/dashboard/new-store"
        >
          New store
        </Link>
      </div>

      <div className="grid gap-3">
        {memberships.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
            No stores yet. Create your first store.
          </div>
        ) : (
          memberships.map((m) => (
            <div
              key={m.store.id}
              className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-5"
            >
              <div>
                <div className="font-medium">{m.store.name}</div>
                <div className="mt-1 text-xs text-zinc-500">
                  Role: {m.role} • Public: <code>/store/{m.store.slug}</code>
                </div>
              </div>
              <div className="flex gap-3">
                <Link
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50"
                  href={`/store/${m.store.slug}`}
                >
                  View store
                </Link>
                <Link
                  className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                  href={`/dashboard/${m.store.slug}`}
                >
                  Manage
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


