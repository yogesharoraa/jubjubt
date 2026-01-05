import React from 'react';

interface InputFieldWithIconProps {
  label: string;
  iconSrc: string;
  placeholder: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  name: string;
}

const NameInputBox: React.FC<InputFieldWithIconProps> = ({
  label,
  iconSrc,
  placeholder,
  required = false,
  value,
  onChange,
  name,
}) => {
  return (
    <div className="relative flex flex-col">
      <label className="text-textcolor font-poppins text-sm">
        {label}
        {required && <span className="text-sm text-red-600">*</span>}
      </label>
      <div className="relative">
        <div className="absolute flex items-center justify-center p-3 transform -translate-y-1/2 rounded-lg active_btn_profile  left-2 top-1/2">
          <img src={iconSrc} alt="Icon" className="w-5 h-5" />
        </div>
        <input
          type="text"
          className="border placeholder:text-placeholdercolor border-bordercolor rounded-lg w-full py-4 my-1 pl-16 placeholder:font-poppins placeholder:text-sm placeholder:opacity-50  text-textcolor focus:outline-none focus:ring-1 focus:ring-[#f9a866]"
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          name={name}
        />
      </div>
    </div>
  );
};

export default NameInputBox;
