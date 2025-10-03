export const isDefined = (v: any) => v !== undefined;
export const isDef = (v: any) => (v !== undefined ? true : undefined);

export const allDefined = (arr: any[]) => arr.every((v) => v !== undefined);
