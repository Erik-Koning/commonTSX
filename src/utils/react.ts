export function createChangeEvent(name: string, value: any): React.ChangeEvent<any> {
  const e = {
    target: {
      name: name, // Assuming registerName is the name of the input
      value: value,
    },
  } as unknown as React.ChangeEvent<any>;
  return e;
}
