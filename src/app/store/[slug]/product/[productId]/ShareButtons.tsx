"use client";

import { useMemo, useState } from "react";

export function ShareButtons(props: {
  localeLabel: {
    share: string;
    whatsapp: string;
    messenger: string;
    copyLink: string;
  };
  url: string;
  text: string;
}) {
  const { share, whatsapp, messenger, copyLink } = props.localeLabel;
  const [copied, setCopied] = useState(false);

  const wa = useMemo(() => {
    const u = new URL("https://wa.me/");
    u.searchParams.set("text", `${props.text} ${props.url}`);
    return u.toString();
  }, [props.text, props.url]);

  const ms = useMemo(() => {
    const u = new URL("https://www.facebook.com/dialog/send");
    u.searchParams.set("link", props.url);
    return u.toString();
  }, [props.url]);

  return (
    <div className="grid gap-2">
      <div className="text-sm font-medium">{share}</div>
      <div className="flex flex-wrap gap-2">
        <a className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50" href={wa} target="_blank" rel="noreferrer">
          {whatsapp}
        </a>
        <a className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50" href={ms} target="_blank" rel="noreferrer">
          {messenger}
        </a>
        <button
          type="button"
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-50"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(props.url);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            } catch {
              // ignore
            }
          }}
        >
          {copied ? "Copied" : copyLink}
        </button>
      </div>
    </div>
  );
}


