import { StoreRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireStoreMembership } from "@/lib/tenant";
import { MediaUploader } from "./MediaUploader";

export const dynamic = "force-dynamic";

export default async function MediaPage(props: { params: Promise<{ storeSlug: string }> }) {
  const { storeSlug } = await props.params;
  const ctx = await requireStoreMembership(storeSlug, StoreRole.EDITOR);

  const files = await prisma.mediaFile.findMany({
    where: { storeId: ctx.storeId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, filename: true, key: true, sizeBytes: true, mimeType: true, createdAt: true },
  });

  return (
    <div className="grid gap-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h1 className="text-lg font-semibold">Media</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Images are stored per-store and served through an access-controlled route.
        </p>

        <div className="mt-4">
          <MediaUploader storeSlug={ctx.storeSlug} />
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="text-base font-semibold">Recent uploads</h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {files.length === 0 ? (
            <div className="text-sm text-zinc-600">No media files yet.</div>
          ) : (
            files.map((f) => (
              <div key={f.id} className="rounded-xl border border-zinc-200 bg-white p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={f.filename}
                  className="h-40 w-full rounded-lg bg-zinc-100 object-cover"
                  src={`/api/store/${encodeURIComponent(ctx.storeSlug)}/media/${f.key}`}
                />
                <div className="mt-2 text-sm font-medium">{f.filename}</div>
                <div className="mt-1 text-xs text-zinc-500">
                  {f.mimeType} • {(f.sizeBytes / 1024).toFixed(1)} KB
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}


