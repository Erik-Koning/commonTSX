import { isDevEnv } from "../utils/environments";

const permissibleBackdoorEmails = ["erik@" + process.env.NEXT_PUBLIC_MARKETING_DOMAIN_NAME];

export type BackdoorUser = {
  email: string;
  isBackdoor: boolean;
  userAccessingEmail: string;
};

export function backdoorGetUserByEmail(email: string): BackdoorUser {
  console.info("\n***************** email", email);
  if (!email) return { email, isBackdoor: false, userAccessingEmail: "" };

  //Does the email include the user accessing the account in brackets?
  if (email.endsWith(")") && email.includes("(")) {
    const userAccessing = email.split("(")[1].split(")")[0].toLowerCase();
    const userAccessingEmail = userAccessing.split("@")[0];
    const userAccessingDomain = userAccessing.split("@")[1];
    // Is the user accessing the account using a permissible backdoor email?
    console.info("\n***************** userAccessingDomain", userAccessingDomain);
    console.info("\n***************** permissibleBackdoorEmails", permissibleBackdoorEmails);
    console.info("\n***************** userAccessing", userAccessing);
    console.info("\n***************** userAccessingEmail", userAccessingEmail);
    if (userAccessingDomain === process.env.NEXT_PUBLIC_MARKETING_DOMAIN_NAME && permissibleBackdoorEmails.includes(userAccessing)) {
      //It is an app admin accessing a user account
      return { email: email.split("(")[0], isBackdoor: true, userAccessingEmail: userAccessing };
    }
    //else it is not a backdoor login
  }
  return { email, isBackdoor: false, userAccessingEmail: "" };
}

export const isBackdoorLogin = (email: string | Record<string, any>): boolean => {
  if (typeof email === "object") {
    if (email.hasOwnProperty("email") && typeof email.email === "string") {
      email = email.email;
    } else {
      return false;
    }
  }
  const backdoorUser = backdoorGetUserByEmail(email as string);
  return backdoorUser.isBackdoor;
};

export const isPermissibleBackdoorEmail = (email: string | Record<string, any>): boolean => {
  if (typeof email === "object") {
    if (email.hasOwnProperty("email") && typeof email.email === "string") {
      email = email.email;
    } else {
      return false;
    }
  }
  return permissibleBackdoorEmails.includes(email as string);
};
