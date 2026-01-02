import { StoreRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireStoreMembership } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function ActivityPage(props: { params: Promise<{ storeSlug: string }> }) {
  const { storeSlug } = await props.params;
  const ctx = await requireStoreMembership(storeSlug, StoreRole.VIEWER);

  const logs = await prisma.activityLog.findMany({
    where: { storeId: ctx.storeId },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      type: true,
      entityType: true,
      entityId: true,
      createdAt: true,
      actor: { select: { email: true, name: true } },
    },
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <h1 className="text-lg font-semibold">Activity log</h1>
      <p className="mt-1 text-sm text-zinc-600">All key actions inside this store.</p>

      <div className="mt-4 grid gap-2 text-sm">
        {logs.length === 0 ? (
          <div className="text-zinc-600">No activity yet.</div>
        ) : (
          logs.map((l) => (
            <div key={l.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-200 px-3 py-2">
              <div className="font-medium">{l.type}</div>
              <div className="text-xs text-zinc-500">
                {l.actor?.email || "System"} • {l.createdAt.toISOString()}
                {l.entityType ? ` • ${l.entityType}:${l.entityId}` : ""}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


