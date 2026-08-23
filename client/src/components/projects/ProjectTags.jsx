/**
 * @param {{ tags?: string[] }} props
 */
export function ProjectTags({ tags = [] }) {
  if (!tags.length) return null;

  return (
    <ul>
      {tags.map((tag) => (
        <li key={tag}>{tag}</li>
      ))}
    </ul>
  );
}
