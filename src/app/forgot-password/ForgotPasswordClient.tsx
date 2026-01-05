"use client"

import { useSearchParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import useApiPost from "../hooks/postData";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";

export default function ForgotPasswordClient() {
  const params = useSearchParams();
  const token = params.get("token");
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const [password, setPassword] = useState("");
  const { postData, loading } = useApiPost();

  const handleReset = async () => {
    if (!password) {
      toast.error("Enter new password");
      return;
    }

    const res = await postData("/users/reset-password", {
      token,
      newPassword: password,
    });

    if (res?.status) {
      toast.success("Password updated successfully");
      router.push("/");
    } else {
      toast.error(res?.message || "Invalid or expired link");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E9F9F1] to-[#F6F9FB] px-4">
      <div className="bg-white w-full max-w-[380px] rounded-2xl shadow-xl p-6 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-main-green" />

        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-dark">
            Create New Password
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Your new password must be different from previous passwords
          </p>
        </div>

        <div className="flex flex-col gap-1 mb-4">
          <label className="text-sm text-dark font-medium">
            New Password
          </label>
       <div className="relative">
  <input
    type={showPassword ? "text" : "password"}
    className="w-full border rounded-xl px-4 py-2.5 pr-12 text-sm 
               text-dark placeholder-gray-400 
               focus:outline-none focus:ring-2 focus:ring-main-green transition"
    placeholder="Enter new password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />

  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 
               text-gray-500 hover:text-dark transition"
    aria-label={showPassword ? "Hide password" : "Show password"}
  >
    {showPassword ? "🙈" : "👁️"}
  </button>
</div>

        </div>

        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full bg-main-green text-white py-2.5 rounded-xl font-medium 
                     hover:opacity-90 transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <ClipLoader size={16} color="#fff" />
              Updating...
            </>
          ) : (
            "Reset Password"
          )}
        </button>

        <p className="text-[11px] text-center text-gray-400 mt-5">
          If you didn’t request a password reset, you can safely ignore this.
        </p>
      </div>
    </div>
  );
}


