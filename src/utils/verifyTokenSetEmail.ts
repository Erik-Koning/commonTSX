import { Dispatch, SetStateAction } from "react";
import jwt, { JwtPayload } from "jsonwebtoken";
import { toast } from "@common/components/ui/sonner";

type VerifyTokenAndSetEmailProps = {
  token?: string | null;
  setEmail: (email: string) => void;
};

export const verifyTokenSetEmail = ({ token, setEmail }: VerifyTokenAndSetEmailProps): Boolean => {
  ////console.log("token in method", token)
  if (!token) return false;
  try {
    // Verify and decode the JWT token
    const decodedJWT = jwt.decode(
      token
      //String(process.env.JWT_SECRET)
    ) as JwtPayload;
    ////console.log("decodedJWT", decodedJWT);
    // Extract the expiration time from the decoded token
    const expirationTime = decodedJWT.exp;

    // Get the email from the decoded token and save it to state
    setEmail(decodedJWT.email);

    // Get the current UNIX timestamp
    const currentTime = Math.floor(Date.now() / 1000);

    ////console.log("expirationTime", expirationTime);
    ////console.log("currentTime", currentTime);
    // Compare the current time with the expiration time
    if (expirationTime && expirationTime < currentTime) {
      ////console.log("JWT token has expired");
      toast({
        title: "Error",
        message: "JWT Token is expired",
        type: "error",
      });
      return false;
    } else {
      // Token is valid
      return true;
    }
  } catch (error: any) {
    ////console.log("error --", error.data.message);
    toast({
      title: "Error",
      message: "Error verifying token.",
      type: "error",
    });
    return false;
  }
};
