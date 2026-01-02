import Link from "next/link";
import { StoreRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireStoreMembership } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function ProductsPage(props: { params: Promise<{ storeSlug: string }> }) {
  const { storeSlug } = await props.params;
  const ctx = await requireStoreMembership(storeSlug, StoreRole.VIEWER);

  const products = await prisma.product.findMany({
    where: { storeId: ctx.storeId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      sku: true,
      currency: true,
      originalPrice: true,
      discountedPrice: true,
      discountEnabled: true,
      isActive: true,
      stockQty: true,
    },
  });

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Products</h1>
        <Link
          className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          href={`/dashboard/${ctx.storeSlug}/products/new`}
        >
          New product
        </Link>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4">
        <div className="grid gap-2">
          {products.length === 0 ? (
            <div className="text-sm text-zinc-600">No products yet.</div>
          ) : (
            products.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-zinc-500">
                    SKU: {p.sku || "—"} • Stock: {p.stockQty} • {p.isActive ? "Active" : "Hidden"}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <PricePreview
                    currency={p.currency}
                    original={p.originalPrice}
                    discounted={p.discountedPrice}
                    enabled={p.discountEnabled}
                  />
                  <Link className="text-sm font-medium underline" href={`/dashboard/${ctx.storeSlug}/products/${p.id}/edit`}>
                    Edit
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function formatMoney(currency: string, cents: number) {
  const amount = (cents / 100).toFixed(2);
  return `${amount} ${currency}`;
}

function PricePreview(props: { currency: string; original: number; discounted: number | null; enabled: boolean }) {
  if (!props.enabled || props.discounted == null) {
    return <div className="text-sm font-medium">{formatMoney(props.currency, props.original)}</div>;
  }

  return (
    <div className="text-right text-sm">
      <div className="text-xs text-zinc-500 line-through">{formatMoney(props.currency, props.original)}</div>
      <div className="font-semibold">{formatMoney(props.currency, props.discounted)}</div>
    </div>
  );
}


