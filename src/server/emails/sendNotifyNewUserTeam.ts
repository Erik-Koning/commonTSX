import { NextResponse } from "next/server";
import { sendEmail } from "./sendEmail";

export async function sendNotifyNewUserTeamEmail(
  email: string,
  senderName: string,
  verificationToken?: string,
  verificationTokenExpiration?: Date,
  senderProvided?: string,
  subjectProvided?: string,
  urlProvided?: string,
  bodyProvided?: string,
  firstName?: string,
  isSignUp: boolean = true
): Promise<NextResponse> {
  ////console.log("sending email...");
  const recipient = `hello@${process.env.NEXT_PUBLIC_SES_IDENTITY}`; //TODO: change to hello@${process.env.NEXT_PUBLIC_SES_IDENTITY}
  const sender = senderProvided ?? `verify@${process.env.NEXT_PUBLIC_SES_IDENTITY}`;
  const subject = subjectProvided ?? `New User [${email}] has verified their email`;
  const body =
    bodyProvided ??
    `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <a href="https://${process.env.NEXT_PUBLIC_MARKETING_DOMAIN_NAME}" style="display: block; text-align: left; margin-bottom: 20px;">
            <img src="https://${process.env.NEXT_PUBLIC_MARKETING_DOMAIN_NAME}/wp-content/uploads/2023/02/cropped-${process.env.NEXT_PUBLIC_APP_TITLE}-TM-logo-new-PNG.png" alt="${process.env.NEXT_PUBLIC_APP_TITLE} logo" style="height: 40px; width: auto;">
          </a>
          <p style="color: #333333;">User with email ${email} has just verified their email as part of the sign up process. They have now been proceeded to set their password and continue with signup.</p>
          <p style="color: #333333;">The user did so on domain: ${process.env.NEXT_PUBLIC_ROOT_DOMAIN_URL}</p>
          <p style="color: #333333;">🚀</p>
        </div>
      `;

  try {
    // Send the email using the sendEmail function
    await sendEmail({ senderEmail: sender, recipient: recipient, subject: subject, bodyHTML: body, senderName: senderName });
    return NextResponse.json({ message: "Email sent" }, { status: 200 });
  } catch (error) {
    console.error("Failed to send email from API:", error);
    return NextResponse.json({ error: "Failed to send email from API, try again in a few minutes or contact support" }, { status: 400 });
  }
}
