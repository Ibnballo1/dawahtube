import { type NextRequest } from "next/server";
import { ok, withCors, OPTIONS } from "../_helpers";
import { authedUser } from "./_common";

export { OPTIONS };

export async function GET(req: NextRequest) {
  const auth = await authedUser(req);
  if (!auth.ok) return auth.response;
  return withCors(ok({ userId: auth.userId }));
}
