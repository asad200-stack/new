import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-10 px-6 py-12">
      <header className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-zinc-600">
            Multi-Tenant SaaS Store Platform
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Platform</h1>
        </div>
        <div className="flex gap-3">
          <Link
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
            href="/login"
          >
            Login
          </Link>
          <Link
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            href="/register"
          >
            Create account
          </Link>
        </div>
      </header>

      <main className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Dashboard (English)</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Manage your store(s): products, media, messages, insights, settings,
            roles.
          </p>
          <div className="mt-4">
            <Link
              className="inline-flex rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              href="/dashboard"
            >
              Go to dashboard
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Public store</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Customers can browse products, search/filter, switch language (EN/AR
            optional), and send messages — without any admin access.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
              href="/store/demo-store"
            >
              Open demo store
            </Link>
            <span className="self-center text-xs text-zinc-500">
              (works after you run seed)
            </span>
          </div>
        </section>
      </main>

      <footer className="text-xs text-zinc-500">
        Ready for Railway: uses <code>DATABASE_URL</code> +{" "}
        <code>JWT_SECRET</code> and runs <code>prisma migrate deploy</code> on
        start.
      </footer>
    </div>
  );
}
