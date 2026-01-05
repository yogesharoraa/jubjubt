import React, { useState } from 'react';
import { MdOutlineChevronRight, MdOutlineCheck } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { setGender } from '../../../Appstore/Slice/addVendorSlice';

const GenderVendor = () => {
    const dispatch = useDispatch();

    const [searchValue, setSearchValue] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedGender, setSelectedGender] = useState('');
    const [rotate, setRotate] = useState(false);

    const genderOptions = ['Male', 'Female'];

    const handleToggle = () => {
        setShowDropdown(!showDropdown);
        setRotate(!rotate);
    };

    const handleSelectGender = (gender: string) => {
        setSelectedGender(gender);
        setSearchValue(gender);
        setShowDropdown(false);
        setRotate(false);

        // 👇 Dispatch gender as "M" or "F"
        dispatch(setGender(gender === 'Male' ? 'male' : 'female'));
    };

    const handleClear = () => {
        setSelectedGender('');
        setSearchValue('');
        dispatch(setGender(null)); // reset if needed
    };

    return (
        <div className="w-full flex flex-col relative h-full">
            <label htmlFor="gender" className="font-poppins text-sm font-normal text-textcolor">
                Gender
                <span className="text-[#F21818] pl-[1px]">*</span>
            </label>

            <div className="relative mt-2 flex items-center cursor-pointer">
                <input
                    type="text"
                    id="gender"
                    name="gender"
                    autoComplete="off"
                    spellCheck="false"
                    className="w-full rounded-lg border border-bordercolor text-textcolor bg-primary px-4 py-2.5 my-1 placeholder:font-gilroy_regular placeholder:text-sm placeholder:text-textcolor placeholder:opacity-50 focus:outline-none focus:ring-1 focus:ring-header"
                    placeholder="Select gender"
                    value={searchValue}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    onChange={(e) => setSearchValue(e.target.value)}
                />
                <div
                    className={`absolute right-2 text-xl cursor-pointer transition-transform ${rotate ? 'rotate-90' : '-rotate-90'}`}
                    onClick={handleToggle}
                >
                    <MdOutlineChevronRight className="text-xl" />
                </div>
            </div>

            {selectedGender && (
                <div className="flex flex-wrap mt-2 gap-2">
                    <span className="flex items-center bg-maincolor text-white px-3 py-1 rounded-full text-sm font-poppins">
                        {selectedGender}
                        <button className="ml-2 text-red-500 hover:text-red-700" onClick={handleClear}>×</button>
                    </span>
                </div>
            )}

            {showDropdown && (
                <ul className="absolute top-[5.9rem] left-0 w-full bg-primary text-textcolor rounded-lg shadow-lg z-10 border border-bordercolor mt-1">
                    {genderOptions
                        .filter((gender) => gender.toLowerCase().includes(searchValue.toLowerCase()))
                        .map((gender) => (
                            <li
                                key={gender}
                                className="px-4 py-2 cursor-pointer font-poppins hover:bg-gray-200 text-textcolor flex justify-between items-center"
                                onMouseDown={() => handleSelectGender(gender)}
                            >
                                {gender}
                                {selectedGender === gender && (
                                    <MdOutlineCheck className="text-[#6565657a] text-lg" />
                                )}
                            </li>
                        ))}
                    {genderOptions.filter((g) =>
                        g.toLowerCase().includes(searchValue.toLowerCase())
                    ).length === 0 && (
                            <li className="px-4 py-2 font-poppins text-center text-gray-500">No gender found</li>
                        )}
                </ul>
            )}
        </div>
    );
};

export default GenderVendor;
