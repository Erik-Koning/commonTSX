import { success } from "toastr";
import { sendEmail } from "./sendEmail";
import { NextResponse } from "next/server";

export async function sendEmailVerificationEmail(
  email: string,
  verificationCode: string,
  verificationTokenExpiration: Date,
  JWT?: String,
  senderProvided?: string,
  subjectProvided?: string,
  urlProvided?: string,
  bodyProvided?: string
): Promise<NextResponse> {
  ////console.log("sending email...");
  const recipient = email;
  const sender = senderProvided ?? `verify@${process.env.NEXT_PUBLIC_SES_IDENTITY}`;
  const subject = subjectProvided ?? `Verify Your ${process.env.NEXT_PUBLIC_APP_TITLE} Email Address`;
  const url =
    urlProvided ??
    `${process.env.NEXT_PUBLIC_ROOT_DOMAIN_URL_FULL}/auth/verify-email?signUp=1&email=` + email + "&code=" + verificationCode + "&JWT=" + JWT;
  const body =
    bodyProvided ??
    `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <a href="https://${process.env.NEXT_PUBLIC_MARKETING_DOMAIN_NAME}" style="display: block; text-align: left; margin-bottom: 20px;">
            <img src="https://${process.env.NEXT_PUBLIC_MARKETING_DOMAIN_NAME}/wp-content/uploads/2023/02/cropped-${process.env.NEXT_PUBLIC_APP_TITLE}-TM-logo-new-PNG.png" alt="${process.env.NEXT_PUBLIC_APP_TITLE} logo" style="height: 40px; width: auto;">
          </a>
          <h2 style="color: #333333; margin-bottom: 20px;">Welcome to ${process.env.NEXT_PUBLIC_APP_TITLE}!</h2>
          <p style="color: #333333;">Thank you for signing up. To complete your registration, please click the button below:</p>
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
