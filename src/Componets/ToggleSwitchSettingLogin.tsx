import React from 'react'


const ToggleSwitchSettingLogin = ({
    label,
    enabled,
    loading,
    onChange,
}: {
    label: string;
    enabled: boolean;
    loading: boolean;
    onChange: () => void;
}) => (
    <div className="w-full border rounded-lg border-bordercolor flex justify-between items-center p-3">
        <h5 className="text-textcolor font-poppins font-normal text-sm">{label}</h5>
        <label className="flex items-center cursor-pointer select-none">
            <div className="relative">
                <input
                    type="checkbox"
                    checked={enabled}
                    onChange={onChange}
                    className="sr-only"
                    disabled={loading}
                />
                <div
                    className={`block h-6 w-10 rounded-full border transition duration-300 ${
                        enabled
                            ? "border-toggalbtcolorborder bggradient"
                            : "bg-transparent border border-toggalbtcolorborder"
                    }`}
                ></div>
                <div
                    className={`absolute top-1 h-4 w-4 rounded-full transition duration-300 ${
                        enabled ? "right-1 bg-white" : "left-1 bggradient"
                    }`}
                ></div>
            </div>
        </label>
    </div>
);

export default ToggleSwitchSettingLogin
