import React from "react";

interface ToggleSwitchProps {
    checked: boolean;
    onChange: () => void;
    id?: string | number;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, id }) => {
    return (
        <label htmlFor={`toggle-${id}`} className="inline-flex items-center cursor-pointer">
            {/* Gradient border wrapper */}
            <div className="p-[2px] rounded-full bg-gradient-to-tr from-[#6C47B7] via-[#5A3693] to-[#341F60]">
                <div className="relative bg-white dark:bg-black rounded-full w-10 h-6">
                    <input
                        type="checkbox"
                        id={`toggle-${id}`}
                        className="sr-only"
                        checked={checked}
                        onChange={onChange}
                    />
                    <div
                        className={`block w-10 h-6 rounded-full ${checked ? "bg-green-500" : " bg-white"
                            } transition duration-300`}
                    ></div>
                    <div
                        className={`dot absolute left-1 top-1 w-4 h-4 rounded-full  bggradient transition transform ${checked ? "translate-x-4" : ""
                            }`}
                    ></div>
                </div>
            </div>
        </label>
    );
};

export default ToggleSwitch;
