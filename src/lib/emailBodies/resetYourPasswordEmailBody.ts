export const resetYourPasswordEmailBody = (url: string, verificationTokenExpiration: string) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <a href="https://${process.env.NEXT_PUBLIC_MARKETING_DOMAIN_NAME}" style="display: block; text-align: left; margin-bottom: 20px;">
        <img src="https://${process.env.NEXT_PUBLIC_MARKETING_DOMAIN_NAME}/wp-content/uploads/2023/02/cropped-${process.env.NEXT_PUBLIC_APP_TITLE}-TM-logo-new-PNG.png" alt="${process.env.NEXT_PUBLIC_APP_TITLE} logo" style="height: 40px; width: auto;">
      </a>
      <h2 style="color: #333333; margin-bottom: 20px;">Welcome to ${process.env.NEXT_PUBLIC_APP_TITLE}!</h2>
      <p style="color: #333333;">Please reset your password by clicking the button below:</p>
      <a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #1da1f2; color: #ffffff; text-decoration: none; margin-top: 20px;">Verify Email</a>
      <p style="color: #333333;">If the button above does not work, you can also copy and paste the following link into your browser:</p>
      <p style="color: #333333;"><a href="${url}">${url}</a></p>
      <p style="color: #333333;">Please note that the verification link will expire on ${verificationTokenExpiration}.</p>
      <p style="color: #333333;">If you have any questions or need assistance, please contact our support team.</p>
      <p style="color: #333333;">Thank you,<br/>The ${process.env.NEXT_PUBLIC_APP_TITLE} Team</p>
    </div>
  `;
};
