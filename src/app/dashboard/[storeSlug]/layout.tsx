import Link from "next/link";
import { StoreRole } from "@prisma/client";
import { requireStoreMembership } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export default async function StoreDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  const ctx = await requireStoreMembership(storeSlug, StoreRole.VIEWER);

  const items = [
    { href: `/dashboard/${ctx.storeSlug}`, label: "Overview" },
    { href: `/dashboard/${ctx.storeSlug}/products`, label: "Products" },
    { href: `/dashboard/${ctx.storeSlug}/media`, label: "Media" },
    { href: `/dashboard/${ctx.storeSlug}/messages`, label: "Messages" },
    { href: `/dashboard/${ctx.storeSlug}/activity`, label: "Activity" },
    { href: `/dashboard/${ctx.storeSlug}/settings`, label: "Settings" },
    { href: `/dashboard/${ctx.storeSlug}/users`, label: "Users" },
  ];

  return (
    <div className="grid gap-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm text-zinc-600">Store</div>
            <div className="text-lg font-semibold">
              {ctx.storeName}{" "}
              <span className="text-sm font-medium text-zinc-500">
                ({ctx.role})
              </span>
            </div>
            <div className="mt-1 text-xs text-zinc-500">
              Public link: <code>/store/{ctx.storeSlug}</code>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {items.map((it) => (
              <Link
                key={it.href}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50"
                href={it.href}
              >
                {it.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}


