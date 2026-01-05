"use client";
import { useState } from "react";
import PhoneInput, { CountryData } from "react-phone-input-2";
import { useAppDispatch } from "../utils/hooks";
import { hideModal, showModal } from "../store/Slice/ModalsSlice";
import useApiPost from "../hooks/postData";
import { toast } from "react-toastify";
import { setUserPhone } from "../store/Slice/PhoneEmailSlice";
import { ClipLoader } from "react-spinners";
import { SignUpRes } from "../types/ResTypes";
import validator from "validator"

function PhoneSignin() {
  const dispatch = useAppDispatch();
  const { postData, loading } = useApiPost();
  const [phone, setPhone] = useState<string>("");
  const [dialCode, setDialCode] = useState<string>("");
  const [countryName, setCountryName] = useState<string>("");
  const [countryShortName, setCountryShortName] = useState<string>("");

  // validation for phone number =================================================
  const validatePhone = (): boolean => {
  if (!phone) {
    toast.error("Please enter a phone number.");
    return false;
  }

  if (!dialCode || !countryShortName) {
    toast.error("Please select a country code.");
    return false;
  }

  // Remove non-digit characters
  const digits = phone.replace(/\D/g, "");
  const dial = dialCode.replace("+", "");

  // Must start with selected dial code
  if (!digits.startsWith(dial)) {
    toast.error("Phone number must start with the selected country code.");
    return false;
  }

  const mobile = digits.slice(dial.length); // strip dial code

  // Minimum length check (common minimum 5 digits)
  if (mobile.length < 5 || !/^\d+$/.test(mobile)) {
    toast.error("Please enter a valid phone number.");
    return false;
  }

  // Use validator to check mobile number format
  const fullNumber = `+${dial}${mobile}`;
  if (!validator.isMobilePhone(fullNumber)) {
    toast.error("Invalid mobile number format.");
    return false;
  }

  return true;
};


  const handleSignin = async () => {
    if (!validatePhone()) return;
    if (!phone || !dialCode || !countryShortName) {
      toast.error("Please enter a valid phone number");
      return;
    }

    const digits = phone.replace(/\D/g, ""); // remove non-numeric
    const dial = dialCode.replace("+", "");

    // Must start with selected dial code
    if (!digits.startsWith(dial)) {
      toast.error("Phone number must start with the selected country code.");
      return;
    }

    const mobile = digits.slice(dial.length); // strip dial code

    if (mobile.length < 5 || !/^\d+$/.test(mobile)) {
      toast.error(`Please enter a valid phone number`);
      return;
    }

    try {
      const response: SignUpRes = await postData("/users/signup", {
        login_type: "phone",
        country: countryName,
        country_short_name: countryShortName.toUpperCase(),
        country_code: `+${dial}`,
        mobile_num: mobile,
        platform: "website",
      });

      if (response?.status === true) {
        dispatch(
          setUserPhone({
            phone: mobile,
            country_code: `+${dial}`,
            country_short_name: countryShortName.toUpperCase(),
            country: countryName,
          })
        );

        dispatch(showModal("OTP"));
        dispatch(hideModal("Signin"));
      } else {
        toast.error(response?.message || "Something went wrong.");
      }
    } catch {
      toast.error("Error Signing in");
    }
  };

  return (
    <>
      <div className="flex flex-col gap-1">
        <label className="text-dark text-sm font-">
          Mobile Number<span className="text-red">*</span>
        </label>

        <div className="relative">
          <PhoneInput
          //@ts-ignore
            className="border border-border-color text-dark rounded-lg w-full p-2 placeholder:text-xs py-1.5 placeholder:text-gray bg-primary focus:outline-none focus:ring-1 focus:ring-main-green"
            placeholder="Mobile Number"
            value={phone}
            onChange={(value, data:CountryData) => {
              setPhone(value);
              setDialCode(data.dialCode || "");
              setCountryName(data.name || "");
              setCountryShortName(data.countryCode || "");
            }}
            
            country={"us"}
            enableSearch
            onKeyDown={(e) => {
              if (e.key === "Enter" && phone) {
                e.preventDefault();
                handleSignin();
              }
            }}
          />
        </div>
      </div>

      {/* Continue button ================== */}
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

export default PhoneSignin;
