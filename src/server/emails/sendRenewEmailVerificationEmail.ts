import { sendEmail } from "./sendEmail";
import { NextResponse } from "next/server";

export async function sendRenewEmailVerificationEmail(
  email: string,
  verificationCode: string,
  verificationTokenExpiration: Date,
  JWT?: string,
  senderProvided?: string,
  subjectProvided?: string,
  urlProvided?: string,
  bodyProvided?: string,
  firstName?: string,
  isSignUp: boolean = true,
  searchParams?: Record<string, string>
): Promise<NextResponse> {
  ////console.log("sending email...");
  const recipient = email;
  const sender = senderProvided ?? `verify@${process.env.NEXT_PUBLIC_SES_IDENTITY}`;
  const subject = subjectProvided ?? `Re-verify Your ${process.env.NEXT_PUBLIC_APP_TITLE} Email Address`;
  const baseUrl = urlProvided ?? `${process.env.NEXT_PUBLIC_ROOT_DOMAIN_URL_FULL}/auth/verify-email`;
  const params = new URLSearchParams();

  // 1. Apply all passed searchParams (lowest priority)
  if (searchParams) {
    for (const key in searchParams) {
      const value = searchParams[key];
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach((v: unknown) => {
            if (typeof v === "string") {
              params.append(key, v);
            }
          });
        } else {
          params.set(key, value);
        }
      }
    }
  }

  params.set("email", email);
  params.set("code", verificationCode);
  params.set("signUp", isSignUp ? "1" : "0");
  params.set("JWT", JWT ?? "");

  const url = `${baseUrl}?${params.toString()}`;

  const body =
    bodyProvided ??
    `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <a href="https://${process.env.NEXT_PUBLIC_MARKETING_DOMAIN_NAME}" style="display: block; text-align: left; margin-bottom: 20px;">
            <img src="https://${process.env.NEXT_PUBLIC_MARKETING_DOMAIN_NAME}/wp-content/uploads/2023/02/cropped-${
      process.env.NEXT_PUBLIC_APP_TITLE
    }-TM-logo-new-PNG.png" alt="${process.env.NEXT_PUBLIC_APP_TITLE} logo" style="height: 40px; width: auto;">
          </a>
          <p style="color: #333333; margin-bottom: 10px;">Hello${firstName ? " " + firstName : ""},</p>
          <p style="color: #333333;">You are receiving this email because you are trying to use ${
            process.env.NEXT_PUBLIC_APP_TITLE
          } with an expired email verification, please use the code or link below to re-verify your email.</p>
          <a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #1da1f2; color: #ffffff; text-decoration: none; margin-top: 20px;">Verify Email</a>
          <p style="color: #333333; text-align: left;">Or use code:</p>
          <h2 style="color: #333333; margin-bottom: 8px; margin-left:2px">${verificationCode}</h2>
          <p style="color: #333333;">If the button above does not work, you can also copy and paste the following link into your browser:</p>
          <p style="color: #333333;"><a href="${url}">${url}</a></p>
          <p style="color: #333333;">Please note that the verification link will expire on ${verificationTokenExpiration}.</p>
          <p style="color: #333333;">If you have any questions or need assistance, please contact our support team.</p>
          <p style="color: #333333;">Thank you,<br/>The ${process.env.NEXT_PUBLIC_APP_TITLE} Team</p>
        </div>
      `;

  try {
    // Send the email using the sendEmail function
    await sendEmail({ senderEmail: sender, recipient: recipient, subject: subject, bodyHTML: body });
    return NextResponse.json({ message: "Email sent", JWT: JWT }, { status: 200 });
  } catch (error) {
    console.error("Failed to send email from API:", error);
    return NextResponse.json({ error: "Failed to send email from API, try again in a few minutes or contact support" }, { status: 400 });
  }
}
