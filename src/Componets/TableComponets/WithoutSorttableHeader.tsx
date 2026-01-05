import React from "react";

interface LabeledHeaderProps {
    label: string;
    children?: React.ReactNode;
}

const WithoutSorttableHeader: React.FC<LabeledHeaderProps> = ({ label, children }) => {
    return (
        <div className=" w-full text-[#666666] font-poppins text-sm flex place-items-center gap-2 font-semibold">
            {label}
            {children}
        </div>
    );
};

export default WithoutSorttableHeader;
