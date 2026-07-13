import { toNextJsHandler } from "better-auth/next-js";
import auth from "@core/auth/config";

// ✅ Passing the instance into the wrapper preserves internal context bindings
const handler = toNextJsHandler(auth);

export const GET = (req: Request) => handler.GET(req);
export const POST = (req: Request) => handler.POST(req);
