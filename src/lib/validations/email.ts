import { z } from "zod";

const bannedDomains: string[] = [];
const bannedEmails: string[] = [];

export const EmailSchema = z
  .string()
  .min(3)
  .email()
  .refine(
    (email) => {
      // Extract the domain and the local part before any '+' character
      const [localPart, domain] = email.split("@");
      const baseLocalPart = localPart.split("+")[0];
      const normalizedEmail = `${baseLocalPart}@${domain}`;

      // Check both the complete email address and the normalized base email against allowed addresses
      return !(bannedEmails.includes(normalizedEmail) || bannedDomains.includes(domain));
    },
    {
      message: "Invalid email address",
    }
  );

export const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/i;
