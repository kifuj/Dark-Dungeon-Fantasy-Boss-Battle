import type { ReactNode } from 'react';

/**
 * Rendu Markdown minimal pour les pages de contenu (Crédits, US-26) : titres, paragraphes,
 * listes, citations, tableaux, liens, gras, italique et code. On produit des éléments React
 * (pas de `dangerouslySetInnerHTML`) et on évite une dépendance pour une seule page.
 */

const REPO_DOCS = 'https://github.com/kifuj/Dark-Dungeon-Fantasy-Boss-Battle/blob/main/docs/';

/** Les liens relatifs de `docs/` pointent vers GitHub : dans le jeu, ils n'existent pas. */
const resolveHref = (href: string) => (/^[a-z]+:/i.test(href) || href.startsWith('#') ? href : REPO_DOCS + href);

const INLINE = /(\[[^\]]+\]\([^)]+\)|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|https?:\/\/[^\s|)]+)/g;

export function renderInline(text: string, keyPrefix = 'i'): ReactNode[] {
  return text.split(INLINE).map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link) {
      return (
        <a key={key} href={resolveHref(link[2])} target="_blank" rel="noreferrer">
          {renderInline(link[1], key)}
        </a>
      );
    }
    if (/^https?:\/\//.test(part)) {
      return (
        <a key={key} href={part} target="_blank" rel="noreferrer">
          {part}
        </a>
      );
    }
    if (/^`[^`]+`$/.test(part)) return <code key={key}>{part.slice(1, -1)}</code>;
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={key}>{renderInline(part.slice(2, -2), key)}</strong>;
    if (/^\*[^*]+\*$/.test(part)) return <em key={key}>{part.slice(1, -1)}</em>;
    return part;
  });
}

const cells = (row: string) =>
  row
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((cell) => cell.trim());

export function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const key = `b-${i}`;

    if (line.trim() === '') {
      i++;
      continue;
    }

    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      const Tag = `h${Math.min(heading[1].length + 1, 5)}` as 'h2';
      blocks.push(<Tag key={key}>{renderInline(heading[2], key)}</Tag>);
      i++;
      continue;
    }

    if (line.startsWith('|')) {
      const rows: string[] = [];
      while (i < lines.length && lines[i].startsWith('|')) rows.push(lines[i++]);
      const [head, , ...body] = rows;
      // Les lignes entièrement vides (gabarits à remplir) ne sont pas affichées.
      const filled = body.map(cells).filter((row) => row.some((cell) => cell !== ''));
      if (filled.length === 0) continue;
      blocks.push(
        <div key={key} className="md-table">
          <table>
            <thead>
              <tr>
                {cells(head).map((cell, c) => (
                  <th key={c}>{renderInline(cell, `${key}-h${c}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filled.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td key={c}>{renderInline(cell, `${key}-${r}-${c}`)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    if (line.startsWith('>')) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].startsWith('>')) quote.push(lines[i++].replace(/^>\s?/, ''));
      blocks.push(<blockquote key={key}>{renderInline(quote.join(' '), key)}</blockquote>);
      continue;
    }

    if (/^[-*]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) items.push(lines[i++].replace(/^[-*]\s/, ''));
      blocks.push(
        <ul key={key}>
          {items.map((item, n) => (
            <li key={n}>{renderInline(item, `${key}-${n}`)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    const paragraph: string[] = [];
    while (i < lines.length && lines[i].trim() !== '' && !/^(#|\||>|[-*]\s)/.test(lines[i])) paragraph.push(lines[i++]);
    blocks.push(<p key={key}>{renderInline(paragraph.join(' '), key)}</p>);
  }

  return <div className="markdown">{blocks}</div>;
}
