"use client";

import { useEffect } from "react";

export function TrackStoreVisit({ slug }: { slug: string }) {
  useEffect(() => {
    fetch(`/api/store/${encodeURIComponent(slug)}/track`, { method: "POST" }).catch(() => {});
  }, [slug]);
  return null;
}

export function TrackProductView({ slug, productId }: { slug: string; productId: string }) {
  useEffect(() => {
    fetch(`/api/store/${encodeURIComponent(slug)}/product/${encodeURIComponent(productId)}/track`, { method: "POST" }).catch(() => {});
  }, [slug, productId]);
  return null;
}


