import { toast } from "@common/components/ui/sonner";

import { resIsSuccess } from '../utils/httpStatus';
import axios from "axios";
import { removeQueryParam } from "./stringManipulation";

export const getNewEmailTokenForPath = async (pathName?: string): Promise<boolean> => {
  debugger;
  console.log("pathName", pathName);
  let token = "";
  if (pathName) {
    //strip the token query param if it exists
    const x = removeQueryParam(pathName, "token");
    pathName = x[0];
    token = x[1];
  }

  const payload = {
    pathName: pathName,
    token: token,
  };

  try {
    const response = await axios.post("/api/postRenewEmailToken", payload);
    console.log("response", response);
    if (resIsSuccess(response)) {
      toast({
        title: "New token sent",
        message: "Check your email for the new token link.",
        type: "success",
      });
      return true;
    } else {
      throw new Error(response.data.message ? response.data.message : "Failed to save user data");
    }
  } catch (error: any) {
    toast({
      title: "Error sending new token",
      message: "Please try again later.",
      type: "error",
    });
    return false;
  }
};
