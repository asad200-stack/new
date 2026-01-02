"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function getCookie(name: string) {
  const parts = document.cookie.split("; ").map((p) => p.split("="));
  for (const [k, ...rest] of parts) {
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export function MediaUploader({ storeSlug }: { storeSlug: string }) {
  const router = useRouter();
  const csrf = useMemo(() => getCookie("csrf_token"), []);
  const [folder, setFolder] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="grid gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
      <div className="text-sm font-medium">Upload image</div>

      <label className="grid gap-1 text-sm">
        <span className="font-medium">Folder (optional)</span>
        <input
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          placeholder="e.g. products/banners"
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span className="font-medium">File</span>
        <input
          type="file"
          accept="image/*"
          disabled={busy}
          onChange={async (e) => {
            setError(null);
            const file = e.target.files?.[0];
            if (!file) return;
            if (!csrf) {
              setError("Missing CSRF token. Please refresh.");
              return;
            }
            setBusy(true);
            try {
              const fd = new FormData();
              fd.set("file", file);
              if (folder.trim()) fd.set("folder", folder.trim());
              const res = await fetch(`/api/dashboard/${encodeURIComponent(storeSlug)}/media/upload`, {
                method: "POST",
                headers: { "x-csrf-token": csrf },
                body: fd,
              });
              const json = await res.json().catch(() => ({}));
              if (!res.ok || !json.ok) throw new Error(json.error || "Upload failed");
              router.refresh();
              e.target.value = "";
            } catch (err) {
              setError((err as Error).message);
            } finally {
              setBusy(false);
            }
          }}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
        />
      </label>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}
    </div>
  );
}


