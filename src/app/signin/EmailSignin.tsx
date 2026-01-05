"use client";
import React, { useState } from "react";
import { hideModal, showModal } from "../store/Slice/ModalsSlice";
import { useAppDispatch } from "../utils/hooks";
import useApiPost from "../hooks/postData";
import { toast } from "react-toastify";
import { setUserEmail } from "../store/Slice/PhoneEmailSlice";
import { ClipLoader } from "react-spinners";
import { SignUpRes } from "../types/ResTypes";
import Image from "next/image";
import validator from "validator"

function EmailSignin() {
  const dispatch = useAppDispatch();
  const { postData, loading } = useApiPost();
  const [email, setEmail] = useState<string>("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isEmailValid = (email: string) => validator.isEmail(email.trim());

  const handleSignin = async () => {
     if (!isEmailValid(email)) return toast.error("Invalid email format.");
    if (!email) return toast.error("Please enter your email.");
    if (!validateEmail(email)) return toast.error("Invalid email format.");

    try {
      const response: SignUpRes = await postData("/users/signup", {
        login_type: "email",
        email: email.trim(), //  Send actual email
        platform: "website",
      });
 
      if (response?.status === true) {
        dispatch(setUserEmail(email));
        dispatch(showModal("OTP"));
        dispatch(hideModal("Signin"));
      } else {
        toast.error(response?.message || "Something went wrong.");
      }
    } catch {
      toast.error("Error signing in");
    }
  };

  return (
    <>
      {/* Email Input */}
      <div className="flex flex-col gap-1">
        <label className="text-dark text-sm">
          Email<span className="text-red">*</span>
        </label>
        <div className="relative">
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full flex items-center justify-center background-opacityGradient">
            <Image src="/signup/email.png" alt="Email" width={20} height={20}/>
          </div>
          <input
            type="text"
            className="border border-border-color rounded-lg text-dark w-full py-4 pl-16 text-xs placeholder:text-gray bg-white focus:outline-none focus:ring-1 focus:ring-main-green"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
            spellCheck="false"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSignin();
              }
            }}
          />
        </div>

        {/* Invalid Email Warning */}
        {email && !validateEmail(email) && (
          <div className="flex gap-1 items-center mt-1">
            <Image src="/signup/notValid.png" alt="not valid" height={12} width={12} />
            <p className="text-xs text-red">Not valid email format</p>
          </div>
        )}
      </div>

      {/* Next Button */}

      <div className="flex justify-center mt-8">
        <button
          className="bg-main-green w-[70%] rounded-xl p-2.5 text-primary text-sm cursor-pointer"
          onClick={handleSignin}
        >
          {loading ? (
            <ClipLoader loading={loading} color="#FFFFFF" size={15} />
          ) : (
            <>Continue</>
          )}
        </button>
      </div>
    </>
  );
}

export default EmailSignin;
