import { emailIsSuperAppAdmin } from "@common/utils/email";

export const isProdEnv = () => {
  return process.env.NEXT_PUBLIC_NODE_ENV
    ? process.env.NEXT_PUBLIC_NODE_ENV.startsWith("prod")
    : process.env.NODE_ENV
    ? process.env.NODE_ENV.startsWith("prod")
    : false;
};

export const isTestEnv = () => {
  return process.env.NEXT_PUBLIC_NODE_ENV
    ? process.env.NEXT_PUBLIC_NODE_ENV.startsWith("test")
    : process.env.NODE_ENV
    ? process.env.NODE_ENV.startsWith("test")
    : false;
};

export const isDevEnv = () => {
  return process.env.NEXT_PUBLIC_NODE_ENV
    ? process.env.NEXT_PUBLIC_NODE_ENV.startsWith("dev")
    : process.env.NODE_ENV
    ? process.env.NODE_ENV.startsWith("dev")
    : false;
};

export const isTestOrDevEnv = () => {
  return isTestEnv() || isDevEnv();
};

export const isTestDevOrSuperAppAdmin = (email?: string) => {
  return isTestOrDevEnv() || emailIsSuperAppAdmin(email);
};
