import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Apimethod from "../../Hooks/Apimethod";
import { useAppDispatch, useAppSelector } from "../../Hooks/Hooks";
import { setAppConfig } from "../../Appstore/Slice/appConfigSlice";

function SMSConfiguration() {
        const IS_DEMO = import.meta.env.VITE_IS_DEMO === 'true';

    const [option, setOption] = useState("Twilio");

    const { makeRequest } = Apimethod();



    const dispatch = useAppDispatch()



    const appConfig = useAppSelector((state) => state.appConfig.config)
    const [isEdited, setIsEdited] = useState(false);

    const [formData, setFormData] = useState({
        twilio_account_sid: "",
        twilio_auth_token: "",
        twilio_phone_number: "",
        msg_91_auth_key: "",
        msg_91_private_key: "",
        msg_91_template_id: "",
    });

    // To see the change of fields
    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setIsEdited(true);
    };

    const handleKeyUpdate = async () => {

         if (IS_DEMO) {
            toast.error("This action is disabled in the demo version.");
            return;
        }
        if (!appConfig) return;

        const originalData = {
            twilio_account_sid: appConfig?.twilio_account_sid || "",
            twilio_auth_token: appConfig?.twilio_auth_token || "",
            twilio_phone_number: appConfig?.twilio_phone_number || "",
            msg_91_auth_key: appConfig?.msg_91_auth_key || "",
            msg_91_private_key: appConfig?.msg_91_private_key || "",
            msg_91_template_id: appConfig?.msg_91_template_id || "",
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


        console.log("changedFieldschangedFieldschangedFields",changedFields)

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
                msg_91_template_id: appConfig?.msg_91_template_id || "",
            });
        }
    }, [appConfig]);


    return (
        <>
            <h2 className="text-textcolor mt-4  md:mt-0 font-semibold font-poppins text-xl pb-4">SMS Configuration</h2>

            <div className="mt-5 border rounded-lg border-bordercolor md:mt-0">
                <div className="grid grid-cols-2">
                    {/* Twilio */}
                    <button
                        className={`font-poppins font-semibold w-full py-3 border-b  cursor-pointer border-bordercolor rounded-tl-lg text-sm ${option === "Twilio" ? "text-[#FFFFFF]  bggradient" : " text-[#5B5B5B]"}`}
                        onClick={() => setOption("Twilio")}
                    >
                        Twilio
                    </button>

                    {/* MSG 91 */}
                    <button
                        className={`font-poppins font-semibold border-b  border-bordercolor cursor-pointer w-full py-3 rounded-tl-lg text-sm ${option === "MSG" ? "text-[#FFFFFF] bggradient" : " text-[#5B5B5B]"}`}
                        onClick={() => setOption("MSG")}
                    >
                        MSG 91
                    </button>
                </div>

                {/* Twilio */}
                {option === "Twilio" && (
                    <div className="p-4">
                        <div className="grid gap-4 py-4 md:grid-cols-2">
                            {/* Twilio Account SID */}
                            <div>
                                <label className="text-textcolor font-poppins font-semibold text-sm ">Twilio Account SID</label>

                                <input
                                    type="password"
                                    placeholder="Enter twilio_account_sid"
                                    className="border border-bordercolor   text-textcolor rounded-md w-full py-3 my-1 px-4 dark:bg-transparent  dark:border-borderColor placeholder:font-gilroy_regular placeholder:text-sm placeholder:text-placeholdercolor placeholder:opacity-50 bg-white focus:outline-none focus:ring-1 focus:ring-header"
                                    value={formData.twilio_account_sid}
                                    onChange={(e) => handleChange("twilio_account_sid", e.target.value)}
                                />
                            </div>

                            {/* Twilio Auth Token */}
                            <div>
                                <label className="text-textcolor font-poppins font-semibold text-sm ">Twilio Auth Token</label>
                                <input
                                    type="password"
                                    placeholder="Enter twilio_auth_token"
                                    className="border border-bordercolor  text-textcolor  rounded-md w-full py-3 my-1 px-4 dark:bg-transparent  dark:border-borderColor placeholder:font-gilroy_regular placeholder:text-sm placeholder:text-placeholdercolor placeholder:opacity-50 bg-white focus:outline-none focus:ring-1 focus:ring-header"
                                    value={formData.twilio_auth_token}
                                    onChange={(e) => handleChange("twilio_auth_token", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2">
                            {/* Twilio Phone Number */}
                            <div>
                                <label className="text-textcolor font-poppins font-semibold text-sm ">Twilio Phone Number</label>

                                <input
                                    type="password"
                                    placeholder="Enter twilio_phone_number"
                                    className="border border-bordercolor text-textcolor  rounded-md w-full py-3 my-1 px-4 dark:bg-transparent  dark:border-borderColor placeholder:font-gilroy_regular placeholder:text-sm placeholder:text-placeholdercolor placeholder:opacity-50 bg-white focus:outline-none focus:ring-1 focus:ring-header"
                                    value={formData.twilio_phone_number}
                                    onChange={(e) => handleChange("twilio_phone_number", e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-center pt-20 pb-4 place-items-center">
                            <button className={`px-24 py-3 text-lg font-medium text-white rounded-xl   cursor-pointer  ${isEdited ? "bggradient" : " bggradient opacity-50"}`} onClick={handleKeyUpdate}>
                                Submit
                            </button>
                        </div>
                    </div>
                )}

                {option === "MSG" && (
                    <div className="p-4">
                        <div className="grid gap-4 py-4 md:grid-cols-2">
                            {/* MSG91 Auth Key */}
                            <div>
                                <label className="text-textcolor font-poppins font-semibold text-sm ">MSG91 Auth Key</label>

                                <input
                                    type="password"
                                    placeholder="Enter msg_91_auth_key"
                                    className="border border-bordercolor text-textcolor  rounded-md w-full py-3 my-1 px-4 dark:bg-transparent  dark:border-borderColor placeholder:font-gilroy_regular placeholder:text-sm placeholder:text-placeholdercolor placeholder:opacity-50 bg-white focus:outline-none focus:ring-1 focus:ring-header"
                                    value={formData.msg_91_auth_key}
                                    onChange={(e) => handleChange("msg_91_auth_key", e.target.value)}
                                />
                            </div>

                            {/* MSG91 Private Key */}
                            <div>
                                <label className="text-textcolor font-poppins font-semibold text-sm ">MSG91 Private Key</label>

                                <input
                                    type="password"
                                    placeholder="Enter msg_91_private_key"
                                    className="border border-bordercolor text-textcolor  rounded-md w-full py-3 my-1 px-4 dark:bg-transparent  dark:border-borderColor placeholder:font-gilroy_regular placeholder:text-sm placeholder:text-placeholdercolor placeholder:opacity-50 bg-white focus:outline-none focus:ring-1 focus:ring-header"
                                    value={formData.msg_91_private_key}
                                    onChange={(e) => handleChange("msg_91_private_key", e.target.value)}
                                />
                            </div>


                            {/*msg_91_template_id */}
                            <div>
                                <label className="text-textcolor font-poppins font-semibold text-sm ">MSG91 Private Key</label>

                                <input
                                    type="password"
                                    placeholder="Enter msg_91_template_id"
                                    className="border border-bordercolor text-textcolor  rounded-md w-full py-3 my-1 px-4 dark:bg-transparent  dark:border-borderColor placeholder:font-gilroy_regular placeholder:text-sm placeholder:text-placeholdercolor placeholder:opacity-50 bg-white focus:outline-none focus:ring-1 focus:ring-header"
                                    value={formData.msg_91_template_id}
                                    onChange={(e) => handleChange("msg_91_template_id", e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-center pt-16 pb-4 place-items-center">
                            <button className={`px-24 py-3 text-lg font-medium text-white  bg-black rounded-xl  cursor-pointer  ${isEdited ? "bggradient" : " bggradient opacity-50"} `} onClick={handleKeyUpdate}>
                                Submit
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default SMSConfiguration;
