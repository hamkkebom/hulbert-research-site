type H = { level: number; id: string; text: string };

/** Table of contents built from the page's h2/h3 headings. */
export function PageToc({ headings }: { headings: H[] }) {
  if (headings.length < 2) return null;
  const tree: { h: H; children: H[] }[] = [];
  for (const h of headings) {
    if (h.level === 2 || tree.length === 0) tree.push({ h, children: [] });
    else tree[tree.length - 1].children.push(h);
  }
  return (
    <nav className="toc page-toc" aria-labelledby="page-toc-title">
      <h2 id="page-toc-title">이 글의 목차</h2>
      <ul>
        {tree.map(({ h, children }) => (
          <li key={h.id}>
            <a href={`#${encodeURIComponent(h.id)}`}>{h.text}</a>
            {children.length > 0 && (
              <ul>
                {children.map((c) => (
                  <li key={c.id}>
                    <a href={`#${encodeURIComponent(c.id)}`}>{c.text}</a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
