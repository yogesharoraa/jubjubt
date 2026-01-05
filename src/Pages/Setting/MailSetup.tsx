import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Apimethod from "../../Hooks/Apimethod";
import InputField from "../../Componets/InputField";
import { useAppDispatch, useAppSelector } from "../../Hooks/Hooks";
import { setAppConfig } from "../../Appstore/Slice/appConfigSlice";

function MailSetup() {
  const { loading, makeRequest } = Apimethod();


    const IS_DEMO = import.meta.env.VITE_IS_DEMO === 'true';


  const appConfig = useAppSelector((state) => state.appConfig.config)


  const [isEdited, setIsEdited] = useState(false);
  const [editedFields, setEditedFields] = useState({
    email_service: false,
    smtp_host: false,
    email_port: false,
    app_email: false,
    password: false,
  });

  const [formData, setFormData] = useState({
    email_service: "",
    smtp_host: "",
    email_port: "",
    app_email: "",
    password: "",
  });



  const dispatch = useAppDispatch()


  useEffect(() => {
    if (appConfig) {
      setFormData({
        email_service: appConfig?.email_service || "",
        smtp_host: appConfig?.smtp_host || "",
        email_port: appConfig?.email_port || "",
        app_email: appConfig?.app_email || "",
        password: appConfig?.password || "",
      });
    }
  }, [appConfig]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updatedForm = { ...prev, [field]: value };
      if (prev[field as keyof typeof prev] !== value) {
        setIsEdited(true);
        setEditedFields((prev) => ({ ...prev, [field]: true }));
      }
      return updatedForm;
    });
  };

  const handleMailSetupUpdate = async () => {
     if (IS_DEMO) {
            toast.error("This action is disabled in the demo version.");
            return;
        }
    const updatedFormData = new FormData();

    for (const key in editedFields) {
      if (editedFields[key as keyof typeof editedFields]) {
        updatedFormData.append(key, formData[key as keyof typeof formData]);
      }
    }

    if ([...updatedFormData.entries()].length === 0) {
      toast.info("No changes to update.");
      return;
    }

    try {
      const response = await makeRequest("/admin/update-project-conf", updatedFormData, undefined, "PUT");
      toast.success(response.message || "Mail Setup updated!");
      setIsEdited(false);
      setEditedFields({
        email_service: false,
        smtp_host: false,
        email_port: false,
        app_email: false,
        password: false,
      });



 dispatch(setAppConfig(response?.data))

    } catch (err) {
      toast.error("Something went wrong");
    }
  };


  return (
    <>
      <h2 className="text-textcolor   mt-4  md:mt-0  font-semibold font-poppins text-xl pb-4">Mail Setup</h2>

      <div className="border border-bordercolor rounded-lg px-6 pt-8 mt-5 md:mt-0">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Email Service */}
          <InputField
            label="Email Service"
            value={formData.email_service}
            placeholder="Enter Mail Mailer"
            onChange={(e) => handleChange("email_service", e.target.value)}
          />

          {/* SMTP Host */}
          <InputField
            label="Mail Host"
            value={formData.smtp_host}
            placeholder="Enter Mail Host"
            onChange={(e) => handleChange("smtp_host", e.target.value)}
          />

          {/* Mail Port */}
          <InputField
            label="Mail Port"
            value={formData.email_port}
            placeholder="Enter Mail Port"
            onChange={(e) => handleChange("email_port", e.target.value)}
          />

          {/* Email Title */}
          <InputField
            label="Mail"
            value={formData.app_email}
            placeholder="Enter Mail Title"
            onChange={(e) => handleChange("app_email", e.target.value)}
          />

          {/* Password */}
          <InputField
            label="Mail Password"
             type="password"
            value={
              !editedFields.password
                ? "*".repeat(formData.password.length)
                : formData.password
            }
            placeholder="Enter Mail Password"
            onChange={(e) => handleChange("password", e.target.value)}
          />
        </div>

        <div className="flex justify-center py-6 place-items-center">
          <button
            className={`px-24 py-3 font-medium text-white rounded-xl  cursor-pointer ${isEdited ? "bggradient" : " bggradient opacity-50"
              }`}
            onClick={handleMailSetupUpdate}
            disabled={loading}
          >
            Submit
          </button>
        </div>
      </div>
    </>
  );
}

export default MailSetup;


