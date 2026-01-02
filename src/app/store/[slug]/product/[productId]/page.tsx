import Link from "next/link";
import { headers } from "next/headers";
import type { CSSProperties } from "react";
import { prisma } from "@/lib/db";
import { t, type PublicLocale } from "@/lib/i18n";
import { TrackProductView } from "@/app/store/[slug]/track";
import { ShareButtons } from "./ShareButtons";

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

export default async function ProductPage(props: {
  params: Promise<{ slug: string; productId: string }>;
  searchParams?: Promise<{ lang?: string }>;
}) {
  const { slug, productId } = await props.params;
  const sp = (await props.searchParams) ?? {};

  const store = await prisma.store.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true, settings: { select: { enableArabic: true, defaultLocale: true, primaryColor: true, fontFamily: true } } },
  });
  if (!store) return <div className="p-8 text-sm text-zinc-600">Store not found.</div>;

  const locale = resolveLocale(sp.lang, store.settings?.enableArabic ?? false, store.settings?.defaultLocale ?? "EN");
  const tr = t(locale);
  const dir = locale === "ar" ? "rtl" : "ltr";

  const product = await prisma.product.findFirst({
    where: { id: productId, storeId: store.id, isActive: true },
    select: {
      id: true,
      name: true,
      description: true,
      specs: true,
      currency: true,
      originalPrice: true,
      discountedPrice: true,
      discountEnabled: true,
    },
  });
  if (!product) return <div className="p-8 text-sm text-zinc-600">Not found.</div>;

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const url = `${proto}://${host}/store/${store.slug}/product/${product.id}?lang=${locale}`;

  const primary = store.settings?.primaryColor ?? "#2563eb";
  const font = store.settings?.fontFamily ?? "system-ui";
  const style: CSSProperties & Record<string, string> = {
    fontFamily: font,
    ["--primary"]: primary,
  };

  return (
    <div dir={dir} style={style} className="min-h-dvh">
      <TrackProductView slug={store.slug} productId={product.id} />

      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-5">
          <div>
            <div className="text-sm text-zinc-600">{store.name}</div>
            <h1 className="text-xl font-semibold">{product.name}</h1>
          </div>
          <Link className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50" href={`/store/${store.slug}?lang=${locale}`}>
            {tr.back}
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-8 md:grid-cols-3">
        <section className="md:col-span-2 rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="text-sm text-zinc-600">{tr.price}</div>

          {product.discountEnabled && product.discountedPrice != null ? (
            <div className="mt-2 flex items-center gap-3">
              <span className="text-sm text-zinc-500 line-through">{formatMoney(product.currency, product.originalPrice)}</span>
              <span className="text-2xl font-semibold">{formatMoney(product.currency, product.discountedPrice)}</span>
              <span className="rounded-full bg-red-600 px-2 py-1 text-xs font-semibold text-white">{tr.sale}</span>
            </div>
          ) : (
            <div className="mt-2 text-2xl font-semibold">{formatMoney(product.currency, product.originalPrice)}</div>
          )}

          {product.description ? (
            <div className="mt-6">
              <div className="text-sm font-medium">Description</div>
              <div className="mt-2 whitespace-pre-wrap text-sm text-zinc-700">{product.description}</div>
            </div>
          ) : null}

          {product.specs ? (
            <div className="mt-6">
              <div className="text-sm font-medium">Specs</div>
              <div className="mt-2 whitespace-pre-wrap text-sm text-zinc-700">{product.specs}</div>
            </div>
          ) : null}
        </section>

        <aside className="rounded-2xl border border-zinc-200 bg-white p-6">
          <ShareButtons
            localeLabel={{ share: tr.share, whatsapp: tr.whatsapp, messenger: tr.messenger, copyLink: tr.copyLink }}
            url={url}
            text={product.name}
          />
        </aside>
      </main>
    </div>
  );
}


