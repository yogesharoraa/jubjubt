import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Apimethod from "../../../Hooks/Apimethod";
import { useAppDispatch, useAppSelector } from "../../../Hooks/Hooks";
import { setAppConfig } from "../../../Appstore/Slice/appConfigSlice";
import Stripe from "./Stripe";
import Gpay from "./Gpay";
import Applepay from "./Applepay";
import Paypal from "./Paypal";

function Payment() {
    const [option, setOption] = useState("Stripe");

    const { makeRequest } = Apimethod();
    const IS_DEMO = import.meta.env.VITE_IS_DEMO === 'true';



    const dispatch = useAppDispatch()



    const appConfig = useAppSelector((state) => state.appConfig.config)
    const [isEdited, setIsEdited] = useState(false);

    const [formData, setFormData] = useState({
        twilio_account_sid: "",
        twilio_auth_token: "",
        twilio_phone_number: "",
        msg_91_auth_key: "",
        msg_91_private_key: "",
    });

    // To see the change of fields
    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setIsEdited(true);
    };

    const handleKeyUpdate = async () => {
        if (!appConfig) return;

        const originalData = {
            twilio_account_sid: appConfig?.twilio_account_sid || "",
            twilio_auth_token: appConfig?.twilio_auth_token || "",
            twilio_phone_number: appConfig?.twilio_phone_number || "",
            msg_91_auth_key: appConfig?.msg_91_auth_key || "",
            msg_91_private_key: appConfig?.msg_91_private_key || "",
        };

        // Get only the fields that were changed
        const changedFields: Record<string, string> = {};
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== originalData[key]) {
                changedFields[key] = value;
            }
        });

        if (Object.keys(changedFields).length === 0) {
            toast.info("No changes to update.");
            return;
        }

        try {
            const response = await makeRequest("/admin/update-project-conf", changedFields, "application/json", "PUT");




            dispatch(setAppConfig(response?.data))

            toast.success(response?.message || "Keys updated!");
            setIsEdited(false);
        } catch (err) {
            toast.error("Something went wrong");
        }
    };

    // Inside your component:
    useEffect(() => {
        if (appConfig) {
            setFormData({
                twilio_account_sid: appConfig?.twilio_account_sid || "",
                twilio_auth_token: appConfig?.twilio_auth_token || "",
                twilio_phone_number: appConfig?.twilio_phone_number || "",
                msg_91_auth_key: appConfig?.msg_91_auth_key || "",
                msg_91_private_key: appConfig?.msg_91_private_key || "",
            });
        }
    }, [appConfig]);


    return (
        <>
            <h2 className="text-textcolor  mt-4  md:mt-0 font-semibold font-poppins text-xl pb-4">Payment Configuration</h2>

            <div className="mt-5 border rounded-lg border-bordercolor md:mt-0">
                <div className="grid   md:grid-cols-2 xl:grid-cols-4">
                    {/* Stripe */}
                    <button
                        className={`font-poppins font-semibold w-full py-3 border-b  cursor-pointer border-bordercolor rounded-tl-lg text-sm ${option === "Stripe" ? "text-[#FFFFFF]  bggradient" : " text-[#5B5B5B]"}`}
                        onClick={() => setOption("Stripe")}
                    >
                        Stripe
                    </button>

                    {/* gpay*/}
                    <button
                        className={`font-poppins font-semibold border-b  border-bordercolor cursor-pointer w-full py-3 rounded-tl-lg text-sm ${option === "gpay" ? "text-[#FFFFFF] bggradient" : " text-[#5B5B5B]"}`}
                        onClick={() => setOption("gpay")}
                    >
                        Gpay
                    </button>

                    {/* apple_pay*/}
                    <button
                        className={`font-poppins font-semibold border-b  border-bordercolor cursor-pointer w-full py-3 rounded-tl-lg text-sm ${option === "apple_pay" ? "text-[#FFFFFF] bggradient" : " text-[#5B5B5B]"}`}
                        onClick={() => setOption("apple_pay")}
                    >
                        Apple Pay
                    </button>

                    {/*paypal*/}
                    <button
                        className={`font-poppins font-semibold border-b  border-bordercolor cursor-pointer w-full py-3 rounded-tl-lg text-sm ${option === "paypal" ? "text-[#FFFFFF] bggradient" : " text-[#5B5B5B]"}`}
                        onClick={() => setOption("paypal")}
                    >
                        Paypal
                    </button>

                </div>

                {/* Twilio */}
                {option === "Stripe" && (
                    <Stripe />
                )}

                {option === "gpay" && (
                    <Gpay />
                )}


                {option === "apple_pay" && (
                    <Applepay />
                )}

                {option === "paypal" && (
                    <Paypal />
                )}
            </div>
        </>
    );
}

export default Payment;
