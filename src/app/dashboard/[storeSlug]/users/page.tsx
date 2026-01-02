import { StoreRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireStoreMembership } from "@/lib/tenant";
import { CsrfInput } from "@/app/_components/CsrfInput";
import { addUserToStoreAction } from "@/app/_actions/users";

export const dynamic = "force-dynamic";

export default async function UsersPage(props: { params: Promise<{ storeSlug: string }> }) {
  const { storeSlug } = await props.params;
  const ctx = await requireStoreMembership(storeSlug, StoreRole.OWNER);

  const members = await prisma.storeMembership.findMany({
    where: { storeId: ctx.storeId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      role: true,
      user: { select: { email: true, name: true, createdAt: true } },
    },
  });

  return (
    <div className="grid gap-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h1 className="text-lg font-semibold">Users & roles</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Add existing users by email. Roles are store-scoped.
        </p>

        <form className="mt-5 grid gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4" action={addUserToStoreAction}>
          <CsrfInput />
          <input type="hidden" name="storeSlug" value={storeSlug} />

          <div className="grid gap-3 md:grid-cols-3">
            <label className="grid gap-1 text-sm md:col-span-2">
              <span className="font-medium">User email</span>
              <input
                name="email"
                type="email"
                required
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Role</span>
              <select name="role" defaultValue={StoreRole.VIEWER} className="rounded-lg border border-zinc-200 bg-white px-3 py-2">
                <option value={StoreRole.OWNER}>Owner</option>
                <option value={StoreRole.EDITOR}>Editor</option>
                <option value={StoreRole.VIEWER}>Viewer</option>
              </select>
            </label>
          </div>

          <button className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800">
            Add / update user
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="text-base font-semibold">Members</h2>
        <div className="mt-4 grid gap-2 text-sm">
          {members.map((m) => (
            <div key={m.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-200 px-3 py-2">
              <div>
                <div className="font-medium">{m.user.name}</div>
                <div className="text-xs text-zinc-500">{m.user.email}</div>
              </div>
              <div className="text-xs font-medium text-zinc-600">{m.role}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


