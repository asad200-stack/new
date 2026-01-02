import { createStoreAction } from "@/app/_actions/store";
import { CsrfInput } from "@/app/_components/CsrfInput";

export default function NewStorePage() {
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-xl font-semibold">Create store</h1>
      <p className="mt-1 text-sm text-zinc-600">
        This creates a new isolated tenant with its own public link.
      </p>

      <form className="mt-6 grid gap-3 rounded-2xl border border-zinc-200 bg-white p-6" action={createStoreAction}>
        <CsrfInput />

        <label className="grid gap-1 text-sm">
          <span className="font-medium">Store name</span>
          <input
            name="name"
            required
            className="rounded-lg border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900/20"
            placeholder="My Store"
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="font-medium">Store slug (optional)</span>
          <input
            name="slug"
            className="rounded-lg border border-zinc-200 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-900/20"
            placeholder="my-store"
          />
          <span className="text-xs text-zinc-500">
            Public link: <code>/store/&lt;slug&gt;</code>
          </span>
        </label>

        <button className="mt-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800">
          Create store
        </button>
      </form>
    </div>
  );
}


