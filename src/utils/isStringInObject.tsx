export default function isStringInObject(str?: string, obj?: Record<string, any>) {
  if (!str || !obj) return false;

  const values = Object.values(obj);
  return values.includes(str);
}

export function isStringInValueMap(str?: string, obj?: Record<string, any>, watch?: any) {
  if (!str || !obj) return false;

  const values = Object.values(obj);
  return values.includes(str);
}
