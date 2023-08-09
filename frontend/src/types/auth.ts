import { Session as NextAuthSession } from "next-auth";

export type SessionData = NextAuthSession & {
  user: {
    login: string;
    terms_version: number | null;
  };
};

export type Session = SessionData | null;
