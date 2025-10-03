import { createContext } from "react";

const ValidContext = createContext({
  isValid: null,
  setIsValid: (valid: boolean) => {},
});

export default ValidContext;
