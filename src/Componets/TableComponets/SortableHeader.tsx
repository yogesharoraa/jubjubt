import React from "react";
import DeactiveArrow from "/Images/deactive_Arrow.png";
import Dropdown from "/Images/dropdown.png";

interface SortableHeaderProps {
    title: string;
    category: string;
    order: string;
    setCategory: (category: string) => void;
    setOrder: (order: string) => void;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({ title, category, order, setCategory, setOrder }) => {
    const isActive = category === title;

    return (
        <div className="  w-full text-[#666666] font-poppins text-sm flex place-items-center gap-2 font-semibold">
            {title}
            <div className="flex flex-col">
                <button
                    onClick={() => {
                        setOrder("0");
                        setCategory(title);
                    }}
                    className=" cursor-pointer"
                >
                    <img src={isActive && order === "0" ? Dropdown : DeactiveArrow} className="w-2 h-2 rotate-180 transition" alt="Sort Descending" />
                </button>
                <button
                    onClick={() => {
                        setOrder("1");
                        setCategory(title);
                    }}
                    className=" cursor-pointer"
                >
                    <img src={isActive && order === "1" ? Dropdown : DeactiveArrow} className="w-2 h-2" alt="Sort Ascending" />
                </button>
            </div>
        </div>
    );
};

export default SortableHeader;
