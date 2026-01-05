import React from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/high-res.css';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../Hooks/Hooks';
import { setPhoneNumber } from '../../../Appstore/Slice/addVendorSlice';

function PhoneNumberAddVendor() {
    const dispatch = useDispatch();
    const phoneData = useAppSelector((state) => state.addVendor);

    const handlePhoneChange = (value: string, data: any) => {
        const dialCode = data.dialCode;               // e.g. '91'
        const iso2 = data.countryCode?.toUpperCase(); // e.g. 'IN'
        const countryName = data.name || '';          // e.g. 'India'
        const mobileNumber = value.replace(dialCode, ""); // e.g. '9876543210'

        dispatch(setPhoneNumber({
            country_code: `+${dialCode}`,
            mobile_num: mobileNumber,
            country: countryName,
            country_short_name: iso2,
        }));

        console.log("Country Code:", `+${dialCode}`);
        console.log("Mobile Num:", mobileNumber);
        console.log("Country:", countryName);
        console.log("Country Short:", iso2);
    };

    return (
        <div className="w-full flex flex-col gap-2">
            <label
                className="font-poppins text-sm font-medium text-textcolor"
                htmlFor="mobile"
            >
                Phone number
                <span className="text-[#F21818] pl-[1px]">*</span>
            </label>

            <div className="relative w-full bg-primary">
                <PhoneInput
                    country={'in'}
                    value={`${phoneData.country_code?.replace("+", "") || ""}${phoneData.mobile_num || ""}`}
                    onChange={handlePhoneChange}
                    placeholder="Enter phone number"
                    enableSearch
                    inputClass="!w-full"
                />
            </div>
        </div>
    );
}

export default PhoneNumberAddVendor;
