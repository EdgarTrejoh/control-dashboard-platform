import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import {
  getAlphaAccessConfig,
  getGoogleEmailVerified,
  validateAlphaProfileAccess
} from "@/platform/auth/alpha-access";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut
} = NextAuth({
  trustHost: true,
  session: {
    strategy: "jwt"
  },
  providers: [Google],
  callbacks: {
    async signIn({ profile, user }) {
      const access = validateAlphaProfileAccess(
        {
          email: profile?.email ?? user.email,
          emailVerified: getGoogleEmailVerified(profile)
        },
        getAlphaAccessConfig(process.env)
      );

      return access.ok;
    }
  }
});
