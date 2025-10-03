// Function to create an instance with default values
export function createBlankInstance<T>() {
  const instance: Partial<T> = {};
  const keys = Object.keys(instance) as (keyof T)[];
  keys.forEach((key) => {
    if (typeof instance[key] === "boolean") {
      instance[key] = false as T[keyof T];
    } else if (instance[key] instanceof Date) {
      instance[key] = new Date() as T[keyof T];
    } else {
      instance[key] = "" as T[keyof T];
    }
  });
  return instance as T;
}
