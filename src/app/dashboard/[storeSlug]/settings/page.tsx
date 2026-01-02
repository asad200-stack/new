import { StoreLayoutStyle, StoreLocale, StoreRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireStoreMembership } from "@/lib/tenant";
import { CsrfInput } from "@/app/_components/CsrfInput";
import { updateStoreSettingsAction } from "@/app/_actions/settings";

export const dynamic = "force-dynamic";

export default async function SettingsPage(props: { params: Promise<{ storeSlug: string }> }) {
  const { storeSlug } = await props.params;
  const ctx = await requireStoreMembership(storeSlug, StoreRole.OWNER);

  const settings = await prisma.storeSettings.findUnique({
    where: { storeId: ctx.storeId },
    select: {
      primaryColor: true,
      fontFamily: true,
      layoutStyle: true,
      enableArabic: true,
      defaultLocale: true,
    },
  });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <h1 className="text-lg font-semibold">Store settings</h1>
      <p className="mt-1 text-sm text-zinc-600">These settings affect the public store theme only.</p>

      <form className="mt-6 grid gap-4" action={updateStoreSettingsAction}>
        <CsrfInput />
        <input type="hidden" name="storeSlug" value={storeSlug} />

        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Primary color (hex)">
            <input
              name="primaryColor"
              defaultValue={settings?.primaryColor ?? "#2563eb"}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2"
            />
          </Field>
          <Field label="Font family">
            <input
              name="fontFamily"
              defaultValue={settings?.fontFamily ?? "system-ui"}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2"
            />
          </Field>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Layout style">
            <select name="layoutStyle" defaultValue={settings?.layoutStyle ?? StoreLayoutStyle.GRID} className="w-full rounded-lg border border-zinc-200 px-3 py-2">
              <option value={StoreLayoutStyle.GRID}>Grid</option>
              <option value={StoreLayoutStyle.CARDS}>Cards</option>
            </select>
          </Field>

          <Field label="Default language (public store)">
            <select name="defaultLocale" defaultValue={settings?.defaultLocale ?? StoreLocale.EN} className="w-full rounded-lg border border-zinc-200 px-3 py-2">
              <option value={StoreLocale.EN}>English</option>
              <option value={StoreLocale.AR}>Arabic</option>
            </select>
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="enableArabic" defaultChecked={settings?.enableArabic ?? false} />
          <span className="font-medium">Enable Arabic (RTL)</span>
        </label>

        <button className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800">
          Save settings
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


