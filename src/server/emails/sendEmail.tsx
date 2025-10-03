import { SendEmailCommandInput, SES } from "@aws-sdk/client-ses";
import { isDevEnv } from "@common/utils/environments";

export type SendEmailParams = {
  senderEmail: string;
  recipient: string;
  subject: string;
  bodyHTML: string;
  senderName?: string;
  bodyText?: string;
  replyToAddresses?: string[];
};

export async function sendEmail({ senderEmail, recipient, subject, bodyHTML, senderName, bodyText, replyToAddresses }: SendEmailParams): Promise<void> {
  console.info("Sending email to", recipient, "with subject", subject, "for region", process.env.AWS_REGION, process.env.NEXT_PUBLIC_AWS_REGION);

  // Create a new SES instance
  const ses = new SES({
    region: process.env.AWS_REGION,
    ...(isDevEnv() && {
      credentials: {
        accountId: process.env.AWS_ACCOUNT_ID!,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        sessionToken: process.env.AWS_SESSION_TOKEN!,
      },
    }),
  });

  // Format the sender with a name
  const formattedSender = senderName ? `${senderName} <${senderEmail}>` : senderEmail;

  // Compose the email parameters
  const params: SendEmailCommandInput = {
    Destination: {
      ToAddresses: [recipient],
    },
    ReplyToAddresses: replyToAddresses,
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: bodyHTML,
        },
        ...(bodyText && {
          Text: {
            Charset: "UTF-8",
            Data: bodyText,
          },
        }),
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
    Source: formattedSender,
  };

  try {
    // Send the email using SES
    await ses.sendEmail(params);
    ////console.log("Email sent successfully");
  } catch (error) {
    console.error("Failed to send email via ses:", error);
    throw new Error("Failed to send email via ses");
  }
}
