"use client";
import React, { useState } from "react";
import { Dialog } from "@mui/material";
import { useAppSelector } from "../utils/hooks";
import { useAppDispatch } from "../utils/hooks";
import { hideModal } from "../store/Slice/ModalsSlice";
import PhoneSignin from "./PhoneSignin";
import EmailSignin from "./EmailSignin";
import SocialLogin from "./SocialLogin";
import IconInput from "../components/SignupField";
import { toast } from "react-toastify";
import { SignUpRes } from "../types/ResTypes";
import useApiPost from "../hooks/postData";
import { ClipLoader } from "react-spinners";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

function Signin() {
  const router = useRouter();

  const [selectedOption, setSelectedOption] = useState("Phone");
  const [view, setView] = useState<"login" | "forgot">("login");

  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.modals.Signin);
  const email = useAppSelector((state) => state.user.email);

  // Initial form data
  const [formData, setFormData] = useState({
    user_name: "",
    email: email || "",
    password: "",
  });

  const resetForm = () => {
  setFormData({
    user_name: "",
    password: "",
    email:""
  });
};

  const { postData, loading } = useApiPost();

  const handleSignin = async () => {
    try {
      const res: SignUpRes = await postData(
        "/users/signup",

        {
          input: formData.user_name,
          login_type: "manual",
          password: formData.password,
          platform: "website",
        }
      );
      if (res?.status) {
        toast.success(res?.message);
        window.location.replace("/");

        dispatch(hideModal("Signin"));
        Cookies.set("Reelboost_auth_token", res.data.token, {
          // secure: true,
          // sameSite: "Strict",
          expires: 30,
        });
        Cookies.set("Reelboost_user_id", String(res.data.user.user_id), {
          // secure: true,
          // sameSite: "Strict",
          expires: 30,
        });
      } else {
        toast.error(res?.message || "Invalid Email,Username or Password");
      }
    } catch (error) {
      toast.error("Invalid Email, Username or Password");
    }
  };
const handleForgotPassword = async (input: string) => {
  if (!input) {
    toast.error("Enter email or username");
    return;
  }

  try {
    const res = await postData("/users/restPass", {
      email: input, // backend accepts email / username
    });

    if (res?.status) {
      toast.success("Reset password link sent to your email");
      setView("login");
    } else {
      // ✅ USER NOT FOUND CASE
      toast.error("User not found");
    }
  } catch (error) {
    toast.error("User not found");
  }
};


  function ForgotPasswordView({
  onBack,
  onSubmit,
  loading,
}: {
  onBack: () => void;
  onSubmit: (input: string) => void;
  loading: boolean;
}) {
  const [input, setInput] = useState("");

  return (
    <div className="flex flex-col gap-4 px-4">
     

      <input
        className="border rounded-lg px-3 py-2 text-sm"
        placeholder="Enter email or username"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button
        onClick={() => onSubmit(input)}
        className="bg-main-green text-white rounded-xl py-2"
      >
        {loading ? "Sending..." : "Send Reset Link"}
      </button>

      <button
        onClick={onBack}
        className="text-xs text-main-green text-center"
      >
        Back to login
      </button>
    </div>
  );
}

  return (
    <>
      <Dialog
        open={open}
        onClose={() => {dispatch(hideModal("Signin")); resetForm()}}
        fullWidth
        PaperProps={{
          sx: {
            p: 0,
            overflow: "visible",
            borderRadius: 3,
            maxHeight: "90vh",
            width: "420px",
            maxWidth: "100%",
          },
        }}
        BackdropProps={{ sx: { background: "#000000BD" } }}
      >
        <div className="">
          <button
            onClick={() => {dispatch(hideModal("Signin")); resetForm()}}
            className="absolute top-2 right-2 text-dark rounded-full p-2 hover:text-gray-800 transition cursor-pointer"
          >
            ✕
          </button>
          <>
            <div
              style={{ boxShadow: "9.3px 10.46px 64.96px 0px #00000026" }}
              className="py-8 px-5 rounded-xl"
            >
              {/* Title */}
              <h3 className="pb-4 text-[20px] font-medium text-dark text-center">
  {view === "login" ? "Login" : "Forgot Password"}
</h3>

           {view === "login" ? (
  <>
    {/* ================= LOGIN FORM ================= */}
    <form>
      <div className="max-h-[55vh] flex flex-col gap-4 px-4">

        {/* Username */}
        <div>
          <label className="text-dark text-[13px]">
            Username/Email<span className="text-red">*</span>
          </label>
          <IconInput
            iconSrc="/signup/username.png"
            placeholder="Enter Username/Email"
            value={formData.user_name}
            onChange={(e) =>
              setFormData({ ...formData, user_name: e.target.value })
            }
          />
        </div>

        {/* Password */}
        <div>
          <label className="text-dark text-[13px]">
            Password<span className="text-red">*</span>
          </label>
          <IconInput
            iconSrc="/home/password.png"
            placeholder="Enter Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />

          {/* 🔥 SWITCH TO FORGOT */}
          <button
            type="button"
            className="text-xs text-main-green text-right mt-1"
            onClick={() => setView("forgot")}
          >
            Forgot password?
          </button>
        </div>

        {/* Login button */}
        <div className="flex justify-center">
          <button
            type="button"
            className="bg-main-green text-primary rounded-xl w-[55%] py-2.5"
            onClick={handleSignin}
          >
            {loading ? <ClipLoader size={15} /> : "Login"}
          </button>
        </div>
      </div>
    </form>

    {/* Divider */}
    <div className="flex items-center justify-center py-8 px-10">
      <div className="flex-grow border-t border-main-green" />
      <span className="mx-4 text-sm">OR</span>
      <div className="flex-grow border-t border-main-green" />
    </div>

    {/* Social login */}
    <SocialLogin />
  </>
) : (
  <ForgotPasswordView
    onBack={() => setView("login")}
    onSubmit={handleForgotPassword}
    loading={loading}
  />
)}

              {/* ======================================= Social Login ======================================== */}
            
            </div>
          </>

          {/* Divider */}
        </div>
      </Dialog>
    </>
  );


}

export default Signin;
