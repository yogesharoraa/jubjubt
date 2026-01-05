"use client";

import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import useApiPost from "../hooks/postData";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";

export default function VerifyEmail() {
  const params = useSearchParams();
  const token = params.get("token");
  const router = useRouter();
  const { postData, loading } = useApiPost();

  const hasVerified = useRef(false); // 🔐 prevents double call
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!token || hasVerified.current) return;

    hasVerified.current = true;
    verifyEmail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const verifyEmail = async () => {
    const res = await postData("/users/verify-email", { token });

    if (res?.status) {
      setVerified(true);
      toast.success("Email verified successfully");
    } else {
      toast.error(res?.message || "Invalid or expired verification link");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E9F9F1] to-[#F6F9FB] px-4">
      <div className="bg-white w-full max-w-[380px] rounded-2xl shadow-xl p-6 relative overflow-hidden text-center">
        <div className="absolute inset-x-0 top-0 h-1 bg-main-green" />

        <h2 className="text-xl font-semibold text-dark mb-2">
          {verified ? "Email Verified 🎉" : "Verify Your Email"}
        </h2>

        <p className="text-sm text-gray-500 mb-6">
          {verified
            ? "Your email has been successfully verified."
            : "Please wait while we verify your email address"}
        </p>

        {!verified && (
          <div className="flex justify-center mb-6">
            <ClipLoader size={36} color="#22c55e" loading={loading} />
          </div>
        )}

        {verified && (
          <button
            onClick={() => router.push("/")}
            className="w-full bg-main-green text-white py-2.5 rounded-xl font-medium 
                       hover:opacity-90 transition"
          >
            Go to Home
          </button>
        )}

        {!verified && (
          <p className="text-[12px] text-gray-400 mt-5">
            If verification does not complete, please request a new link.
          </p>
        )}
      </div>
    </div>
  );
}
