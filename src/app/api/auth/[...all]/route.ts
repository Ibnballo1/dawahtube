import auth from "@/core/auth/config"; // Ensure this points to your config file
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
