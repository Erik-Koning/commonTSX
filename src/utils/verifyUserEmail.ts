import { sendEmail } from "../server/emails/sendEmail";
import { NextResponse } from "next/server";
import { createOrUpdateVerificationCode, generateVerificationCode, getTokenExpiration } from "../../../app-core/src/lib/server/verificationToken";
import { sendEmailVerificationEmail } from "../server/emails/sendEmailVerificationEmail";
import { resIsSuccess } from "./httpStatus";

export async function verifyUserEmail(email: string): Promise<boolean> {
  // Generate the verification token and expiration date
  const { jwt: JWT, expiry, code } = await createOrUpdateVerificationCode(email, undefined, true);
  if (!code || !expiry) return false;

  const res = await sendEmailVerificationEmail(email, code, expiry, JWT);

  if (resIsSuccess(res)) {
    return true;
  }
  return false;
}

export const createVerificationTokenAndSendEmail = async (email: string, minutes: number): Promise<NextResponse> => {
  // Generate the verification token and expiration date
  const { jwt: JWT, expiry, code } = await createOrUpdateVerificationCode(email, undefined, true);
  if (!code || !expiry) {
    return NextResponse.json({ message: "Failed to create verification token" }, { status: 500 });
  }

  return await sendEmailVerificationEmail(email, code, expiry, JWT);
};
