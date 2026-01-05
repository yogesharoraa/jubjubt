import React from "react";

const InputField = ({ label, value, placeholder, onChange, type = "text" }: { label: string, value: string, placeholder: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string }) => (
    <div>
        <label className="text-textcolor font-poppins font-semibold text-sm">{label}</label>
        <input
            type={type}
            placeholder={placeholder}
            className="border border-bordercolor rounded-md w-full py-3 my-1 px-4 placeholder:font-gilroy_regular placeholder:text-sm placeholder:text-placeholdercolor placeholder:opacity-50 bg-primary  text-textcolor  focus:outline-none focus:ring-1 focus:ring-bordercolor"
            value={value}
            onChange={onChange}
        />
    </div>
);

export default InputField;
