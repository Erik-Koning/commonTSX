import { NextResponse } from "next/server";

//checks for a status code that is successful
export function resIsSuccess(statusCode: number | Record<string, any> | undefined): boolean {
  if (!statusCode) {
    return false;
  }
  if (typeof statusCode === "object") {
    if (statusCode instanceof NextResponse) {
      //its an instance of NextResponse (acts different than a regular Record<>), get the status code,
      statusCode = statusCode.status;
    } else {
      const objectKeys = Object.keys(statusCode);
      if (objectKeys.length === 1 && objectKeys.includes("Response")) {
        //its an Object that emulates NextResponse, get the status code,
        statusCode = statusCode.Response;
      }
      if (statusCode && typeof statusCode === "object" && statusCode.hasOwnProperty("status")) {
        statusCode = Number(statusCode.status);
      }
    }
  }
  if (typeof statusCode !== "number") {
    return false;
  }
  return statusCodeIsOk(statusCode);
} //checks for a status code that is a redirect

export function statusCodeIsOk(statusCode: number): boolean {
  return statusCode >= 200 && statusCode < 300;
} //checks for a status code that is a client error
