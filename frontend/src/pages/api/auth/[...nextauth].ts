import { REGISTER_USER } from "@/endpoints";
import { logError } from "@/helpers/error-logging";
import { NextApiRequest, NextApiResponse } from "next";
import NextAuth, { NextAuthOptions, Profile } from "next-auth";
import GithubProvider from "next-auth/providers/github";

export const settings: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
      // @ts-ignore
      scope: "read:user",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "github") {
        try {
          const response: any = await fetch(
            `${process.env.API_URL}${REGISTER_USER}`,
            {
              method: "POST",
              body: JSON.stringify({
                ...account,
                ...profile,
                ...user,
              }),
              headers: {
                Authorization: `Bearer ${process.env.API_KEY}`,
              },
            }
          );

          const { data } = await response.json();
          account.id = data.user_id;
          account.terms_version = data.terms_version || null;

          return true; // return true if everything went well
        } catch (error) {
          console.error(error);
          return false;
        }
      }

      return false;
    },

    async jwt({ token, account, profile }) {
      if (account) {
        const { id, terms_version, access_token } = account;

        token.id = id;
        token.access_token = access_token;
        token.provider = account.provider;
        token.terms_version = terms_version;
      }

      if (profile) {
        const { login } = profile as Profile & { login: string };
        token.login = login;
      }

      return token;
    },

    async session({ session, token }) {
      const { provider, terms_version, login, id, access_token } = token;
      session.accessToken = access_token;
      session.user.id = id;
      session.user.terms_version = terms_version;
      session.user.provider = provider;
      session.user.login = login;

      return session;
    },
  },
};

export default async function nextAuth(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await NextAuth(req, res, settings);
  } catch (error: any) {
    logError(error);
    throw error;
  }
}
