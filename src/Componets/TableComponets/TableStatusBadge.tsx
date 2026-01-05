import React from "react";

interface StatusBadgeProps {
    status: string;
    activeText?: string; 
    deactiveText?: string;
    activeColor?: string;     // Text color when active
    deactiveColor?: string;   // Text color when inactive
    activeBg?: string;        // Background color when active
    deactiveBg?: string;      // Background color when inactive
}

const TableStatusBadge: React.FC<StatusBadgeProps> = ({
    status,
    activeText = "Active",
    deactiveText = "Deactive",
    activeColor = "#FFFFFF",          // white text
    activeBg = "#0D9947",             // green background
    deactiveColor = "#EF4444",        // red text
    deactiveBg = "#000000"            // black background
}) => {
    const isActive = status === "1";

    const badgeStyle = {
        color: isActive ? activeColor : deactiveColor,
        backgroundColor: isActive ? activeBg : deactiveBg,
    };  

    return (
        <div className="w-full">
            <h2
                className="font-poppins text-sm w-fit rounded-xl px-2 py-1"
                style={badgeStyle}
            >
                {isActive ? activeText : deactiveText}
            </h2>
        </div>
    );
};

export default TableStatusBadge;
