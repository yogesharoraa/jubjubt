import React from "react";
import formatTime from "../../Hooks/formatTime";
import formatDate from "../../Hooks/formatDate";

interface DateTimeDisplayProps {
    dateString: string;
}

const TableDateTimeDisplay: React.FC<DateTimeDisplayProps> = ({ dateString }) => {
    return (
        <div className="w-full">
            <p className="text-textcolor text-sm font-poppins">
                {formatDate(dateString)}
            </p>
            <h2 className="text-[#777777] dark:text-tableDarkLarge font-poppins text-xs">
                {formatTime(dateString)}
            </h2>
        </div>
    );
};

export default TableDateTimeDisplay;
