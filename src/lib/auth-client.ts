import { polarClient } from "@polar-sh/better-auth";
import { createAuthClient } from "better-auth/react"; // make sure to import from better-auth/react
import { lastLoginMethodClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
   plugins: [lastLoginMethodClient(), polarClient()],
});
