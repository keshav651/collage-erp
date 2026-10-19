
import { GoogleLogin } from "@react-oauth/google";

export default function GoogleSignup() {
  return (
    <GoogleLogin
      onSuccess={async (credentialResponse) => {
        const credential = credentialResponse.credential;

        if (!credential) {
          console.error("Google ID token is missing");
          return;
        }

        try {
          const response = await fetch(
            "https://collage-erp-hnx0.onrender.com/api/auth/google",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ credential }),
            }
          );

          const result = await response.json();
          console.log("Signup response:", result);
        } catch (error) {
          console.error("Signup request failed:", error);
        }
      }}
      onError={() => {
        console.error("Google Signup Failed");
      }}
    />
  );
}
