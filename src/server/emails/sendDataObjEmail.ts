import { sendEmail } from "./sendEmail";
import { NextResponse } from "next/server";

export async function sendDataObjEmail(
  to: string,
  from?: string,
  subjectProvided?: string,
  data?: Record<string, any> | string,
  note?: string
): Promise<NextResponse> {
  ////console.log("sending email...");
  const recipient = to;
  const sender = from ?? `verify@${process.env.NEXT_PUBLIC_SES_IDENTITY}`;
  const subject = subjectProvided ?? "sendDataObjEmail";

  const dataIsString = typeof data === "string";

  let rows: string = "";
  if (!dataIsString && data) {
    rows = Object.entries(data ?? {})
      .map(([key, value]) => {
        return `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;"><strong>${key}</strong></td>
          <td style="border: 1px solid #ddd; padding: 8px;">${value}</td>
        </tr>
      `;
      })
      .join("");
  }

  const body = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <a href="https://${process.env.NEXT_PUBLIC_MARKETING_DOMAIN_NAME}" style="display: block; text-align: left; margin-bottom: 20px;">
        <img src="https://${
          process.env.NEXT_PUBLIC_MARKETING_DOMAIN_NAME
        }/wp-content/uploads/2023/02/cropped-${process.env.NEXT_PUBLIC_APP_TITLE}-TM-logo-new-PNG.png" alt="${process.env.NEXT_PUBLIC_APP_TITLE} logo" style="height: 40px; width: auto;">
      </a>
      <p style="color: #333333; margin-bottom: 10px;">The following data obj is sent from the server</p>
      ${note && `<p style= "color: #333333;" > Note: ${note}</p>`}
      <hr style="margin:20px 0;">
      <h3 style="color:#333333;">Data:</h3>
      <table style="border-collapse: collapse; width: 100%;">
        ${dataIsString ? data : rows}
      </table>
    </div>
  `;

  try {
    // Send the email using the sendEmail function
    await sendEmail({ senderEmail: sender, recipient: recipient, subject: subject, bodyHTML: body });
    return NextResponse.json({ message: "Email sent" }, { status: 200 });
  } catch (error) {
    console.error("Failed to send email from API:", error);
    return NextResponse.json({ error: "Failed to send email from API, try again in a few minutes or contact support" }, { status: 400 });
  }
}
