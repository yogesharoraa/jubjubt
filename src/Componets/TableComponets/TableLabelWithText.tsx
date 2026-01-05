import React from "react";

interface LabelWithTextProps {
    label: string;
    textColor?: string; // Optional color prop for flexibility
}

const TableLabelWithText: React.FC<LabelWithTextProps> = ({ label, textColor = "#00162e" }) => {
    return (
        <div className="w-[40%]">
            <h2 className="font-poppins  text-sm" style={{ color: textColor }}>
                {label}
            </h2>
        </div>
    );
};

export default TableLabelWithText;
