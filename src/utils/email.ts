import safeStringify from "fast-safe-stringify";

export function objectToTableRows(obj: any): string {
  // If null or not an object/array, just return the value as a text cell
  if (obj === null || typeof obj !== "object") {
    return `<td style="border: 1px solid #ddd; padding: 8px;" colspan="2">${String(obj)}</td>`;
  }

  //remove circular references
  const safeDataStr = safeStringify(obj);
  const safeData = JSON.parse(safeDataStr) as Record<string, any> | any[];

  // If it's an array, treat array indexes as keys
  if (safeData && Array.isArray(safeData)) {
    return obj
      .map((value: any, index: any) => {
        // If the value is an object or another array, render a nested table, otherwise just render value
        const cellContent =
          typeof value === "object" && value !== null
            ? `<table style="border-collapse: collapse; width: 100%;">${objectToTableRows(value)}</table>`
            : String(value);

        return `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>[${index}]</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">${cellContent}</td>
          </tr>
        `;
      })
      .join("");
  }

  // Otherwise, it's an object. Iterate over keys
  return Object.entries(safeData)
    .map(([key, value]) => {
      // If the value is an object or array, nest another table
      const cellContent =
        typeof value === "object" && value ? `<table style="border-collapse: collapse; width: 100%;">${objectToTableRows(value)}</table>` : String(value);

      return `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;"><strong>${key}</strong></td>
          <td style="border: 1px solid #ddd; padding: 8px;">${cellContent}</td>
        </tr>
      `;
    })
    .join("");
}

export function userEmailIsInAppDomain(email?: string): boolean {
  if (!email || typeof email !== "string") return false;

  return emailHasDomain(email.toLowerCase(), process.env.NEXT_PUBLIC_APP_DOMAIN_NAME ?? undefined) || emailHasDomain(email.toLowerCase(), "koning");
}

export function emailHasDomain(email?: string, domain: string | undefined = process.env.NEXT_PUBLIC_APP_DOMAIN_NAME ?? undefined): boolean {
  if (!email || !domain) return false;

  // Extract domain from email
  const emailDomain = email.split("@")[1]?.toLowerCase();

  // Compare with passed domain (case insensitive)
  return emailDomain === domain.toLowerCase();
}

export const SuperAppAdminEmails = process.env.NEXT_PUBLIC_SUPER_APP_ADMIN_EMAILS?.split(",") ?? ["erik", "jake", "jacob"];

export function emailIsSuperAppAdmin(email?: string, domain: string | undefined = process.env.NEXT_PUBLIC_APP_DOMAIN_NAME ?? undefined): boolean {
  if (!email || !domain) return false;

  email = email.toLowerCase();

  if (!email.toLowerCase().endsWith(domain)) return false;

  //split the email at the @
  const emailParts = email.split("@");
  if (emailParts.length !== 2) return false;

  const emailUsername = emailParts[0];

  //strip any email username aliases "+"
  const emailUsernameWithoutAliases = emailUsername.split("+")[0];

  //check if atleast one of the super app admin starts with the email username in question
  return SuperAppAdminEmails.some((adminEmail) => adminEmail.startsWith(emailUsernameWithoutAliases));
}
