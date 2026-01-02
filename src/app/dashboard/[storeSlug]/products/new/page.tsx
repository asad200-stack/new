import { StoreRole } from "@prisma/client";
import { CsrfInput } from "@/app/_components/CsrfInput";
import { createProductAction } from "@/app/_actions/products";
import { requireStoreMembership } from "@/lib/tenant";

export default async function NewProductPage(props: { params: Promise<{ storeSlug: string }> }) {
  const { storeSlug } = await props.params;
  await requireStoreMembership(storeSlug, StoreRole.EDITOR);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-lg font-semibold">New product</h1>

      <form className="mt-4 grid gap-4 rounded-2xl border border-zinc-200 bg-white p-6" action={createProductAction}>
        <CsrfInput />
        <input type="hidden" name="storeSlug" value={storeSlug} />

        <Field label="Name">
          <input name="name" required className="w-full rounded-lg border border-zinc-200 px-3 py-2" />
        </Field>

        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Currency">
            <input name="currency" defaultValue="USD" className="w-full rounded-lg border border-zinc-200 px-3 py-2" />
          </Field>
          <Field label="SKU (optional)">
            <input name="sku" className="w-full rounded-lg border border-zinc-200 px-3 py-2" />
          </Field>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Original Price">
            <input name="originalPrice" required placeholder="129.99" className="w-full rounded-lg border border-zinc-200 px-3 py-2" />
          </Field>
          <Field label="Stock Qty">
            <input name="stockQty" type="number" min={0} defaultValue={0} className="w-full rounded-lg border border-zinc-200 px-3 py-2" />
          </Field>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Discounted Price (optional)">
            <input name="discountedPrice" placeholder="99.99" className="w-full rounded-lg border border-zinc-200 px-3 py-2" />
          </Field>
          <div className="grid gap-2 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="discountEnabled" />
              <span className="font-medium">Enable discount</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="isActive" defaultChecked />
              <span className="font-medium">Active (visible)</span>
            </label>
          </div>
        </div>

        <Field label="Description (optional)">
          <textarea name="description" rows={4} className="w-full rounded-lg border border-zinc-200 px-3 py-2" />
        </Field>

        <Field label="Specs (optional)">
          <textarea name="specs" rows={4} className="w-full rounded-lg border border-zinc-200 px-3 py-2" />
        </Field>

        <button className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800">
          Create product
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


