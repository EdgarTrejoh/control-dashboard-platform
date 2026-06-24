import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import {
  getAlphaAccessConfig,
  getGoogleEmailVerified,
  validateAlphaProfileAccess
} from "@/platform/auth/alpha-access";
import { ALPHA_SESSION_MAX_AGE_SECONDS } from "@/platform/auth/inactivity-policy";
import { hashEmail, logAlphaEvent } from "@/platform/observability/alpha-events";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut
} = NextAuth({
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: ALPHA_SESSION_MAX_AGE_SECONDS
  },
  providers: [
    Google({
      authorization: {
        params: {
          prompt: "select_account"
        }
      }
    })
  ],
  callbacks: {
    async signIn({ profile, user }) {
      const email = profile?.email ?? user.email;
      const access = validateAlphaProfileAccess(
        {
          email,
          emailVerified: getGoogleEmailVerified(profile)
        },
        getAlphaAccessConfig(process.env)
      );

      const userEmailHash = email ? hashEmail(email) : undefined;

      logAlphaEvent({
        event_type: access.ok ? "login_success" : "login_denied_not_invited",
        user_email_hash: userEmailHash,
        module: "platform",
        action: "google_sign_in",
        result: access.ok ? "success" : "denied",
        error_code: access.ok ? undefined : "ALPHA_ACCESS_DENIED"
      });

      return access.ok;
    }
  }
});
