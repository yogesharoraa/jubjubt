import { useEffect, useState } from "react";
import { UsegetAdminDetail } from "../../Appstore/Api/Admin_profile/UsegetAdminDetail";
import Name from "/Images/name.png";
import Mobile from "/Images/mobile.png";
import Plus from "/Images/Plus.png";
import NameInputBox from "../../Componets/Form/NameInputBox";
import useApiPost from "../../Hooks/PostData";
import toast from "react-hot-toast";
import { useAppDispatch } from "../../Hooks/Hooks";
import { setAdminData } from "../../Appstore/Slice/AdminDetail";
import Calendar from "/Images/calendar.png";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function EditProfile() {
    const [startDate, setStartDate] = useState<Date | null>(null);

    const [formData, setFormData] = useState({
        profile_pic: "",
        first_name: "",
        last_name: "",
        email: "",
        mobile_number: "",
        gender: "",
        dob: "",
    });

    const { data, isLoading, isError } = UsegetAdminDetail(); // Assuming this is a custom hook for fetching admin details
    const admin_detail = data?.data;

    const { postData, loading, error } = useApiPost(); // Assuming this is a custom hook for making API requests

    const [selectedProfilePic, setSelectedProfilePic] = useState<File | null>(null);

    const dispatch = useAppDispatch();

    // Populate data on mount
    useEffect(() => {
        if (admin_detail) {
            setFormData({
                profile_pic: admin_detail.profile_pic || "",
                first_name: admin_detail.first_name || "",
                last_name: admin_detail.last_name || "",
                email: admin_detail.email || "",
                dob: admin_detail.dob || "", // Ensure dob is correctly populated
                gender: admin_detail.gender || "",
                mobile_number: admin_detail.mobile_number || "",
            });
            dispatch(setAdminData(admin_detail)); // Update the Redux store with new data


            // Set the start date for DatePicker
            if (admin_detail.dob) {
                setStartDate(new Date(admin_detail.dob));
            }

            dispatch(setAdminData(admin_detail)); // Dispatch admin data for state management
        }
    }, [admin_detail, dispatch]);

    // Handle input change
    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };


    const IS_DEMO = import.meta.env.VITE_IS_DEMO === 'true';

    // Handle profile pict593A99ure change
    const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {


        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedProfilePic(file);

        const previewUrl = URL.createObjectURL(file);
        setFormData((prev) => ({ ...prev, profile_pic: previewUrl }));
    };

    // Handle Date Change
    const handleDateChange = (date: Date | null) => {
        if (date) {
            setStartDate(date);
            const formattedDate = date.toISOString().split("T")[0]; // Format as yyyy-MM-dd
            setFormData((prevFormData) => ({
                ...prevFormData,
                dob: formattedDate,
            }));
        }
    };

    // Handle Profile Edit
    const handleEditProfile = async () => {
        if (IS_DEMO) {
            toast.error("This action is disabled in the demo version.");
            return;
        }


        try {
            const formDataToUpload = new FormData();
            formDataToUpload.append("first_name", formData.first_name);
            formDataToUpload.append("last_name", formData.last_name);
            formDataToUpload.append("email", formData.email);
            formDataToUpload.append("mobile", formData.mobile_number);
            formDataToUpload.append("dob", formData.dob);
            formDataToUpload.append("gender", formData.gender);

            if (selectedProfilePic) {
                formDataToUpload.append("files", selectedProfilePic);
            }

            const response = await postData("/admin/update-profile", formDataToUpload, "multipart/form-data");
            const updatedAdminData = response.data;

            dispatch(setAdminData(updatedAdminData)); // Update the Redux store with new data

            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error("Something went wrong while updating the profile.");
        }
    };
    return (
        <div className="flex justify-center">
            <div className="max-w-[1000px] w-full">
                {/* Profile image */}
                <div className="flex items-center justify-center w-full py-4 ">
                    <div className="shadow-[9.3px_10.46px_64.96px_0px_rgba(0,0,0,0.2)] px-1 py-1 rounded-full" onClick={() => document.getElementById("profilePicInput")?.click()}>
                        <div className="relative flex items-center justify-center w-28 h-28">
                            <img src={formData.profile_pic} alt="User" className="absolute inset-0 m-auto rounded-full w-28 h-28 object-cover" />
                            <img src={Plus} alt="plus" className="absolute bottom-0 right-0 cursor-pointer w-7 h-7" />
                            <input type="file" accept="image/*" id="profilePicInput" className="hidden" onChange={handleProfilePicChange} />
                        </div>
                    </div>
                </div>

                {/* Display name */}
                <h2 className="flex justify-center pb-3 text-base font-semibold font-poppins  text-textcolor">{admin_detail?.full_name || "Your Name"}</h2>

                {/* Input fields */}
                <div className="grid gap-3 px-10 md:gap-10 md:py-4 md:grid-cols-2">
                    <NameInputBox label="First Name" iconSrc={Name} placeholder="Enter First Name" required value={formData.first_name} onChange={(value) => handleChange("first_name", value)} name="first_name" />

                    <NameInputBox label="Last Name" iconSrc={Name} placeholder="Enter Last Name" required value={formData.last_name} onChange={(value) => handleChange("last_name", value)} name="last_name" />

                    <NameInputBox label="Email" iconSrc={Name} placeholder="Enter  Email" required value={formData.email} onChange={(value) => handleChange("email", value)} name="email" />

                    {/*  mobail number */}
                    <div className="relative flex flex-col">
                        <label className="text-textcolor font-poppins text-sm ">
                            Mobile Number<span className="text-sm text-red-600">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute flex items-center justify-center p-3 transform -translate-y-1/2 rounded-lg active_btn_profile  left-2 top-1/2">
                                <img src={Mobile} alt="User" className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                className="border placeholder:text-textcolor border-bordercolor rounded-lg w-full py-4 my-1 pl-16 placeholder:font-poppins placeholder:text-sm placeholder:opacity-50  text-textcolor focus:outline-none focus:ring-1 focus:ring-[#f9a866]"
                                placeholder="Enter Mobile Number"
                                required
                                autoComplete="off"
                                autoCorrect="off"
                                spellCheck="false"
                                value={formData.mobile_number}
                                onChange={(e) => handleChange("mobile_number", e.target.value)}
                            />
                        </div>
                    </div>

                    {/* DOB */}
                    <div className="relative flex flex-col">
                        <label className="text-textcolor font-poppins text-sm text-left ">Date Of Birth</label>
                        {/* Hidden Input Field for DatePicker */}
                        <div className="relative">
                            <div className="absolute flex items-center justify-center  active_btn_profile  p-3 transform -translate-y-1/2 rounded-lg bg-[#6c47b740] left-2 top-1/2">
                                <img src={Calendar} alt="Calendar Icon" className="w-5 h-5" />
                            </div>
                            <DatePicker
                                selected={startDate} // Display the date if available
                                onChange={handleDateChange}
                                dateFormat="yyyy/MM/dd"
                                placeholderText="YYYY/MM/DD"
                                className="border placeholder:text-textcolor border-bordercolor rounded-lg w-full py-4 my-1 pl-16 placeholder:font-poppins placeholder:text-sm placeholder:opacity-50 text-textcolor focus:outline-none focus:ring-1 focus:ring-[#f9a866]"
                            />
                        </div>
                    </div>

                    {/*  gender */}

                    <div>
                        <label className="text-textcolor font-poppins text-sm ">
                            Gender<span className="text-red-600">*</span>
                        </label>
                        <div className="flex py-2 space-x-6">
                            {["Male", "Female"].map((option) => (
                                <label key={option} className="flex items-center space-x-2 cursor-pointer">
                                    <input type="radio" name="gender" className="custom-radio" value={option} checked={formData.gender === option} onChange={(e) => handleChange("gender", e.target.value)} />
                                    <span className=" text-textcolor ">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center py-8">
                    <button
                        onClick={handleEditProfile}
                        disabled={loading}
                        className={`text-base font-poppins text-white px-16 py-2 rounded-lg bggradient transition-opacity duration-300 ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                        {loading ? "Updating..." : "Submit"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EditProfile;
