import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { removeKeys } from "./objectManipulation";

export const signOptionsObj: Record<keyof SignOptions, undefined> = {
  algorithm: undefined,
  keyid: undefined,
  expiresIn: undefined,
  notBefore: undefined,
  audience: undefined,
  subject: undefined,
  issuer: undefined,
  jwtid: undefined,
  mutatePayload: undefined,
  noTimestamp: undefined,
  header: undefined,
  encoding: undefined,
  allowInsecureKeySizes: undefined,
  allowInvalidAsymmetricKeyTypes: undefined,
};

// 1) Literal array of keys (with `as const`).
export const signOptionsKeys = [
  "algorithm",
  "keyid",
  "expiresIn",
  "notBefore",
  "audience",
  "subject",
  "issuer",
  "jwtid",
  "mutatePayload",
  "noTimestamp",
  "header",
  "encoding",
  "allowInsecureKeySizes",
  "allowInvalidAsymmetricKeyTypes",
] as const;

// 2) The union of keys from the object
type SignOptionsObjKeys = keyof typeof signOptionsObj; // "algorithm" | "keyid" | ...

// 3) The union from the array
type SignOptionsKeysUnion = (typeof signOptionsKeys)[number]; // "algorithm" | "keyid" | ...

// 4) A helper type to confirm both sets of keys match exactly
type ExactKeys<T, U extends T> = Exclude<T, U> extends never ? (Exclude<U, T> extends never ? true : never) : never;

// 5) Perform the check. If you remove or add a key,
//    TS will complain here because it becomes `never`.
const _checkAllKeysMustMatch: ExactKeys<SignOptionsObjKeys, SignOptionsKeysUnion> = true;

/*export interface JwtSignOptions extends SignOptions {
  [key: string]: any; //This is the payload
}*/

export const generateJWTAccessToken = (payload?: Record<string, any>, signOptions?: SignOptions) => {
  //generate token signed with email and an expiry in seconds
  const token = jwt.sign(payload ?? {}, String(process.env.JWT_SECRET), {
    algorithm: "HS256",
    ...signOptions,
  });
  return token;
};

/**
 * Verifies a JWT token, checking its signature and expiration.
 * This is the secure way to "unsign" a token and get its payload.
 * It ensures the token is authentic and has not been tampered with.
 *
 * @param token The JWT string to verify.
 * @returns The decoded payload if verification is successful, otherwise undefined.
 */
export const verifyJWTToken = (token?: string | null): JwtPayload | undefined => {
  if (!token) return undefined;
  try {
    // jwt.verify will throw an error if the token is invalid (e.g., bad signature, expired)
    const payload = jwt.verify(token, String(process.env.JWT_SECRET)) as JwtPayload;
    return payload;
  } catch (error) {
    console.error("Error verifying JWT token:", (error as Error).message);
    return undefined;
  }
};

/**
 * Decodes a JWT token without verifying its signature.
 * WARNING: This is insecure. You should only use this when you don't need to
 * trust the contents of the token. For most server-side use cases,
 * you should use `verifyJWTToken` instead.
 *
 * @param token The JWT string to decode.
 * @param complete Returns header and signature if true.
 * @returns The decoded payload (or full token) if decoding is successful, otherwise undefined.
 */
export const decodeJWTToken = (token?: string | null, complete: boolean = false): JwtPayload | undefined => {
  if (!token) return undefined;
  try {
    // This ONLY decodes the token. It does NOT verify the signature.
    const decodedJWT = jwt.decode(token, { complete: complete }) as JwtPayload;
    return decodedJWT;
  } catch (error) {
    console.error("Error decoding token", error);
    return undefined;
  }
};

export const JWTExpired = (exp: number | undefined) => {
  if (!exp) return false;
  return exp < Date.now() / 1000;
};
