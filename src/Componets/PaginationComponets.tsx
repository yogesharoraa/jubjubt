// PaginationComponents.tsx
import React, { useEffect, useRef, useState } from 'react';
import Arrow from '/Images/Showing_Arrow.png';
import { useAppSelector, useAppDispatch } from '../Hooks/Hooks';
import { setPaginationValues } from '../Appstore/Slice/PaginationValues';

interface PaginationProps {
    paginationKey: string;
    onPaginationChange?: () => void;
}

const PaginationComponents: React.FC<PaginationProps> = ({ paginationKey, onPaginationChange }) => {
    const dispatch = useAppDispatch();
    const pagination = useAppSelector((state) => state.PaginationValues[paginationKey]) || {
        current_page: 1,
        records_per_page: 10,
        total_pages: 1,
        total_records: 0,
    };

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const options = ["10", "25", "50", "100"];

    const { current_page, records_per_page, total_pages, total_records } = pagination;

    const handleSelect = (value: string) => {
        const newLimit = parseInt(value, 10);
        setIsDropdownOpen(false);
        dispatch(setPaginationValues({
            key: paginationKey,
            data: {
                ...pagination,
                current_page: 1,
                records_per_page: newLimit,
            },
        }));
        onPaginationChange?.();
    };

    const goToPage = (page: number) => {
        if (page < 1 || page > total_pages) return;
        dispatch(setPaginationValues({
            key: paginationKey,
            data: {
                ...pagination,
                current_page: page,
            },
        }));
        onPaginationChange?.();
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
          <div className="flex justify-between w-[600px]   md:w-full  px-2  md:px-10 py-6  bg-primary">
            {/* Dropdown */}
            <div className="relative flex gap-2 items-center" ref={dropdownRef}>
                <div
                    className="border border-[#9C9C9C] bg-[#edeff166] dark:border-[#1F1F1F] bg-primary rounded-xl flex gap-2 items-center px-3 py-1 cursor-pointer"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                    <p className="text-textcolor  font-poppins">{records_per_page}</p>
                    <img src={Arrow} className="w-4 h-4" alt="Dropdown Arrow" />
                </div>

                {isDropdownOpen && (
                    <div className="absolute left-0 z-50 mb-2 border  bg-primary border-bordercolor rounded-lg shadow-lg bottom-full w-max">
                        {options.map((option) => (
                            <p
                                key={option}
                                className="px-4 py-2 text-sm cursor-pointer text-textcolor hover:bg-gray-100"
                                onClick={() => handleSelect(option)}
                            >
                                {option}
                            </p>
                        ))}
                    </div>
                )}

                <p className="text-[#333333] font-poppins text-sm dark:text-gray-600">
                    Showing <span className="font-semibold  text-textcolor text-sm">
                        {total_records}
                    </span> results
                </p>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1">
                <button
                    className={`text-textcolor text-sm font-poppins px-3 py-1 rounded-full transition-all duration-200 
          ${current_page === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"}`}
                    onClick={() => goToPage(current_page - 1)}
                    disabled={current_page === 1}
                >
                    Previous
                </button>

                {[...Array(total_pages)].map((_, index) => {
                    const page = index + 1;
                    return (
                        <button
                            key={page}
                            className={`text-sm font-poppins px-3 py-1 cursor-pointer rounded-full transition-all duration-200 
                ${current_page === page ? "text-white bg-button-gradient bggradient  cursor-pointer" : "text-textcolor hover:bg-gray-200"}`}
                            onClick={() => goToPage(page)}
                        >
                            {page}
                        </button>
                    );
                })}

                <button
                    className={`text-textcolor text-sm font-poppins px-3 py-1 rounded-full transition-all duration-200 
          ${current_page === total_pages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"}`}
                    onClick={() => goToPage(current_page + 1)}
                    disabled={current_page === total_pages}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default PaginationComponents;
