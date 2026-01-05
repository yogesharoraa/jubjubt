import React from "react";

interface LoginTypeBadgeProps {
    loginType: string;
}

const TableLoginTypeBadge: React.FC<LoginTypeBadgeProps> = ({ loginType }) => {
    // Define styles for each login type
    const styles: Record<string, { textColor: string, backgroundColor: string, darkMode?: { textColor: string, backgroundColor: string } }> = {
        Google: {
            textColor: "#00008B",
            backgroundColor: "rgba(188, 210, 232, 0.5)",
        },
        "phone": {
            textColor: "#452B7A",
            backgroundColor: "rgba(69, 43, 122, 0.1)",
            darkMode: {
                textColor: "#FFF", // light purple
                backgroundColor: "rgba(69, 43, 122, 0.3)",
            },
        },
        email: {
            textColor: "#FFB117",
            backgroundColor: "rgba(255, 225, 100, 0.35)",
        },
        facebook: {
            textColor: "#1877F2",
            backgroundColor: "rgba(24, 119, 242, 0.3)",
        },
        apple: {
            textColor: "#EC5800",
            backgroundColor: "rgba(236, 88, 0, 0.3)",
        },
    };

    // Fallback to default if the loginType does not match any
    const fallback = {
        textColor: "#000000",
        backgroundColor: "#e5e7eb",
    };

    // Get the current styles based on loginType
    const current = styles[loginType] || fallback;

    // Capitalize the first letter of the loginType for display
    const formattedType = loginType ? loginType.charAt(0).toUpperCase() + loginType.slice(1) : "";

    return (
        <div className=" w-full">
            <p
                className="font-poppins  text-textcolor     text-sm rounded-lg w-fit px-2 py-1"
                style={{
                    color: current.textColor,
                    backgroundColor: current.backgroundColor,
                }}
            >
                {formattedType}
            </p>
        </div>
    );
};

export default TableLoginTypeBadge;
