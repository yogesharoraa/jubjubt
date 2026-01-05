import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../Hooks/Hooks'
import Apimethod from '../../Hooks/Apimethod';
import { setAppConfig } from '../../Appstore/Slice/appConfigSlice';
import toast from 'react-hot-toast';

function FirebaseSetup() {
  const appConfig = useAppSelector((state) => state.appConfig.config);

    const IS_DEMO = import.meta.env.VITE_IS_DEMO === 'true';



  const { makeRequest, loading } = Apimethod();

  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState({
    one_signal_app_id: "",
    one_signal_api_key: "",
    android_channel_id: "",

  });

  const [initialFormData, setInitialFormData] = useState({ ...formData });

  useEffect(() => {
    if (appConfig) {
      const updatedData = {
        one_signal_app_id: appConfig?.one_signal_app_id || "",
        one_signal_api_key: appConfig?.one_signal_api_key || "",
        android_channel_id: appConfig?.android_channel_id || "",

      };

      setFormData(updatedData);
      setInitialFormData(updatedData);
    }
  }, [appConfig]);

  const handleSubmit = async () => {

     if (IS_DEMO) {
            toast.error("This action is disabled in the demo version.");
            return;
        }
    const changedFields = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (value !== initialFormData[key as keyof typeof formData]) {
        changedFields.append(key, value);
      }
    });

    if ([...changedFields.entries()].length === 0) {
      toast("No changes detected", { icon: "ℹ️" });
      return;
    }

    try {
      const response = await makeRequest('/admin/update-project-conf', changedFields, "multipart/form-data", "PUT");

      toast.success(" One Signal  update successfully")
      dispatch(setAppConfig(response?.data))

    } catch (error) {
    }
  };




  return (
    <>
      <h2 className="text-textcolor  mt-4  md:mt-0 font-semibold font-poppins text-xl pb-4">Push Notification Configration</h2>

      <div className="border border-bordercolor bg-primary rounded-lg p-4 mt-5 md:mt-0">



        <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-4'>

          {[
            { label: "One Signal App Id", key: "one_signal_app_id" },
            { label: "One Signal Api Key", key: "one_signal_api_key" },
            { label: "Android Channel ID", key: "android_channel_id" },

          ].map(({ label, key }) => (
            <div key={key}>
              <label className="text-textcolor font-poppins font-semibold text-sm ">
                {label}
              </label>
              <input
                type="password"
                placeholder={`Enter ${label}`}
                className="border border-bordercolor text-textcolor rounded-md w-full py-3 my-1 px-4 dark:bg-transparent bg-primary placeholder:font-gilroy_regular placeholder:text-sm placeholder:text-placeholdercolor placeholder:opacity-50 focus:outline-none focus:ring-1 focus:ring-header"
                value={formData[key as keyof typeof formData]}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  [key]: e.target.value
                }))}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-center pt-20 pb-4">
          <button
            onClick={handleSubmit}
            className={`px-24 py-3 text-lg font-medium text-white rounded-xl bggradient ${loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>

      </div>
    </>
  );
}

export default FirebaseSetup;
