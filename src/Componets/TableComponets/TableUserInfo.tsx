import React from "react";

interface UserInfoProps {
    profilePic: string;
    username: string;
    email: string;
    mobile: string;
    loginType: 'email' | 'phone' | 'social';
    onClick: () => void;
}

const TableUserInfo: React.FC<UserInfoProps> = ({
    profilePic,
    username,
    email,
    mobile,
    loginType,
    onClick
}) => {
    const displayValue = email?.trim()
        ? email
        : mobile?.trim()
        ? mobile
        : 'N/A';

    return (
        <div className="w-full flex gap-2 items-center cursor-pointer" onClick={onClick}>
            <img src={profilePic} alt="Profile" className="w-12 h-12 rounded-full" />
            <div>
                <h2 className="text-textcolor font-poppins text-sm font-semibold cursor-pointer">
                    {username || 'N/A'}
                </h2>
                <p className="text-xs text-[#939393] dark:text-tableDarkLarge light:text-tableLightLarge font-poppins">
                    {displayValue}
                </p>
            </div>
        </div>
    );
};

export default TableUserInfo;
