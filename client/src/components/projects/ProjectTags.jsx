/**
 * @param {{ tags?: string[] }} props
 */
export function ProjectTags({ tags = [] }) {
  if (tags.length === 0) return null;

  return (
    <ul className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
      {tags.map((tag) => (
        <li
          key={tag}
          className="border border-border px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}
