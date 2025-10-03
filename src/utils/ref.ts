//synonym function for setRefs
export const mergeRefs = <T>(node: T, ...refs: (React.Ref<T> | undefined)[]) => {
  setRefs(node, ...refs);
};

export const setRefs = <T>(node: T, ...refs: (React.Ref<T> | undefined)[]) => {
  refs.forEach((ref) => {
    if (typeof ref === "function") {
      ref(node);
    } else if (ref && typeof ref === "object") {
      (ref as React.MutableRefObject<T>).current = node;
    }
  });
};
