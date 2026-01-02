import Link from "next/link";
import { registerAction } from "@/app/_actions/auth";
import { CsrfInput } from "@/app/_components/CsrfInput";

export default function RegisterPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-12">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h1 className="text-xl font-semibold">Create account</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Create your owner account, then create your first store.
        </p>

        <form className="mt-6 grid gap-3" action={registerAction}>
          <CsrfInput />

          <label className="grid gap-1 text-sm">
            <span className="font-medium">Name</span>
            <input
              name="name"
              required
              className="rounded-lg border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900/20"
            />
          </label>

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
              minLength={8}
              className="rounded-lg border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900/20"
            />
          </label>

          <button className="mt-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800">
            Create account
          </button>
        </form>

        <div className="mt-4 text-sm text-zinc-600">
          Already have an account?{" "}
          <Link className="font-medium text-zinc-900 underline" href="/login">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}


