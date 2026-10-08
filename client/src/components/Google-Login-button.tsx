import { GoogleLogin } from "@react-oauth/google";

export default function GoogleSignup() {
  return (
    <GoogleLogin
      onSuccess={(credentialResponse) => {
        console.log("Google credential:", credentialResponse.credential);
      }}
      onError={() => {
        console.log("Google Signup Failed");
      }}
    />
  );
}