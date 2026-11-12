/** Update a nested editor field without mutating saved props or removing siblings. */
export function setFieldValue(source: unknown, path: (string | number)[], value: unknown): unknown {
  if (path.length === 0) return value;
  const [key, ...rest] = path;
  if (typeof key === "number") {
    const items = Array.isArray(source) ? [...source] : [];
    items[key] = setFieldValue(items[key], rest, value);
    return items;
  }
  const object = source && typeof source === "object" && !Array.isArray(source) ? source as Record<string, unknown> : {};
  return { ...object, [key]: setFieldValue(object[key], rest, value) };
}
