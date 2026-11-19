import { handleAndReturnErrorResponse } from "@/lib/api/errors";
import { safeFetch } from "@/lib/api/safe-fetch";
import { ratelimitOrThrow } from "@/lib/api/utils";
import {
  getDomainQuerySchema,
  getUrlQuerySchema,
} from "@/lib/zod/schemas/links";
import { getSearchParams, isIframeableFromHeaders } from "@dub/utils";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // was "edge": Vercel Hobby caps edge functions at 1 MB

export async function GET(req: NextRequest) {
  try {
    const { url, domain } = getUrlQuerySchema
      .and(getDomainQuerySchema)
      .parse(getSearchParams(req.url));

    await ratelimitOrThrow(req, "iframeable");

    const res = await safeFetch(url);
    const iframeable = isIframeableFromHeaders({
      headers: res.headers,
      requestDomain: domain,
    });

    return NextResponse.json({ iframeable });
  } catch (error) {
    return handleAndReturnErrorResponse(error);
  }
}
