import { useEffect, useState } from "react";
import Apimethod from "../../Hooks/Apimethod";
import { useAppDispatch, useAppSelector } from "../../Hooks/Hooks";
import ToggleSwitchSettingLogin from "../../Componets/ToggleSwitchSettingLogin";
import { setAppConfig } from "../../Appstore/Slice/appConfigSlice";
import toast from "react-hot-toast";
import { FaInfoCircle } from "react-icons/fa";


type AuthType = "phone" | "email" | "google_login" | "apple_login";

interface AuthState {
    phone: boolean;
    email: boolean;
    google_login: boolean;
    apple_login: boolean;
}

function LoginAuth() {

        const IS_DEMO = import.meta.env.VITE_IS_DEMO === 'true';

    const { makeRequest, loading } = Apimethod();
    const { config: appConfig } = useAppSelector((state) => state.appConfig);
    const dispatch = useAppDispatch();

    const [authState, setAuthState] = useState<AuthState>({
        phone: false,
        email: false,
        google_login: false,
        apple_login: false,
    });

    useEffect(() => {
        if (appConfig) {
            setAuthState({
                phone: !!appConfig.phone_authentication,
                email: !!appConfig.email_authentication,
                google_login: !!appConfig.google_login_authentication,
                apple_login: !!appConfig.apple_login_authentication,
            });
        }
    }, [appConfig]);

    const handleToggle = async (type: AuthType) => {

         if (IS_DEMO) {
            toast.error("This action is disabled in the demo version.");
            return;
        }
        const newValue = !authState[type];
        setAuthState((prev) => ({ ...prev, [type]: newValue }));

        try {
            const res = await makeRequest(
                "/admin/update-project-conf",
                { [`${type}_authentication`]: newValue },
                "application/json",
                "PUT"
            );

            if (res.status) {
                dispatch(setAppConfig(res.data));
                toast.success(res.message || `${formatLabel(type)} setting updated successfully`);
            } else {
                throw new Error(res.message || "Failed to update setting");
            }
        } catch (error: any) {
            setAuthState((prev) => ({ ...prev, [type]: !newValue }));
            toast.error(error.message || `${formatLabel(type)} setting update failed`);
        }
    };

    const formatLabel = (type: AuthType) => {
        switch (type) {
            case "phone": return "Mobile OTP";
            case "email": return "Email OTP";
            case "google_login": return "Google Login";
            case "apple_login": return "Apple Login";
            default: return type;
        }
    };

    return (
        <div className="border border-bordercolor bg-primary rounded-lg p-4 mt-5 md:mt-0">


            <div className="w-full flex justify-start  py-4 items-start">
                <div className="flex flex-col gap-2">
                    <h4 className="text-textcolor font-medium">Normal Login</h4>
                    <div className="flex items-center text-textcolor gap-1">
                        (
                        <span className="flex items-center gap-1">
                            <FaInfoCircle />
                            <p>- You can disable only 1 option</p>
                        </span>
                        )
                    </div>
                </div>
            </div>

            <div className="grid gap-4 pb-5">
                <ToggleSwitchSettingLogin
                    label="Mobile OTP"
                    enabled={authState.phone}
                    loading={loading}
                    onChange={() => handleToggle("phone")}
                />
                <ToggleSwitchSettingLogin
                    label="Email OTP"
                    enabled={authState.email}
                    loading={loading}
                    onChange={() => handleToggle("email")}
                />

            </div>




            <div className="w-full flex justify-start  py-4 items-start">
                <div className="flex flex-col gap-2">
                    <h4 className="text-textcolor font-medium">Social Login</h4>
                    <div className="flex items-center text-textcolor gap-1">
                        (
                        <span className="flex items-center gap-1">
                            <FaInfoCircle />
                            <p>- You can disable all option</p>
                        </span>
                        )
                    </div>
                </div>
            </div>

            <div className=" grid gap-4 pb-4">
                <ToggleSwitchSettingLogin
                    label="Google Login"
                    enabled={authState.google_login}
                    loading={loading}
                    onChange={() => handleToggle("google_login")}
                />
                <ToggleSwitchSettingLogin
                    label="Apple Login"
                    enabled={authState.apple_login}
                    loading={loading}
                    onChange={() => handleToggle("apple_login")}
                />
            </div>
        </div>
    );
}

export default LoginAuth;
