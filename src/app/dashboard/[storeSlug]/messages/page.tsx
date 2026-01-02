import { StoreRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireStoreMembership } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function MessagesPage(props: { params: Promise<{ storeSlug: string }> }) {
  const { storeSlug } = await props.params;
  const ctx = await requireStoreMembership(storeSlug, StoreRole.VIEWER);

  const messages = await prisma.message.findMany({
    where: { storeId: ctx.storeId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      content: true,
      createdAt: true,
      customer: { select: { name: true, email: true, phone: true } },
    },
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <h1 className="text-lg font-semibold">Messages</h1>
      <p className="mt-1 text-sm text-zinc-600">Customer inquiries from the public store.</p>

      <div className="mt-4 grid gap-2 text-sm">
        {messages.length === 0 ? (
          <div className="text-zinc-600">No messages yet.</div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="rounded-lg border border-zinc-200 px-3 py-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-medium">{m.customer.name}</div>
                <div className="text-xs text-zinc-500">{m.createdAt.toISOString()}</div>
              </div>
              <div className="mt-1 text-xs text-zinc-500">
                {m.customer.email}
                {m.customer.phone ? ` • ${m.customer.phone}` : ""}
              </div>
              <div className="mt-2 whitespace-pre-wrap text-sm">{m.content}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


