import React from 'react';

// Minimal, safe Markdown renderer.
// Supports: # / ## / ### headings, **bold**, [text](url) links, > blockquotes, paragraphs, blank-line separation.
// Intentionally does NOT support raw HTML — input is rendered as text, so escape/sanitization needs are contained to URL vetting.

const isSafeUrl = (url: string): boolean => {
  const trimmed = url.trim();
  if (!trimmed) return false;
  // Allow http(s), mailto, relative (/, ./, ../), and anchor (#).
  return /^(https?:\/\/|mailto:|\/|\.\/|\.\.\/|#)/i.test(trimmed);
};

// Render a single line of inline markdown (bold + links) to React nodes.
type InlineKey = string | number;
const renderInline = (text: string, keyPrefix: InlineKey): React.ReactNode[] => {
  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  let n = 0;
  // Combined pattern: link [text](url) or bold **text**.
  const pattern = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) {
      nodes.push(text.slice(cursor, match.index));
    }
    if (match[1] !== undefined && match[2] !== undefined) {
      const linkText = match[1];
      const url = match[2];
      if (isSafeUrl(url)) {
        const isExternal = /^https?:\/\//i.test(url);
        nodes.push(
          <a
            key={`${keyPrefix}-a-${n++}`}
            href={url}
            {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="text-blue-700 underline decoration-blue-300 underline-offset-2 hover:text-blue-900 hover:decoration-blue-700 transition-colors"
          >
            {linkText}
          </a>
        );
      } else {
        nodes.push(linkText);
      }
    } else if (match[3] !== undefined) {
      nodes.push(
        <strong key={`${keyPrefix}-b-${n++}`} className="font-bold text-gray-900">
          {match[3]}
        </strong>
      );
    }
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }
  return nodes;
};

type Block =
  | { kind: 'heading'; level: 1 | 2 | 3; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'blockquote'; text: string };

const parseBlocks = (source: string): Block[] => {
  const normalized = source.replace(/\r\n?/g, '\n');
  const rawBlocks = normalized.split(/\n{2,}/);
  const blocks: Block[] = [];
  for (const raw of rawBlocks) {
    const trimmed = raw.trim();
    if (!trimmed) continue;

    const headingMatch = /^(#{1,3})\s+(.+)$/.exec(trimmed);
    if (headingMatch && !trimmed.includes('\n')) {
      blocks.push({ kind: 'heading', level: headingMatch[1].length as 1 | 2 | 3, text: headingMatch[2].trim() });
      continue;
    }

    const lines = trimmed.split('\n');
    if (lines.every(l => l.trimStart().startsWith('>'))) {
      const text = lines.map(l => l.replace(/^\s*>\s?/, '')).join('\n');
      blocks.push({ kind: 'blockquote', text });
      continue;
    }

    blocks.push({ kind: 'paragraph', text: trimmed });
  }
  return blocks;
};

export const Markdown = ({ source }: { source: string }): React.ReactElement => {
  const blocks = parseBlocks(source);
  return (
    <>
      {blocks.map((block, idx) => {
        if (block.kind === 'heading') {
          const common = 'font-serif font-black text-gray-900 tracking-tight';
          if (block.level === 1) {
            return (
              <h2 key={idx} className={`${common} text-3xl md:text-4xl mt-10 mb-4 border-b border-gray-200 pb-2`}>
                {renderInline(block.text, idx)}
              </h2>
            );
          }
          if (block.level === 2) {
            return (
              <h3 key={idx} className={`${common} text-2xl md:text-3xl mt-8 mb-3`}>
                {renderInline(block.text, idx)}
              </h3>
            );
          }
          return (
            <h4 key={idx} className={`${common} text-xl md:text-2xl mt-6 mb-2`}>
              {renderInline(block.text, idx)}
            </h4>
          );
        }
        if (block.kind === 'blockquote') {
          return (
            <blockquote
              key={idx}
              className="border-l-4 border-gray-900 bg-[#f8f9fa] px-6 py-4 my-6 italic text-gray-700 font-serif leading-relaxed shadow-inner"
            >
              {block.text.split('\n').map((line, li, arr) => (
                <React.Fragment key={li}>
                  {renderInline(line, `${idx}-${li}`)}
                  {li < arr.length - 1 ? <br /> : null}
                </React.Fragment>
              ))}
            </blockquote>
          );
        }
        return (
          <p key={idx} className="mb-6 leading-relaxed text-gray-800 font-serif text-justify">
            {block.text.split('\n').map((line, li, arr) => (
              <React.Fragment key={li}>
                {renderInline(line, `${idx}-${li}`)}
                {li < arr.length - 1 ? <br /> : null}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </>
  );
};
