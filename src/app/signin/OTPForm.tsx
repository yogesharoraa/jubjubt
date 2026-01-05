"use client";
import React, { useRef, useState, useEffect } from "react";
import { ClipLoader } from "react-spinners";
import useApiPost from "../hooks/postData";
import { useAppDispatch, useAppSelector } from "../utils/hooks";
import { clearUserInfo } from "../store/Slice/PhoneEmailSlice";
import { toast } from "react-toastify";
import { VerifyOtpRes } from "../types/ResTypes";
import { hideModal, showModal } from "../store/Slice/ModalsSlice";
import Cookies from "js-cookie";
import { Dialog } from "@mui/material";

function OtpForm() {
  const [timeLeft, setTimeLeft] = useState(120); // Start with 120 seconds (2 minutes)
  const [resendAvailable, setResendAvailable] = useState(false);

  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleBackspace = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const { postData, loading } = useApiPost();

  const dispatch = useAppDispatch();

  const handleCheckOTP = async () => {
    const otpCode = otp.join("");

    if (otpCode.length !== 4 || !/^\d{4}$/.test(otpCode)) {
      toast.error("Please enter a valid 4-digit OTP.");
      return;
    }

    const login_type = phoneNumber ? "phone" : "email";

    // Prepare body conditionally
    const bodyData = phoneNumber
      ? {
          otp: otpCode,
          login_type,
          mobile_num: phoneNumber,
          country_code: countryCode,
        }
      : {
          otp: otpCode,
          login_type,
          email: email,
          platform: "website",
        };

    try {
      const response: VerifyOtpRes = await postData(
        "/users/verfyOtp",
        bodyData
      );

      if (response.status === true) {
        const user = response.data.user;

        if (!user.user_name) {
          dispatch(showModal("Signup"));


          Cookies.set("Reelboost_auth_token", response.data.token, {
          secure: true,
          sameSite: "Strict",
          expires: 30,
        });
        Cookies.set("Reelboost_user_id", String(response.data.user.user_id), {
          secure: true,
          sameSite: "Strict",
          expires: 30,
        });

        

          // Show FreeCoinPopup only after signup
          Cookies.set("FreeCoinPopup", "true");
          dispatch(showModal("FreeCoin")); // this will open your FreeCoinPopup
          dispatch(hideModal("OTP"));
        } else {
          Cookies.set("Reelboost_auth_token", response.data.token, {
          secure: true,
          sameSite: "Strict",
          expires: 30,
        });
        Cookies.set("Reelboost_user_id", String(response.data.user.user_id), {
          secure: true,
          sameSite: "Strict",
          expires: 30,
        });
          dispatch(clearUserInfo());
          toast.success("Signed in successfully!");

          window.location.replace("/");
          dispatch(hideModal("OTP"));
          dispatch(showModal("Profile"));
        }
      } else {
        toast.error(response?.message || "Invalid OTP. Try again.");
      }
    } catch (error: unknown) {
      toast.error("Verification failed. Please try again.");
    }
  };

  // To handle Resend OTP
  useEffect(() => {
    if (timeLeft === 0) {
      setResendAvailable(true);
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft]);

  const countryName = useAppSelector((state) => state.user.country);
  const countryShortName = useAppSelector(
    (state) => state.user.country_short_name
  );
  const countryCode = useAppSelector((state) => state.user.country_code);
  const phone = useAppSelector((state) => state.user.phone);
  const handleResendOTP = async () => {
    const bodyData = phoneNumber
      ? {
          login_type: "phone",
          country: countryName,
          country_short_name: countryShortName.toUpperCase(),
          country_code: countryCode,
          mobile_num: phone,
          platform: "website",
        }
      : {
          login_type: "email",
          platform: "website",
          email: email,
        };

    // const bodyData
    if (resendAvailable) {
      try {
        const response = await postData("/users/signup", bodyData);

        if (response?.status === true) {
        } else {
          toast.error(response?.message || "Something went wrong.");
        }
      } catch {
        toast.error("Error Signing in");
      }
    }
  };

  // Format timeLeft in MM:SS format
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // verification after all digits are entered
  useEffect(() => {
    if (otp.every((digit) => digit !== "")) {
      handleCheckOTP();
    }
  }, [otp]);

  const phoneNumber = useAppSelector((state) => state.user.phone);
  const email = useAppSelector((state) => state.user.email);

  const open = useAppSelector((state) => state.modals.OTP);

  return (
    <Dialog
      open={open}
      onClose={() => dispatch(hideModal("SearchAccounts"))}
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
      <div>
        <button
          onClick={() => dispatch(hideModal("OTP"))}
          className="absolute top-2 right-2 text-dark rounded-full p-2 hover:text-gray-800 transition cursor-pointer"
        >
          ✕
        </button>
        {/* Form Container */}
        <div
          className="flex justify-center rounded-xl py-16"
          style={{ boxShadow: "9.3px 10.46px 64.96px 0px #00000026" }}
        >
          <div className="flex flex-col justify-center relative opacity-100  rounded-xl h-fit ">
            {/* Top Left Ellipse */}

            {/* Sign in Text */}
            <h2 className=" font-poppins font-medium text-dark text-center pb-1">
              Enter otp sent to your registered{" "}
              {phoneNumber ? "number" : "email"}
            </h2>
            <div className="space-y-2 py-2">
              <p className=" text-xs text-center font-poppins text-gray">
                4 digit OTP has been sent to{" "}
                {phoneNumber ? <>{phoneNumber}</> : <>{email}</>}
              </p>
            </div>

            <div className="flex md:gap-4 gap-5 py-3 justify-center">
              {otp.map((value, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  value={value}
                  maxLength={1}
                  disabled={loading}
                  className={`border border-[#D0D0D0] rounded-md w-12 h-12 text-center text-lg font-normal focus:outline-none focus:ring-1 text-dark focus:ring-main-green ${
                    loading ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                  onChange={(e) => {
                    if (!loading) handleChange(index, e.target.value);
                  }}
                  onKeyDown={(e) => {
                    handleBackspace(index, e);
                    if (e.key === "Enter" && otp) {
                      e.preventDefault();
                      handleCheckOTP();
                    }
                  }}
                />
              ))}
            </div>

            <p
              className={`text-main-green font-poppins text-sm justify-center flex py-4`}
            >
              <span
                className={`${timeLeft > 0 ? "" : "cursor-pointer"}`}
                onClick={handleResendOTP}
              >
                Resend OTP
              </span>{" "}
              {timeLeft > 0 && (
                <>
                  <span className="ml-1">in {formatTime(timeLeft)}</span>
                </>
              )}
            </p>

            <div className="flex justify-center">
              <button className="py-2 mt-4 rounded-xl text-sm text-primary font-normal w-[70%] font-poppins bg-main-green">
                {/* //  style={{ background: "linear-gradient(213deg, #6C47B7 -27.59%, #341F60 105.15%)" }}> */}
                {loading ? (
                  <ClipLoader color="#FFFFFF" size={15} loading={loading} />
                ) : (
                  <button
                    className="text-primary font-gilroy_md cursor-pointer"
                    onClick={handleCheckOTP}
                  >
                    Sign In
                  </button>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default OtpForm;
