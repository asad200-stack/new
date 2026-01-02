import { StoreRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireStoreMembership } from "@/lib/tenant";
import { updateProductAction } from "@/app/_actions/products";
import { CsrfInput } from "@/app/_components/CsrfInput";

function formatMoneyInput(cents: number | null) {
  if (cents == null) return "";
  return (cents / 100).toFixed(2);
}

export default async function EditProductPage(props: {
  params: Promise<{ storeSlug: string; productId: string }>;
}) {
  const { storeSlug, productId } = await props.params;
  const ctx = await requireStoreMembership(storeSlug, StoreRole.EDITOR);

  const product = await prisma.product.findFirst({
    where: { id: productId, storeId: ctx.storeId },
    select: {
      id: true,
      name: true,
      description: true,
      specs: true,
      sku: true,
      currency: true,
      originalPrice: true,
      discountedPrice: true,
      discountEnabled: true,
      stockQty: true,
      isActive: true,
    },
  });

  if (!product) return <div className="text-sm text-zinc-600">Not found.</div>;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-lg font-semibold">Edit product</h1>

      <form className="mt-4 grid gap-4 rounded-2xl border border-zinc-200 bg-white p-6" action={updateProductAction}>
        <CsrfInput />
        <input type="hidden" name="storeSlug" value={storeSlug} />
        <input type="hidden" name="productId" value={product.id} />

        <Field label="Name">
          <input name="name" required defaultValue={product.name} className="w-full rounded-lg border border-zinc-200 px-3 py-2" />
        </Field>

        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Currency">
            <input name="currency" defaultValue={product.currency} className="w-full rounded-lg border border-zinc-200 px-3 py-2" />
          </Field>
          <Field label="SKU (optional)">
            <input name="sku" defaultValue={product.sku ?? ""} className="w-full rounded-lg border border-zinc-200 px-3 py-2" />
          </Field>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Original Price">
            <input
              name="originalPrice"
              required
              defaultValue={formatMoneyInput(product.originalPrice)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2"
            />
          </Field>
          <Field label="Stock Qty">
            <input
              name="stockQty"
              type="number"
              min={0}
              defaultValue={product.stockQty}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2"
            />
          </Field>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Discounted Price (optional)">
            <input
              name="discountedPrice"
              defaultValue={formatMoneyInput(product.discountedPrice)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2"
            />
          </Field>
          <div className="grid gap-2 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="discountEnabled" defaultChecked={product.discountEnabled} />
              <span className="font-medium">Enable discount</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="isActive" defaultChecked={product.isActive} />
              <span className="font-medium">Active (visible)</span>
            </label>
          </div>
        </div>

        <Field label="Description (optional)">
          <textarea name="description" rows={4} defaultValue={product.description ?? ""} className="w-full rounded-lg border border-zinc-200 px-3 py-2" />
        </Field>

        <Field label="Specs (optional)">
          <textarea name="specs" rows={4} defaultValue={product.specs ?? ""} className="w-full rounded-lg border border-zinc-200 px-3 py-2" />
        </Field>

        <button className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800">
          Save
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}


