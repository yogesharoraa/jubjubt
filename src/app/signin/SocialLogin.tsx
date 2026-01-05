import React from "react";
import useApiPost from "../hooks/postData";
import { toast } from "react-toastify";
import axios from "axios";
import Cookies from "js-cookie";
import { useGoogleLogin } from "@react-oauth/google";
import { SignUpRes } from "../types/ResTypes";
import { useAppDispatch } from "../utils/hooks";
import { hideModal, showModal } from "../store/Slice/ModalsSlice";
import Image from "next/image";
function SocialLogin() {
  const { postData } = useApiPost();
  const dispatch = useAppDispatch();
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const { access_token } = tokenResponse;
        // Fetch user info from Google
        const res = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        });
        const { email, given_name, family_name } = res.data;
        // Call your API with full name
        const response: SignUpRes = await postData("/users/signup", {
          email,
          login_type: "social",
          platform: "website",
          device_token: "",
          first_name: given_name || "",
          last_name: family_name || "",
        });
        // Save token if needed
        Cookies.set("Reelboost_auth_token", response.data.token, {
        secure: false,      // must for HTTP
  sameSite: "Lax",    // must for Google login
  expires: 30,
  path: "/",    
        });
        if (response.message !== "Data is Missing") {
          toast.success("Signed in successfully!");
          // Check if username is already set
          if (response.data.newUser === false) {
            dispatch(hideModal("Signin"));
            dispatch(showModal("Profile"));
          } else {
            dispatch(hideModal("Signin"));
            setTimeout(() => dispatch(showModal("Signup")), 100);
          }
          // — REFRESH THE PAGE so the client state updates (give toast/dispatch a moment)
          setTimeout(() => {
            // use reload so everything re-initializes with the new auth cookie
            window.location.reload();
          }, 2000); // 700ms to allow toast/dispatch to run (adjust if you want)
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        // toast.error("Google login failed");
      }
    },
    onError: (errorResponse) => {
      // toast.error("Google login failed");
    },
  });
  return (
    <div
      className="relative border border-main-green rounded-md bg-main-green/[0.04] py-2 mx-10 cursor-pointer text-center"
    onClick={() => {
    dispatch(hideModal("Signin")); // :red_circle: modal turant close
    googleLogin();                 // :large_blue_circle: Google login start
  }}
    >
      <Image
        src="/ReelBoost/GoogleLogo.png"
        className="absolute left-3 top-1/2 transform -translate-y-1/2"
        alt="Google"
        width={22}
        height={22}
      />
      <span className="font-medium text-sm text-dark cursor-pointer">
        Continue with Google
      </span>
    </div>
  );
}
export default SocialLogin;