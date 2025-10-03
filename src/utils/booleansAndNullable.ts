export const isNullable = (value: any, emptyArrayIsNull: boolean = false): boolean => {
  if (emptyArrayIsNull && Array.isArray(value) && value.length === 0) return true;
  return value === null || value === undefined;
};

export const stringToBoolean = (value: string): boolean => {
  return value.toLowerCase() === "true";
};

export const isNullOrUndefined = (value: any): value is null | undefined => {
  return value === null || value === undefined;
};
