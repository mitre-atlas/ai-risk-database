import { DefaultSession, DefaultUser, Token } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface User extends DefaultUser {
    accessToken?: string;
    refreshToken?: string;
  }
  interface Session {
    accessToken?: unknown;
    user: {
      id: unknown;
      login: unknown;
      provider: unknown;
      terms_version: unknown;
    } & DefaultSession["user"];
  }
}
