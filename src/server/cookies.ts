import { APIGatewayProxyEventV2 } from "aws-lambda";
import { IncomingMessage, IncomingHttpHeaders } from "http";
import { parseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { NextRequest } from "next/server";

export function extractCookies(event: APIGatewayProxyEventV2): { [key: string]: any } {
  let cookieHeader = event.headers["cookie"] || event.headers["Cookie"];

  if (!cookieHeader && event.cookies) {
    cookieHeader = event.cookies.join("; ");
  }

  if (!cookieHeader) {
    console.log("No Cookie header found");
    return {};
  }

  // Parse the cookies into an object
  const cookies = parseCookie(cookieHeader);
  return cookies;
}

export function createCustomReq(event: APIGatewayProxyEventV2, cookies: { [key: string]: string }): NextRequest {
  // Create a minimal IncomingMessage-like object
  const req: Partial<IncomingMessage> & {
    cookies: { [key: string]: string };
    query: {};
    body: any;
    method?: string;
    url?: string;
  } = {
    headers: event.headers as IncomingHttpHeaders,
    cookies: cookies,
    query: {}, // You can populate this if needed
    body: event.body,
    method: event.requestContext.http.method,
    url: event.rawPath,
  };

  // Type assertion to NextApiRequest
  return req as unknown as NextRequest;
}
