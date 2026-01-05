import { useEffect, useState } from "react";
import Logo from "/Images/reelbostlogo1.png";
import snapta from "/Images/ReelBoostlogo2.png";
import sms from "/Images/sms.png";
import lock from "/Images/lock.png";
import Bottom from "/Images/SignInBottom.png";
import toast from "react-hot-toast";
import eye from "/Images/password_eye.png";
import eye_off from "/Images/eye-off.png";
import { useNavigate } from "react-router-dom";
import Arrow from "/Images/sign-arrow.png";
import Line from "/Images/vector_bottom.png";
import useApiPost from "../../Hooks/PostData";
import Cookies from "js-cookie";
import Apimethod from "../../Hooks/Apimethod";

function RightSide() {
    const navigate = useNavigate();

    const { data, loading, error, postData } = useApiPost();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);


    const Datas = {
        email: "demo@reelboost.com",
        main_password: "Admin@123",
    };

    const handleSignIn = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            toast.error("All fields are required!");
            return;
        }

        try {
            const response = await postData("/admin/login", formData);

            // Check for boolean status instead of string
            if (response?.status === true) {
                Cookies.set("token", response?.data?.token);
                toast.success(response?.message);
                navigate("/dashboard");
            } else {
                toast.error(response?.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Sign-in failed");
        }
    };


    const { data: configdata, makeRequest } = Apimethod();

    useEffect(() => {
        makeRequest("/project_conf", null, undefined, "GET");
    }, []);


    console.log(" config data ", configdata?.data?.app_logo_light)



    const IS_DEMO = import.meta.env.VITE_IS_DEMO === 'true';


    return (
        <div className="flex flex-col items-center justify-center min-h-screen  bg-white lg:py-20 place-items-center 2xl:px-0 ">
            {/* Form */}
            <form className="2xl:w-[630px] lg:w-[400px] w-[300px] sm:w-[400px] md:w-[520px] 2xl:p-6 bg-white rounded-lg ">
                <div className="flex gap-2 place-items-center cursor-pointer">
                    <img src={configdata?.data?.app_logo_light} alt="jubjub" className=" w-[10rem]   object-cover  h-[3rem]" />
                </div>


                <h2 className="font-bold xl:text-[26px] text-[22px] leading-snug md:text-3xl 2xl:w-[500px] w-[300px] md:w-[420px] md:!leading-normal my-5 lg:pe-16 lg:text-[28px] xl:text-3xl 2xl:pe-8 2xl:text-4xl">
                    Welcome back! Please
                    <span className="relative inline-block">
                        Sign in to
                        <img src={Line} className="absolute left-0  colorchange top-full mt-[-5px]" />
                    </span>{" "}
                    {""}
                    continue.
                </h2>

                <p className="text-[#7B7B7B] text-base font-poppins text-left pb-6">Enter your email and password to login</p>

                <div className="rounded-lg ">
                    {/* Email Field */}
                    <div className="flex flex-col mb-4">
                        <label className="text-black  font-poppins text-sm font-semibold">
                            Email<span className="text-red-600">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute flex items-center justify-center p-2.5 transform bg-opacityGradient -translate-y-1/2 rounded-lg left-2 top-1/2">
                                {/* style={{ background: 'linear-gradient(213deg, rgba(108, 71, 183, 0.1) -27.59%, rgba(52, 31, 96, 0.1) 105.15%)' }}> */}
                                <img src={sms} alt="User" className="w-5 h-5 colorchange" />
                            </div>
                            <input
                                type="email"
                                className=" border border-bordercolor border-opacity-10 rounded-lg w-full py-3 my-1 pl-16 placeholder:font-gilroy_regular placeholder:text-sm placeholder:text-black placeholder:opacity-50 bg-white focus:outline-none focus:ring-1 focus:ring-[#f9a866]"
                                placeholder="Enter Email"
                                value={formData.email}
                                autoComplete="new-email"
                                onChange={(e) => {
                                    setFormData((prevData) => ({
                                        ...prevData,
                                        email: e.target.value,
                                    }));
                                }}
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="flex flex-col mb-4">
                        <label className="text-black font-poppins text-sm font-semibold">
                            Password<span className="text-red-600">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute flex items-center bg-opacityGradient justify-center p-2.5 transform -translate-y-1/2 rounded-lg left-2 top-1/2">
                                <img src={lock} alt="lock" className="w-5 h-5 colorchange" />
                                {/* <LuLockKeyhole className='w-5 h-5 text-sidebarText' /> */}
                            </div>

                            {/* Show/Hide Password Button */}
                            <button type="button" className="absolute py-4 right-2" onClick={() => setShowPassword(!showPassword)}>
                                <img src={showPassword ? eye_off : eye} className="w-5 h-5" alt="Toggle Password Visibility" />
                            </button>

                            <span className="h-12 py-4">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="border border-bordercolor  rounded-lg w-full py-3 my-1 pl-16 placeholder:font-gilroy_regular placeholder:text-sm placeholder:text-black placeholder:opacity-50 bg-white focus:outline-none focus:ring-1 focus:ring-[#f9a866]"
                                    placeholder="Enter Password"
                                    value={formData.password}
                                    autoComplete="new-password"
                                    onChange={(e) =>
                                        setFormData((prevData) => ({
                                            ...prevData,
                                            password: e.target.value,
                                        }))
                                    }
                                />
                            </span>
                        </div>
                    </div>
                </div>

                {/* Sign In Button */}
                <div className="flex justify-center pt-4 place-items-center cursor-pointer">
                    <button
                        className="text-base flex cursor-pointer gap-2 justify-center place-items-center bggradient text-center font-poppins text-white rounded-lg w-full py-3 disabled:opacity-50"
                        onClick={handleSignIn}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <svg
                                    className="animate-spin h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                    />
                                </svg>
                                Loading...
                            </>
                        ) : (
                            <>
                                Sign In <img src={Arrow} className="w-6 h-6" />
                            </>
                        )}
                    </button>
                </div>

                {/* Email and Password Details */}
                {
                    IS_DEMO && (
                        <div className="py-8 text-center   rounded-lg ">
                            <table className="w-full border-collapse   ">
                                <tbody>
                                    {/* Email Row */}
                                    <tr className="border border-bordercolor border-opacity-10">
                                        <td className="px-4 py-2 text-left font-poppins text-black border border-bordercolor">Email:</td>
                                        <td className="px-4 py-2 text-black font-poppins text-left border border-bordercolor">{Datas?.email}</td>
                                    </tr>

                                    {/* Password Row */}
                                    <tr className="border border-bordercolor">
                                        <td className="px-4 py-2 text-left font-poppins text-black border border-bordercolor">Password:</td>
                                        <td className="px-4 py-2 text-black font-poppins text-left border border-bordercolor">{Datas?.main_password}</td>
                                    </tr>

                                    {/* Copy Button Row */}
                                    <tr className="border border-bordercolor  cursor-pointer">
                                        <td colSpan={2} className="px-4 py-2 text-center border border-bordercolor  cursor-pointer">
                                            <button
                                                className="text-[#FFFFFF] text-base font-poppins rounded-lg px-6 py-1 mt-2 bggradient  cursor-pointer"

                                                onClick={(e) => {
                                                    e.preventDefault(); //button inside form always refresh page so add this to prevent refresh
                                                    setFormData({
                                                        email: Datas?.email,
                                                        password: Datas?.main_password,
                                                    });
                                                }}
                                            >
                                                Copy
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )
                }
            </form>
            <div className="absolute bottom-0 right-[700px] 2xl:right-[550px]">
                <img src={Bottom} className="h-36" />
            </div>
        </div>
    );
}

export default RightSide;
