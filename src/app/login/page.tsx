import Link from "next/link";
import { loginAction } from "@/app/_actions/auth";
import { CsrfInput } from "@/app/_components/CsrfInput";

export default async function LoginPage(props: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const sp = (await props.searchParams) ?? {};
  const next = sp.next ?? "/dashboard";

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-12">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h1 className="text-xl font-semibold">Login</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Sign in to manage your store.
        </p>

        <form className="mt-6 grid gap-3" action={loginAction}>
          <CsrfInput />
          <input type="hidden" name="next" value={next} />

          <label className="grid gap-1 text-sm">
            <span className="font-medium">Email</span>
            <input
              name="email"
              type="email"
              required
              className="rounded-lg border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900/20"
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="font-medium">Password</span>
            <input
              name="password"
              type="password"
              required
              className="rounded-lg border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900/20"
            />
          </label>

          <button className="mt-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800">
            Login
          </button>
        </form>

        <div className="mt-4 text-sm text-zinc-600">
          New here?{" "}
          <Link className="font-medium text-zinc-900 underline" href="/register">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}


