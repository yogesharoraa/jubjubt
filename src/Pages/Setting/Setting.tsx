import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import SearchBar from "../../Componets/SearchBar/SearchBar";

import General from "/Images/set1.png";
import sms from "/Images/smsSetting.png";
import mail from "/Images/messageSetting.png";
import purchase from "/Images/key.png";
import General1 from "/Images/download.png";
import sms1 from "/Images/smsSetting1.png";
import mail1 from "/Images/messageSetting1.png";
import purchase1 from "/Images/key1.png";

import { PiFileArrowUpLight } from "react-icons/pi";
import { IoCloudyOutline } from "react-icons/io5";

import GeneralSetting from "./GeneralSetting";
import SMSConfiguration from "./SMSConfiguration";
import MailSetup from "./MailSetup";
import Bucket from "./Bucket";
import FirebaseSetup from "./FirebaseSetup";
import PurchaseCode from "./PurchaseCode";
import Apimethod from "../../Hooks/Apimethod";
import { useAppDispatch } from "../../Hooks/Hooks";
import { setAppConfig } from "../../Appstore/Slice/appConfigSlice";
import LoginAuth from "./LoginAuth";
import loginl from "/Images/loginlight.png"
import logind from "/Images/logindark.png";
import Payment from "./Payment/Payment";
import p1 from "/Images/p1.png"
import p2 from "/Images/p2.png"
import WithravList from "./WithravList";

const options = [
    {
        key: "General",
        label: "General Settings",
        iconLight: General,
        iconDark: General1,
        component: <GeneralSetting />,
    },
    {
        key: "Finance",
        label: "Finance Settings",
        iconLight: p2,
        iconDark: p1,
        component: <WithravList />,
    },
    {
        key: "SMS",
        label: "SMS Configuration",
        iconLight: mail,
        iconDark: mail1,
        component: <SMSConfiguration />,
    },
    {
        key: "Mail",
        label: "Mail Setup",
        iconLight: sms,
        iconDark: sms1,
        component: <MailSetup />,
    },
    {
        key: "AWS",
        label: "AWS Media Storage",
        icon: <IoCloudyOutline className="w-5 h-5" />,
        component: <Bucket />,
    },
    {
        key: "Firebase",
        label: "Push Notification Configration",
        icon: <PiFileArrowUpLight className="w-5 h-5" />,
        component: <FirebaseSetup />,
    },
    {
        key: "Login",
        label: "Login Configuration",
        iconLight: loginl,
        iconDark: logind,
        component: <LoginAuth />,
    },
    {
        key: "Payment",
        label: "Payment Methods",
        iconLight: p2,
        iconDark: p1,
        component: <Payment />,
    },
    {
        key: "Purchase",
        label: "Purchase Code",
        iconLight: purchase,
        iconDark: purchase1,
        component: <PurchaseCode />,
    },



];







function Setting() {
    const isSidebarOpen = useSelector((state: any) => state.sidebar.isOpen);
    const [option, setOption] = useState("General");

    const selectedComponent = options.find(opt => opt.key === option)?.component;




    const { loading, error, data, makeRequest } = Apimethod();

    useEffect(() => {
        makeRequest("/project_conf", null, undefined, "GET");
    }, []);

    const dispatch = useAppDispatch()


    useEffect(() => {
        if (data?.data) {
            dispatch(setAppConfig(data?.data))
        }
    }, [data?.data])













    return (
        <div className={`bg-primary ${isSidebarOpen ? "xl:pl-20" : "xl:pl-72"}`}>
            <SearchBar />

            <div className="px-4 pb-10 xl:px-6">
                {/* Page Header */}
                <div className="flex justify-between py-3">
                    <h2 className="text-textcolor font-poppins text-xl font-semibold pt-3 ">Setting</h2>
                </div>

                {/* Breadcrumb */}
                <div className="w-full flex flex-col md:flex-row justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                        <Link to="/dashboard">
                            <h3 className="text-base font-semibold text-[#3A3A3A]  font-poppins">Dashboard</h3>
                        </Link>
                        <div className="h-1 w-1 rounded-full bg-[#E0E0E0]"></div>
                        <h3 className="text-base text-[#858585] font-poppins">Setting</h3>
                    </div>
                </div>

                {/* Settings Section */}
                <div className="border border-bordercolor  p-6 rounded-lg mt-8 mx-4 sm:mx-0 overflow-x-auto w-full">
                    <div className="xl:overflow-x-auto lg:overflow-x-auto 2xl:overflow-hidden min-w-fit md:min-w-[1200px]">
                        <div className="md:flex gap-14">
                            {/* Sidebar Options */}
                            <div className="flex flex-col gap-4  ">
                                {options.map(({ key, label, iconLight, iconDark, icon }) => (
                                    <button
                                        key={key}
                                        onClick={() => setOption(key)}
                                        className={`flex items-center gap-2 px-4 py-3.5 rounded-xl cursor-pointer lg:w-[320px] md:w-[220px]
                                            ${option === key ? "bggradient" : "border border-bordercolor"}`}
                                    >
                                        {icon ? (
                                            <span className={`${option === key ? "text-[#FFFFFF]" : "text-textcolor"} dark:text-[#FFFFFF]`}>{icon}</span>
                                        ) : (
                                            <>
                                                <img src={option === key ? iconDark : iconLight} className="block w-5 h-5 dark:hidden" />
                                                <img src={iconDark} className="hidden w-5 h-5 dark:block" />
                                            </>
                                        )}
                                        <p className={`font-poppins text-sm font-normal ${option === key ? "text-[#FFFFFF]" : "text-textcolor"}`}>{label}</p>
                                    </button>
                                ))}
                            </div>

                            {/* Component Display */}
                            <div className="w-full">{selectedComponent}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Setting;
