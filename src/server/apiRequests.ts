import { APIGatewayProxyEventV2 } from "aws-lambda";
import { NextRequest } from "next/server";

//ISO 3166-1 alpha-2 country code
//Countries to serve
export const serveCountries: string[] | undefined = ["US", "CA"];
//Countries to deny, in case countries to serve not set
export const denyCountries: string[] | undefined = undefined;

// Type guard for APIGatewayProxyEventV2
export function isAPIGatewayProxyEventV2(req: any): req is APIGatewayProxyEventV2 {
  // Minimal check:
  return req?.requestContext !== undefined && req?.headers !== undefined;

  // More explicit check might look like:
  // return (
  //   req?.version === "2.0" &&
  //   req?.requestContext?.http?.sourceIp !== undefined &&
  //   typeof req?.headers === "object"
  // );
}

// Type guard for NextRequest
export function isNextRequest(req: any): req is NextRequest {
  // Check if req is an instance of NextRequest
  if (req instanceof NextRequest) {
    return true;
  }

  // Alternatively, check for properties unique to NextRequest
  //return req?.cookies !== undefined && req?.headers !== undefined && typeof req?.nextUrl !== "undefined";
  // For example, the presence of the 'nextUrl' property and 'cookies' object
  if (req && typeof req === "object" && req?.headers !== undefined && req?.cookies !== undefined && req?.nextUrl !== undefined) {
    return true;
  }

  return false;
}

export function isGetRequest(req: reqTypes): boolean {
  return isNextRequest(req) && req.method === "GET";
}

/**
 * Extracts an IP address from either an APIGatewayProxyEventV2 or NextRequest.
 */
export type reqTypes =
  | NextRequest
  | APIGatewayProxyEventV2
  | {
      [key: string]: any;
      headers?: Record<string, string> | undefined;
    };

export function getIpAddress(req: reqTypes, debug: boolean = false): string {
  if (debug) console.info("req in getIpAddress", req);
  if (isAPIGatewayProxyEventV2(req)) {
    if (debug) console.info("getIpAddress in APIGatewayProxyEventV2", req.requestContext.http.sourceIp);
    // Running in AWS Lambda behind API Gateway (HTTP API v2)
    return req.requestContext.http.sourceIp ?? "Unknown IP";
  } else if (isNextRequest(req)) {
    if (debug) console.info("getIpAddress in NextRequest", req.headers.get("x-forwarded-for"));
    // Running in Next.js environment
    // Try some common headers first, then fallback to req.ip
    const xForwardedFor = req.headers.get("x-forwarded-for");
    const xRealIp = req.headers.get("x-real-ip");
    // req.ip is also available in NextRequest (>= Next 13.0),
    // but might not always be set, so we check headers first
    if (debug) console.info("getIpAddress in NextRequest", xForwardedFor, xRealIp, req.headers.get("x-forwarded-for"));
    return xForwardedFor ?? xRealIp ?? req.headers.get("x-forwarded-for") ?? "Unknown IP";
  }
  return req?.headers?.["x-forwarded-for"] ?? "Unknown IP";
}

//Returns the ISO 3166-1 alpha-2 country code
export function getReqCountry(req: reqTypes, debug: boolean = false): string {
  if (debug) console.info("getReqCountry in getReqCountry", req);
  if (isAPIGatewayProxyEventV2(req)) {
    // Running on AWS Lambda behind API Gateway (HTTP API v2)
    // Possibly CloudFront is in front, so look for CloudFront-Viewer-Country.
    // If using a direct API Gateway integration, you might pass a custom header for country, etc.
    if (debug) console.info("getReqCountry in APIGatewayProxyEventV2", req.headers["cloudfront-viewer-country"], req.headers["CloudFront-Viewer-Country"]);
    const countryFromHeader = req.headers["cloudfront-viewer-country"] || req.headers["CloudFront-Viewer-Country"];

    return countryFromHeader ?? "";
  } else if (isNextRequest(req)) {
    // Running in Next.js environment (Edge / App Router)
    // On Vercel, you might get 'x-vercel-ip-country'.
    // Or if CloudFront is fronting your Next app, you could see CloudFront-Viewer-Country.
    if (debug)
      console.info(
        "getReqCountry in NextRequest",
        req.headers.get("x-open-next-country"),
        req.headers.get("cloudfront-viewer-country"),
        req.headers.get("x-vercel-ip-country"),
        req.headers.get("CloudFront-Viewer-Country")
      );
    const country =
      req.headers.get("x-open-next-country") ||
      req.headers.get("cloudfront-viewer-country") ||
      req.headers.get("x-vercel-ip-country") ||
      req.headers.get("CloudFront-Viewer-Country");

    return country ?? "";
  } else {
    // Fallback if neither APIGatewayProxyEventV2 nor NextRequest
    // Possibly look at a custom country header if you have one
    if (debug)
      console.info(
        "getReqCountry in fallback",
        req?.headers?.["x-open-next-country"],
        req?.headers?.["cloudfront-viewer-country"],
        req?.headers?.["CloudFront-Viewer-Country"],
        req?.headers?.["x-country"],
        req?.headers?.["x-vercel-ip-country"]
      );
    const fallbackCountry =
      req?.headers?.["x-open-next-country"] ||
      req?.headers?.["cloudfront-viewer-country"] ||
      req?.headers?.["CloudFront-Viewer-Country"] ||
      req?.headers?.["x-country"] ||
      req?.headers?.["x-vercel-ip-country"];

    return fallbackCountry ?? "";
  }
}

/**
 * Looks for city name in known headers:
 * - AWS CloudFront can pass custom city headers if configured, but there's no default.
 * - Vercel might pass x-vercel-ip-city
 * - Or you might define your own custom header, e.g. x-city
 */
export function getReqCity(req: reqTypes): string {
  if (isAPIGatewayProxyEventV2(req)) {
    // Possibly a custom header from your AWS setup
    // e.g. "CloudFront-Viewer-City" if you added that via Lambda@Edge or geolocation service
    const cityHeader = req.headers["cloudfront-viewer-city"] || req.headers["CloudFront-Viewer-City"];
    return cityHeader ?? "";
  } else if (isNextRequest(req)) {
    // Vercel's typical city header:
    const city = req.headers.get("x-open-next-city") || req.headers.get("cloudfront-viewer-city");
    // If using CloudFront or a custom geolocation header in Next:
    // const cityCF = req.headers.get("CloudFront-Viewer-City");
    return city ?? "";
  } else {
    // Fallback for any custom scenario
    const fallbackCity = req?.headers?.["x-city"] || req?.headers?.["x-open-next-city"] || req?.headers?.["cloudfront-viewer-city"];
    return fallbackCity ?? "";
  }
}

/**
 * Looks for "region" or "country-region" in known headers:
 * - On Vercel, there's no built-in region header for the *visitor*,
 *   but "x-vercel-ip-country-region" might be set in some edge configurations.
 * - On AWS, you might pass a custom "CloudFront-Viewer-Region" if using geolocation at distribution level.
 */
export function getReqCountryRegion(req: reqTypes): string {
  if (isAPIGatewayProxyEventV2(req)) {
    // Possibly a custom header from your AWS setup
    const regionHeader = req.headers?.["cloudfront-viewer-country-region"] || req.headers?.["Cloudfront-Viewer-Country-Region"];
    return regionHeader ?? "";
  } else if (isNextRequest(req)) {
    // Vercel might pass "x-vercel-ip-country-region" if you have a special config or edge function
    // There's no official built-in region header for the visitor, so you might define your own
    const region =
      req.headers.get("x-open-next-country-region") ||
      req.headers.get("cloudfront-viewer-country-region") ||
      req.headers.get("Cloudfront-Viewer-Country-Region") ||
      req.headers.get("x-vercel-ip-country-region");
    return region ?? "";
  } else {
    // Fallback if neither APIGatewayProxyEventV2 nor NextRequest
    // Possibly you define your own "x-region" or "x-vercel-ip-country-region"
    const fallbackRegion =
      req?.headers?.["x-open-next-country-region"] ||
      req?.headers?.["cloudfront-viewer-country-region"] ||
      req.headers?.["Cloudfront-Viewer-Country-Region"] ||
      req?.headers?.["x-region"] ||
      req?.headers?.["x-vercel-ip-country-region"];

    return fallbackRegion ?? "";
  }
}

export function getReqLatLong(req: reqTypes): string {
  let lat = "";
  let long = "";
  if (isNextRequest(req)) {
    // Vercel might pass "x-vercel-ip-country-region" if you have a special config or edge function
    // There's no official built-in region header for the visitor, so you might define your own
    lat = (req.headers.get("x-open-next-latitude") || req.headers.get("cloudfront-viewer-latitude")) ?? "";
    long = (req.headers.get("x-open-next-longitude") || req.headers.get("cloudfront-viewer-longitude")) ?? "";
  } else {
    // Fallback if neither APIGatewayProxyEventV2 nor NextRequest
    // Possibly you define your own "x-region" or "x-vercel-ip-country-region"
    lat = (req?.headers?.["x-open-next-latitude"] || req?.headers?.["cloudfront-viewer-latitude"]) ?? "";
    long = (req?.headers?.["x-open-next-longitude"] || req?.headers?.["cloudfront-viewer-longitude"]) ?? "";
  }
  if (!lat && !long) return "";
  return lat + "," + long;
}

export interface userIPs {
  ip: string;
  verified: Date | null;
  country: string;
  region: string;
  city: string;
  latLong?: string;
  lastLogin?: Date | null;
}

export function generateNewIPDetails(req: reqTypes, verified?: boolean): userIPs {
  const IP = getIpAddress(req); //works for nextRequest, APIGatewayevent, and NextAuth request obj
  const IPCounty = getReqCountry(req);
  const IPCity = getReqCity(req);
  const IPRegion = getReqCountryRegion(req);
  const IPLatLong = getReqLatLong(req);
  return {
    ip: IP,
    city: IPCity,
    country: IPCounty,
    region: IPRegion,
    latLong: IPLatLong,
    lastLogin: null,
    verified: verified ? new Date() : null,
  } satisfies userIPs;
}
