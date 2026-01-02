import { StoreRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireStoreMembership } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function StoreOverviewPage(props: {
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await props.params;
  const ctx = await requireStoreMembership(storeSlug, StoreRole.VIEWER);

  const stats =
    (await prisma.storeStat.findUnique({
      where: { storeId: ctx.storeId },
      select: { visitCount: true, productViewCount: true, messageCount: true, updatedAt: true },
    })) ?? { visitCount: 0, productViewCount: 0, messageCount: 0, updatedAt: new Date() };

  const topProducts = await prisma.product.findMany({
    where: { storeId: ctx.storeId },
    orderBy: { viewCount: "desc" },
    take: 5,
    select: { id: true, name: true, viewCount: true, isActive: true },
  });

  return (
    <div className="grid gap-6">
      <div className="grid gap-3 md:grid-cols-3">
        <StatCard label="Store visits" value={stats.visitCount} />
        <StatCard label="Product views" value={stats.productViewCount} />
        <StatCard label="Messages" value={stats.messageCount} />
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="text-base font-semibold">Top products</h2>
        <div className="mt-3 grid gap-2 text-sm">
          {topProducts.length === 0 ? (
            <div className="text-zinc-600">No products yet.</div>
          ) : (
            topProducts.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2">
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-zinc-500">
                  {p.viewCount} views • {p.isActive ? "Active" : "Hidden"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <div className="text-sm text-zinc-600">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}


