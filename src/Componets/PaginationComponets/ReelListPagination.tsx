import React, { useEffect, useRef, useState } from 'react';
import Arrow from '/Images/Showing_Arrow.png';
import { useAppSelector, useAppDispatch } from '../../Hooks/Hooks';
import { setPaginationReelList } from '../../Appstore/Slice/PaginationSlice/ReelListPaginationSlice';

function ReelListPagination() {
    const dispatch = useAppDispatch();
    const pagination = useAppSelector((state) => state.ReelListPaginationSlice);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const options = ["10", "25", "50", "100"];

    const activePage = pagination.current_page;
    const recordsPerPage = pagination.records_per_page;
    const totalPages = pagination.total_pages || 1;

    const handleSelect = (value: string) => {
        const newLimit = parseInt(value);
        setIsDropdownOpen(false);

        // Reset to page 1 with new records per page
        dispatch(setPaginationReelList({
            ...pagination,
            current_page: 1,
            records_per_page: newLimit,
        }));
    };

    const goToPage = (page: number) => {
        if (page < 1 || page > totalPages) return;
        dispatch(setPaginationReelList({
            ...pagination,
            current_page: page,
        }));
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !(dropdownRef.current as any).contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="flex justify-between px-10 py-6 bg-white bg-primary">
            {/* Dropdown */}
            <div className="relative flex gap-2 items-center" ref={dropdownRef}>
                <div
                    className="border border-[#9C9C9C] bg-[#edeff166] dark:border-[#1F1F1F] bg-primary rounded-xl flex gap-2 items-center px-3 py-1 cursor-pointer"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                    <p className="text-textcolor  font-poppins">{recordsPerPage}</p>
                    <img src={Arrow} className="w-4 h-4" alt="Dropdown Arrow" />
                </div>

                {isDropdownOpen && (
                    <div className="absolute left-0 z-50 mb-2 bg-white border dark:border-[#1F1F1F] bg-primary border-gray-300 rounded-lg shadow-lg bottom-full w-max">
                        {options.map((option) => (
                            <p
                                key={option}
                                className="px-4 py-2 text-sm cursor-pointer  hover:bg-gray-100"
                                onClick={() => handleSelect(option)}
                            >
                                {option}
                            </p>
                        ))}
                    </div>
                )}

                <p className="text-[#333333] font-poppins text-sm dark:text-gray-600">
                    Showing <span className="font-semibold  text-textcolor text-sm">
                        {pagination?.total_records || 0}
                    </span> results
                </p>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1">
                <button
                    className={`text-textcolor  text-sm font-poppins px-3 py-1 rounded-full transition-all duration-200 
                    ${activePage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"}`}
                    onClick={() => goToPage(activePage - 1)}
                    disabled={activePage === 1}
                >
                    Previous
                </button>

                {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    return (
                        <button
                            key={page}
                            className={`text-sm font-poppins px-3 py-1 rounded-full transition-all duration-200 
                            ${activePage === page ? "text-white bg-button-gradient bggradient  cursor-pointer" : "text-textcolor  hover:bg-gray-200"}`}
                            onClick={() => goToPage(page)}
                        >
                            {page}
                        </button>
                    );
                })}

                <button
                    className={`text-textcolor  text-sm font-poppins px-3 py-1 rounded-full transition-all duration-200 
                    ${activePage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"}`}
                    onClick={() => goToPage(activePage + 1)}
                    disabled={activePage === totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default ReelListPagination;
