import { APIGatewayProxyEventV2 } from "aws-lambda";
import { NextRequest } from "next/server";
import { getIpAddress, isAPIGatewayProxyEventV2, isNextRequest } from "../server/apiRequests";
import { substituteKeyValues } from "./objectManipulation";

export const consoleDotLog = <T = unknown>(anything: any): T extends unknown ? typeof anything : T => {
  const error = new Error();
  const stackLines = error.stack?.split("\n");
  const callerLine = stackLines ? stackLines[2] : "unknown location";

  console.log(anything);
  console.log(`Logged from: ${callerLine.trim()}`, anything);

  return anything as any;
};

export const prodDotLog = <T = unknown>(anything: any): T extends unknown ? typeof anything : T => {
  console.log(anything);
  return anything as any;
};

// The request body is optional, if not provided, it will be retrieved from the request, pass the body if it is already retrieved, cannot be re-read from the request if already read
export const loggingAPIcall = async (
  userIdentifier: string | true,
  body?: Record<string, any>,
  otherRequestDetails?: Record<string, any>,
  redactKeys?: string[]
) => {
  const allwaysRedactKeys = ["password", "AdminAccessJWT", "pin", "hpId", "otp"];
  redactKeys = redactKeys ? [...allwaysRedactKeys, ...redactKeys] : allwaysRedactKeys;

  //if the user identifier is true, and the request body is an object, try to get the user identifier from the request body
  if (userIdentifier === true && body && typeof body === "object") {
    //the user identifier is in the request body
    userIdentifier = body?.email ?? body?.id ?? body?.userId ?? body?.user?.id ?? "unknown";
  }

  //The data to log
  let APICallLogData = {
    "API CALL by": userIdentifier,
    reqBody: body,
    otherRequestDetails: otherRequestDetails,
  };

  //if there are keys to redact, substitute them with "<REDACTED>"
  if (redactKeys && redactKeys.length > 0) {
    substituteKeyValues(
      APICallLogData,
      redactKeys.reduce((acc, key) => ({ ...acc, [key]: "<REDACTED>" }), {}),
      true,
      true
    );
  }

  //Log it via console.info so it is not removed by the next.config.mjs. Console.log should be removed per next.config.mjs
  console.info(APICallLogData);
};
