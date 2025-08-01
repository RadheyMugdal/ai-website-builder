import { polarClient } from "@polar-sh/better-auth";
import { createAuthClient } from "better-auth/react"; // make sure to import from better-auth/react


export const authClient = createAuthClient({
    plugins: [polarClient()]
});
