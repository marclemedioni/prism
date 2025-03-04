import { APIError, Gateway, Header } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";

interface AuthParams {
  authorization: Header<"Authorization">;
}

// The function passed to authHandler will be called for all incoming API call that requires authentication.
// Remove if your app does not require authentication.
export const myAuthHandler = authHandler(
  async (params: AuthParams): Promise<{ userID: string }> => {
    // ... verify and decode token to get the userID ...
    // ... get user info from database or third party service like Auth0 or Clerk ...

    if (params.authorization !== "dummy-token") {
      throw APIError.unauthenticated("invalid token");
    }

    return { userID: "dummy-user-id" };
  }
);

export const gateway = new Gateway({ authHandler: myAuthHandler });
