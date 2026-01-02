import Link from "next/link";
import type { CSSProperties } from "react";
import { prisma } from "@/lib/db";
import { t, type PublicLocale } from "@/lib/i18n";
import { sendStoreMessageAction } from "@/app/_actions/public";
import { TrackStoreVisit } from "@/app/store/[slug]/track";

export const dynamic = "force-dynamic";

function formatMoney(currency: string, cents: number) {
  const amount = (cents / 100).toFixed(2);
  return `${amount} ${currency}`;
}

function resolveLocale(input: string | null | undefined, enableArabic: boolean, defaultLocale: "EN" | "AR"): PublicLocale {
  if (!enableArabic) return "en";
  if (input === "ar") return "ar";
  if (input === "en") return "en";
  return defaultLocale === "AR" ? "ar" : "en";
}

export default async function StorePage(props: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ q?: string; lang?: string; sent?: string }>;
}) {
  const { slug } = await props.params;
  const sp = (await props.searchParams) ?? {};

  const store = await prisma.store.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      settings: { select: { enableArabic: true, defaultLocale: true, primaryColor: true, fontFamily: true, layoutStyle: true } },
    },
  });
  if (!store) return <div className="p-8 text-sm text-zinc-600">Store not found.</div>;

  const locale = resolveLocale(sp.lang, store.settings?.enableArabic ?? false, store.settings?.defaultLocale ?? "EN");
  const tr = t(locale);
  const dir = locale === "ar" ? "rtl" : "ltr";

  const q = (sp.q || "").trim();
  const products = await prisma.product.findMany({
    where: {
      storeId: store.id,
      isActive: true,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, currency: true, originalPrice: true, discountedPrice: true, discountEnabled: true },
  });

  const primary = store.settings?.primaryColor ?? "#2563eb";
  const font = store.settings?.fontFamily ?? "system-ui";
  const style: CSSProperties & Record<string, string> = {
    fontFamily: font,
    ["--primary"]: primary,
  };

  const langToggleHref =
    locale === "ar"
      ? `/store/${store.slug}?lang=en`
      : `/store/${store.slug}?lang=ar`;

  return (
    <div dir={dir} style={style}>
      <TrackStoreVisit slug={store.slug} />

      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-5">
          <div>
            <div className="text-sm text-zinc-600">{tr.products}</div>
            <h1 className="text-xl font-semibold">{store.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            {store.settings?.enableArabic ? (
              <Link className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50" href={langToggleHref}>
                {locale === "ar" ? "English" : "العربية"}
              </Link>
            ) : null}
            <Link className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50" href="/">
              Platform
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-6 py-8">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5">
          <form className="flex flex-wrap items-center gap-3" method="get">
            <input type="hidden" name="lang" value={locale} />
            <input
              name="q"
              defaultValue={q}
              placeholder={tr.search}
              className="w-full max-w-sm rounded-lg border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900/20"
            />
            <button className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white">
              {tr.search}
            </button>
          </form>
        </section>

        <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {products.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
              No products.
            </div>
          ) : (
            products.map((p) => (
              <Link
                key={p.id}
                href={`/store/${store.slug}/product/${p.id}?lang=${locale}`}
                className="group rounded-2xl border border-zinc-200 bg-white p-5 hover:border-zinc-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="font-semibold">{p.name}</div>
                  {p.discountEnabled && p.discountedPrice != null ? (
                    <span className="rounded-full bg-red-600 px-2 py-1 text-xs font-semibold text-white">
                      {tr.sale}
                    </span>
                  ) : null}
                </div>
                <div className="mt-3 text-sm">
                  {p.discountEnabled && p.discountedPrice != null ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500 line-through">
                        {formatMoney(p.currency, p.originalPrice)}
                      </span>
                      <span className="text-base font-semibold">
                        {formatMoney(p.currency, p.discountedPrice)}
                      </span>
                    </div>
                  ) : (
                    <div className="text-base font-semibold">
                      {formatMoney(p.currency, p.originalPrice)}
                    </div>
                  )}
                </div>
                <div className="mt-4 text-sm font-medium text-[var(--primary)] group-hover:underline">
                  View
                </div>
              </Link>
            ))
          )}
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold">{tr.messageUs}</h2>
          {sp.sent === "1" ? (
            <div className="mt-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
              {tr.sent}
            </div>
          ) : null}

          <form className="mt-4 grid gap-3" action={sendStoreMessageAction}>
            <input type="hidden" name="slug" value={store.slug} />
            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-1 text-sm">
                <span className="font-medium">{tr.name}</span>
                <input name="name" required className="rounded-lg border border-zinc-200 px-3 py-2" />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium">{tr.email}</span>
                <input name="email" type="email" required className="rounded-lg border border-zinc-200 px-3 py-2" />
              </label>
            </div>
            <label className="grid gap-1 text-sm">
              <span className="font-medium">{tr.phone}</span>
              <input name="phone" className="rounded-lg border border-zinc-200 px-3 py-2" />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium">{tr.message}</span>
              <textarea name="message" rows={4} required className="rounded-lg border border-zinc-200 px-3 py-2" />
            </label>
            <button className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white">
              {tr.send}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}


