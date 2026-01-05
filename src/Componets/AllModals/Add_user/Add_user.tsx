import { Dialog, DialogPanel } from "@headlessui/react";
import toast from "react-hot-toast";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../Hooks/Hooks";
import useApiPost from "../../../Hooks/PostData";
import { hideModal } from "../../../Appstore/Slice/ModalSlice";
import { reset, setTrue } from "../../../Appstore/Slice/toggleSlice";
import ModalHeader from "../ModalHeader";
import PhoneNumberAddVendor from "./PhoneNumberAddVendor";
import GenderVendor from "./StatusVendor";

function Add_user() {
    const modalData = useAppSelector((state) => state.modals.Add_user);
    const dispatch = useAppDispatch();
    const { postData, loading } = useApiPost();
    const userReduxData = useAppSelector((state) => state.addVendor);
    const IS_DEMO = import.meta.env.VITE_IS_DEMO === "true";



    console.log("userReduxDatauserReduxData", userReduxData)

    // Local input states
    const [fullName, setFullName] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const close = () => dispatch(hideModal("Add_user"));

    const handleSubmit = async () => {
        if (IS_DEMO) {
            toast.error("This action is disabled in the demo version.");
            return;
        }

        dispatch(reset())

        // 🧩 Validate all required fields
        if (
            !fullName.trim() ||
            !firstName.trim() ||
            !lastName.trim() ||
            !userName.trim() ||
            !email.trim() ||
            !password.trim() ||
            !userReduxData.mobile_num ||
            !userReduxData.country_code ||
            !userReduxData.gender ||
            !userReduxData.country ||
            !userReduxData.country_short_name
        ) {
            toast.error("Please fill all required fields.");
            return;
        }

        const payload = {
            full_name: fullName.trim(),
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            user_name: userName.trim(),
            email: email.trim(),
            password: password.trim(),
            country_code: userReduxData.country_code,
            mobile_num: userReduxData.mobile_num,
            country: userReduxData.country,
            country_short_name: userReduxData.country_short_name,
            gender: userReduxData.gender,
        };

        console.log("📦 Payload being sent:", payload);

        try {
            const response = await postData("/admin/create-user", payload);
            toast.success("User created successfully!");
            close();
            dispatch(setTrue());
        } catch (error: any) {
            console.error(error);
            toast.error("Something went wrong while creating user.");
        }
    };

    return (
        <Dialog open={modalData} onClose={close} as="div" className="z-50">
            <div className="fixed inset-0 z-10 overflow-y-auto bg-black/55 backdrop-blur-sm">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel className="mx-auto h-fit w-[90%] border border-bordercolor rounded-2xl bg-primary shadow-lg backdrop-blur-2xl duration-300 ease-out sm:w-[60%] xl:w-[30%] 2xl:w-[28%]">
                        <ModalHeader title="Add User" onClose={close} />

                        <div className="w-full grid gap-3 px-4 pb-4 mt-[2rem]">
                            {/* Full Name */}
                            <div className="flex flex-col gap-2">
                                <label className="font-poppins text-sm font-medium text-textcolor">
                                    Full Name<span className="text-[#F21818] pl-[1px]">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter Full Name"
                                    className="w-full rounded-lg border border-bordercolor bg-primary text-textcolor px-4 py-2.5 my-1 placeholder:text-sm focus:outline-none focus:ring-header"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>

                            {/* First Name */}
                            <div className="flex flex-col gap-2">
                                <label className="font-poppins text-sm font-medium text-textcolor">
                                    First Name<span className="text-[#F21818] pl-[1px]">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter First Name"
                                    className="w-full rounded-lg border border-bordercolor bg-primary text-textcolor px-4 py-2.5 my-1 placeholder:text-sm focus:outline-none focus:ring-header"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                            </div>

                            {/* Last Name */}
                            <div className="flex flex-col gap-2">
                                <label className="font-poppins text-sm font-medium text-textcolor">
                                    Last Name<span className="text-[#F21818] pl-[1px]">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter Last Name"
                                    className="w-full rounded-lg border border-bordercolor bg-primary text-textcolor px-4 py-2.5 my-1 placeholder:text-sm focus:outline-none focus:ring-header"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                            </div>

                            {/* Username */}
                            <div className="flex flex-col gap-2">
                                <label className="font-poppins text-sm font-medium text-textcolor">
                                    User Name<span className="text-[#F21818] pl-[1px]">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter User Name"
                                    className="w-full rounded-lg border border-bordercolor bg-primary text-textcolor px-4 py-2.5 my-1 placeholder:text-sm focus:outline-none focus:ring-header"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                />
                            </div>

                            {/* Email */}
                            <div className="flex flex-col gap-2">
                                <label className="font-poppins text-sm font-medium text-textcolor">
                                    Email<span className="text-[#F21818] pl-[1px]">*</span>
                                </label>
                                <input
                                    type="email"
                                    placeholder="Enter Email"
                                    className="w-full rounded-lg border border-bordercolor bg-primary text-textcolor px-4 py-2.5 my-1 placeholder:text-sm focus:outline-none focus:ring-header"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            {/* Password */}
                            <div className="flex flex-col gap-2">
                                <label className="font-poppins text-sm font-medium text-textcolor">
                                    Password<span className="text-[#F21818] pl-[1px]">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter Password"
                                    className="w-full rounded-lg border border-bordercolor bg-primary text-textcolor px-4 py-2.5 my-1 placeholder:text-sm focus:outline-none focus:ring-header"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            {/* Phone Input */}
                            <PhoneNumberAddVendor />

                            {/* Gender Dropdown */}
                            <GenderVendor />

                            {/* Submit */}
                            <div className="flex justify-center items-center mt-2">
                                <button
                                    className="px-10 py-2 cursor-pointer rounded-xl bggradient font-poppins text-white disabled:opacity-50"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                >
                                    {loading ? "Submitting..." : "Submit"}
                                </button>
                            </div>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
}

export default Add_user;
