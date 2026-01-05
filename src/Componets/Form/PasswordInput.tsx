import React, { useState } from 'react';
import Lock1 from "/Images/lock.png"

interface PasswordInputProps {
    label: string;
    placeholder: string;
    onPasswordChange: (password: string) => void;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ label, placeholder, onPasswordChange }) => {
    const [password, setPassword] = useState<string>('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        onPasswordChange(e.target.value);
    };

    return (
        <div className="relative flex flex-col">
            <label className="text-textcolor font-poppins text-sm ">
                {label}
                <span className='text-sm text-red-600'>*</span>
            </label>
            <div className="relative">
                <div className="absolute flex items-center justify-center p-3 transform -translate-y-1/2 rounded-lg  active_btn_profile  left-2 top-1/2">
                    <img src={Lock1} alt="Lock Icon" className="w-5 h-5" />
                </div>
                <input
                    type="text" // Change input type to 'password' for security
                    className="border placeholder:text-placeholdercolor border-bordercolor rounded-lg w-full py-4 my-1 pl-16 placeholder:font-poppins placeholder:text-sm placeholder:opacity-50  text-textcolor focus:outline-none focus:ring-1 focus:ring-[#f9a866]"
                    placeholder={placeholder}
                    required
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    value={password}
                    onChange={handleChange}
                />
            </div>
        </div>
    );
};

export default PasswordInput;
