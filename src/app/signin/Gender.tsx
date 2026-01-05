"use client";
import React, { useState } from "react";
import { useDispatch } from "react-redux";

const Gender = () => {
  const dispatch = useDispatch();
  const [selectedGender, setSelectedGender] = useState("");

  const genderOptions = ["Male", "Female"];

  const handleSelectGender = (gender: string) => {
    setSelectedGender(gender);
    // dispatch(updateField({ key: "gender", value: gender }));
  };

  return (
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
              onChange={() => handleSelectGender(gender)}
              className="w-4 h-4 rounded-full border border-gray-400 appearance-none checked:border-[6px] checked:border-[var(--color-main-green)] transition-all duration-150"
            />
            {gender}
          </label>
        ))}
      </div>
    </div>
  );
};

export default Gender;
