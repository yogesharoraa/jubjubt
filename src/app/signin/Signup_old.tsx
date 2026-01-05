"use client";
import { Dialog } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../utils/hooks";
import "react-phone-input-2/lib/high-res.css";
import PhoneInput from "react-phone-input-2";
import { hideModal, showModal } from "../store/Slice/ModalsSlice";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import IconInput from "../components/SignupField";
import { FindUserRes, UpdateUserRes } from "../types/ResTypes";
import useApiPost from "../hooks/postData";
import { ClipLoader } from "react-spinners";
import Image from "next/image";
import validator from "validator";
import Gender from "./Gender";
import Cookies from "js-cookie";

export default function Signup() {
  const dispatch = useAppDispatch();
  const { postData, loading } = useApiPost();
  const [isChecked, setIsChecked] = useState(false);
  const [selectedGender, setSelectedGender] = useState("");

  // ✅ Local-only form data (no Redux pre-fill)
  const [formData, setFormData] = useState({
    user_name: "",
    first_name: "",
    last_name: "",
    full_name: "",
    email: "",
    password: "",
    mobile_num: "", // from input only
    country: "",
    country_short_name: "",
    country_code: "",
    gender: selectedGender,
  });

  const genderOptions = ["male", "female"];
  const handleSelectGender = (gender: string) => {
    setSelectedGender(gender);
    // dispatch(updateField({ key: "gender", value: gender }));
  };

  const resetForm = () => {
  setFormData({
    user_name: "",
    first_name: "",
    last_name: "",
    full_name: "",
    email: "",
    password: "",
    mobile_num: "",
    country: "",
    country_short_name: "",
    country_code: "",
    gender: "",
  });
  setSelectedGender("");
  setIsChecked(false);
};

  // ✅ Validate signup fields
  const validateSignup = () => {
    const {
      user_name,
      first_name,
      last_name,
      email,
      mobile_num,
      password,
      country,
      country_code,
      country_short_name,
      gender,
    } = formData;

    // ✅ Check all required fields
    if (
      !user_name ||
      !first_name ||
      !last_name ||
      !email ||
      !mobile_num ||
      !password ||
      !country ||
      !country_code ||
      !country_short_name ||
      !gender
    ) {
      toast.error("All fields are required.");
      return false;
    }

    if (!user_name || !validator.matches(user_name, /^[a-zA-Z0-9_.-]+$/)) {
      toast.error(
        "Username can only contain letters, numbers, underscores (_), hyphens (-), and dots (.)"
      );
      return false;
    }

    if (!email || !validator.isEmail(email)) {
      toast.error("Please enter a valid email address.");
      return false;
    }

    if (!mobile_num) {
      toast.error("Please enter a valid phone number.");
      return false;
    }

    const phoneWithoutPlus = mobile_num;

    if (mobile_num.length < 5 || !/^\d+$/.test(mobile_num)) {
      toast.error("Please enter a valid phone number.");
      return false;
    }

    // 🧠 Password validation: only letters, numbers, @, and _
    const passwordRegex = /^[A-Za-z0-9@_]+$/;

    if (!passwordRegex.test(formData.password)) {
      toast.error("Password can only contain letters, numbers, '@' and '_'.");
      return;
    }

    return true;
  };

  // ✅ Full name updater
  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const first_name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      first_name,
      full_name: `${first_name} ${prev.last_name}`.trim(),
    }));
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const last_name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      last_name,
      full_name: `${prev.first_name} ${last_name}`.trim(),
    }));
  };

  // ✅ Signup handler
  const handleSignup = async () => {
    if (!validateSignup()) return;

    try {
      const response: UpdateUserRes = await postData("/users/register-user", {
        user_name: formData.user_name,
        first_name: formData.first_name,
        last_name: formData.last_name,
        mobile_num: formData.mobile_num,
        country: formData.country,
        email: formData.email,
        password: formData.password,
        country_code: formData.country_code,
        country_short_name: formData?.country_short_name,
        gender: selectedGender,
        full_name: `${formData.first_name} ${formData.last_name}`,
      });

      if (response.status === false) {
        toast.error(response.message);
      } else {
        toast.success("Signed up successfully!");
        dispatch(hideModal("Signup"));
        dispatch(showModal("Signin"));
      }
    } catch {
      toast.error("Signup failed. Please try again.");
    }
  };

  console.log("Form Data !@!!2", formData);
  const open = useAppSelector((state) => state.modals.Signup);

  return (
    <Dialog
      open={open}
      onClose={() => {dispatch(hideModal("Signup")); resetForm()}}
      fullWidth
      PaperProps={{
        sx: {
          p: 0,
          overflow: "visible",
          borderRadius: 3,
          maxHeight: "90vh",
          width: "430px",
          maxWidth: "100%",
        },
      }}
      BackdropProps={{
        sx: {
          background: "#000000BD",
        },
      }}
    >
      <div
        className="rounded-xl py-5 px-5"
        style={{ boxShadow: "9.3px 10.46px 64.96px 0px #00000026" }}
      >
        <h3 className="pb-6 text-[20px] font-medium text-dark text-center">
          Signup
        </h3>
        <form>
          <div className="max-h-[55vh] overflow-y-auto flex flex-col gap-4 px-4">
            {/* Username */}
            <div className="flex flex-col gap-0.5 relative">
              <label className="text-dark text-[13px]">
                User Name<span className="text-red">*</span>
              </label>
              <IconInput
                iconSrc="/signup/username.png"
                placeholder="Enter Username"
                value={formData.user_name}
                onChange={(e) => {
                  const user_name = e.target.value;
                  setFormData({ ...formData, user_name });
                }}
              />
            </div>

            {/* First Name */}
            <div className="flex flex-col gap-0.5">
              <label className="text-dark text-[13px]">
                First Name<span className="text-red">*</span>
              </label>
              <IconInput
                iconSrc="/signup/name.png"
                placeholder="Enter First Name"
                value={formData.first_name}
                onChange={handleFirstNameChange}
              />
            </div>

            {/* Last Name */}
            <div className="flex flex-col gap-0.5">
              <label className="text-dark text-[13px]">
                Last Name<span className="text-red">*</span>
              </label>
              <IconInput
                iconSrc="/signup/name.png"
                placeholder="Enter Last Name"
                value={formData.last_name}
                onChange={handleLastNameChange}
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-0.5 relative">
              <label className="text-dark text-[13px]">
                Email<span className="text-red">*</span>
              </label>
              <IconInput
                iconSrc="/signup/email.png"
                placeholder="Enter Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-0.5">
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
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-0.5">
              <label className="text-dark text-[13px]">
                Phone Number<span className="text-red">*</span>
              </label>
              <div className="relative">
                <PhoneInput
                  country={"in"}
                  enableSearch
                  value={formData.mobile_num}
                  onChange={(value, data) => {
                    // Ensure 'data' is of type CountryData
                    const countryData =
                      data as import("react-phone-input-2").CountryData;
                    setFormData((prev) => ({
                      ...prev,
                      mobile_num: value, // full number e.g. +919876543210
                      country: countryData?.name || "",
                      country_code: countryData?.dialCode
                        ? `+${countryData.dialCode}`
                        : "",
                      country_short_name:
                        countryData?.countryCode?.toUpperCase() || "",
                    }));
                  }}
                  containerClass="custom-phone-input"
                  
                />
              </div>
            </div>


            {/* Gender */}
            <div className="w-full flex flex-col relative h-full">
              <label
                htmlFor="gender"
                className="font-poppins text-sm font-normal text-textcolor mb-2"
              >
                Gender
                <span className="text-[#F21818] pl-[1px]">*</span>
              </label>

              <div className="flex flex-col gap-3 mt-1">
                {genderOptions.map((gender) => (
                  <label
                    key={gender}
                    className="flex items-center gap-3 cursor-pointer font-poppins text-textcolor text-sm"
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={gender}
                      checked={selectedGender === gender}
                      onChange={() => {
                        handleSelectGender(gender);
                        setFormData({ ...formData, gender: gender });
                      }}
                      className="w-4 h-4 rounded-full border border-gray-400 appearance-none checked:border-[6px] checked:border-[var(--color-main-green)] transition-all duration-150"
                    />
                    {gender}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="my-5">
            <div className="flex gap-1 px-2 py-4 justify-center">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
              />
              <p className="text-dark text-sm text-center">
                I agree to the{" "}
                <span className="text-main-green cursor-pointer hover:underline">
                  Terms of Services
                </span>{" "}
                &{" "}
                <span className="text-main-green hover:underline cursor-pointer">
                  Privacy Policy
                </span>
              </p>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                className="bg-main-green cursor-pointer text-primary rounded-xl w-[55%] py-2.5 font-normal text-sm"
                onClick={() => {
                  if (!isChecked) {
                    toast.error(
                      "Please agree to Terms & Privacy Policy to continue"
                    );
                    return;
                  }
                  handleSignup();
                }}
              >
                {loading ? (
                  <ClipLoader color="#FFFFFF" size={15} loading={loading} />
                ) : (
                  <>Next</>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
