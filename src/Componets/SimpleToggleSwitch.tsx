import React, { useState } from "react";

const SimpleToggleSwitch = () => {
    const [checked, setChecked] = useState(false);

    const handleToggle = () => {
        setChecked(!checked);
    };

    return (
        <label className="inline-flex items-center cursor-pointer">
            <div className="p-[2px] rounded-full bg-gradient-to-tr from-[#6C47B7] via-[#5A3693] to-[#341F60]">
                <div className="relative bg-white dark:bg-black rounded-full w-10 h-6">
                    <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={handleToggle}
                    />
                    <div
                        className={`block w-10 h-6 rounded-full ${checked ? " bggradient" : "bg-white"} transition duration-300`}
                    ></div>
                    <div
                        className={`absolute left-1 top-1 w-4 h-4 rounded-full transition transform ${checked ? "bg-white translate-x-4" : "bg-gradient-to-tr from-[#6C47B7] via-[#5A3693] to-[#341F60]"}`}
                    ></div>
                </div>
            </div>
        </label>
    );
};

export default SimpleToggleSwitch;
