import type { ReactNode } from "react";

/* A small, dependency-free Markdown renderer for the blog body.
   Supports: #/##/### headings, paragraphs, - / * and 1. lists, > quotes,
   --- rules, and inline **bold**, *italic*, `code`, [text](url).
   Renders real React nodes (no dangerouslySetInnerHTML). */

const INLINE = /(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;

function inline(text: string, k: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  let m: RegExpExecArray | null;
  INLINE.lastIndex = 0;
  while ((m = INLINE.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const t = m[0];
    const key = `${k}-i${i++}`;
    if (t.startsWith("**")) {
      out.push(<strong key={key} className="font-semibold text-[#0f3a26]">{t.slice(2, -2)}</strong>);
    } else if (t.startsWith("`")) {
      out.push(<code key={key} className="rounded bg-[#0f3a26]/[0.06] px-1.5 py-0.5 font-mono text-[0.88em] text-[#0f3a26]">{t.slice(1, -1)}</code>);
    } else if (t.startsWith("[")) {
      const link = /\[([^\]]+)\]\(([^)\s]+)\)/.exec(t);
      out.push(
        <a key={key} href={link?.[2] ?? "#"} target="_blank" rel="noopener noreferrer" className="font-medium text-[#006E42] underline underline-offset-2 hover:opacity-80">
          {link?.[1] ?? t}
        </a>,
      );
    } else {
      out.push(<em key={key}>{t.slice(1, -1)}</em>);
    }
    last = m.index + t.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ source }: { source: string }) {
  const lines = (source ?? "").replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i++; continue; }

    // Horizontal rule
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) {
      blocks.push(<hr key={`hr${i}`} className="my-8 border-[#0f3a26]/10" />);
      i++;
      continue;
    }

    // Headings
    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    if (h) {
      const text = h[2];
      const key = `h${i}`;
      if (h[1].length === 1) blocks.push(<h2 key={key} className="mt-10 text-[24px] font-bold leading-snug tracking-tight text-[#0f3a26]">{inline(text, key)}</h2>);
      else if (h[1].length === 2) blocks.push(<h2 key={key} className="mt-9 text-[20px] font-bold leading-snug tracking-tight text-[#0f3a26]">{inline(text, key)}</h2>);
      else blocks.push(<h3 key={key} className="mt-7 text-[16.5px] font-bold leading-snug tracking-tight text-[#0f3a26]">{inline(text, key)}</h3>);
      i++;
      continue;
    }

    // Blockquote
    if (/^>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, "")); i++; }
      blocks.push(
        <blockquote key={`q${i}`} className="my-6 rounded-2xl bg-[#f1f7f3] px-5 py-4 text-[15px] italic leading-relaxed text-[#0f3a26]/75 ring-1 ring-inset ring-[#0f3a26]/[0.08]">
          {inline(buf.join(" "), `q${i}`)}
        </blockquote>,
      );
      continue;
    }

    // Unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*[-*]\s+/, "")); i++; }
      blocks.push(
        <ul key={`ul${i}`} className="my-5 space-y-2">
          {items.map((it, n) => (
            <li key={n} className="flex gap-3 text-[15.5px] leading-relaxed text-[#0f3a26]/75">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#006E42]" />
              <span>{inline(it, `ul${i}-${n}`)}</span>
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*\d+\.\s+/, "")); i++; }
      blocks.push(
        <ol key={`ol${i}`} className="my-5 space-y-2.5">
          {items.map((it, n) => (
            <li key={n} className="flex gap-3 text-[15.5px] leading-relaxed text-[#0f3a26]/75">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#006E42] text-[10.5px] font-bold text-white">{n + 1}</span>
              <span>{inline(it, `ol${i}-${n}`)}</span>
            </li>
          ))}
        </ol>,
      );
      continue;
    }

    // Paragraph
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,3}\s|>\s?|\s*[-*]\s|\s*\d+\.\s)/.test(lines[i]) && !/^\s*(-{3,}|\*{3,})\s*$/.test(lines[i])) {
      para.push(lines[i]);
      i++;
    }
    if (para.length) {
      const key = `p${i}`;
      blocks.push(<p key={key} className="text-[15.5px] leading-[1.75] text-[#0f3a26]/75">{inline(para.join(" "), key)}</p>);
    }
  }

  return <div className="space-y-4">{blocks}</div>;
}
