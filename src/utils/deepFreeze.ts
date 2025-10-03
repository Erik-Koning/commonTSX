//create an immutable object by deep freezing all of its properties, including nested objects.

export function deepFreeze(obj: Record<string, any>) {
  // Retrieve the property names defined on obj
  const propNames = Object.getOwnPropertyNames(obj);

  // Freeze properties before freezing self
  propNames.forEach((name) => {
    const prop = obj[name];

    // Freeze prop if it is an object
    if (typeof prop === "object" && prop !== null) {
      deepFreeze(prop);
    }
  });

  // Freeze self
  return Object.freeze(obj);
}
