import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../Hooks/Hooks'
import Apimethod from '../../Hooks/Apimethod';
import { setAppConfig } from '../../Appstore/Slice/appConfigSlice';
import ToggleSwitchSettingLogin from '../../Componets/ToggleSwitchSettingLogin';
import toast from 'react-hot-toast';
import { FaCircleInfo } from 'react-icons/fa6';
import { nanoid } from "nanoid"; // For generating random strings


function Bucket() {
  const appConfig = useAppSelector((state) => state.appConfig.config);
  const IS_DEMO = import.meta.env.VITE_IS_DEMO === 'true';
  const { makeRequest, loading } = Apimethod();
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState({
    s3_region: "",
    s3_access_key_id: "",
    s3_secret_access_key: "",
    s3_bucket_name: "",
    mediaflow: "",
  });

  const [initialFormData, setInitialFormData] = useState({ ...formData });

  useEffect(() => {
    if (appConfig) {
      const updatedData = {
        s3_region: appConfig?.s3_region || `region-${nanoid(6)}`,
        s3_access_key_id: appConfig?.s3_access_key_id || `AKIA${nanoid(12)}`,
        s3_secret_access_key: appConfig?.s3_secret_access_key || `SECRET${nanoid(24)}`,
        s3_bucket_name: appConfig?.s3_bucket_name || `bucket-${nanoid(8)}`,
        mediaflow: appConfig?.mediaflow || "S3", // default fallback
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
      toast.success("Update success");
      dispatch(setAppConfig(response?.data));
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const handalstatuupdate = async () => {
    if (IS_DEMO) {
      toast.error("This action is disabled in the demo version.");
      return;
    }

    try {
      const newMediaflow = formData.mediaflow === "S3" ? "LOCAL" : "S3";
      const response = await makeRequest('/admin/update-project-conf', { mediaflow: newMediaflow }, "application/json", "PUT");

      setFormData(prev => ({
        ...prev,
        mediaflow: newMediaflow,
      }));

      dispatch(setAppConfig(response?.data));
      toast.success(`Mediaflow status updated to ${newMediaflow} successfully!`);
    } catch (error) {
      toast.error("Mediaflow update failed");
    }
  };


  return (
    <>
      <h2 className="text-textcolor   mt-4  md:mt-0   font-semibold font-poppins text-xl pb-4">AWS Media Storage</h2>

      <div className="border border-bordercolor bg-primary rounded-lg p-4 mt-5 md:mt-0">


        <div className='  w-full flex items-end pb-4  justify-end '>
          <ToggleSwitchSettingLogin
            label="AWS S3 Bucket"
            enabled={formData.mediaflow === "S3"}
            loading={loading}
            onChange={handalstatuupdate}
          />
        </div>
        <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-4'>

          {[
            { label: "S3 Region", key: "s3_region" },
            { label: "Access Key", key: "s3_access_key_id" },
            { label: "Secret Access Key", key: "s3_secret_access_key" },
            { label: "Bucket Name", key: "s3_bucket_name" },
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

        <div className="flex gap-4 my-2 rounded-lg  active_btn_profile cursor-pointer">
          <div className='bggradient bg-opacity-80 py-2 px-3 rounded-lg'>
            <FaCircleInfo className="w-8 h-8 text-white rounded-lg" />
          </div>
          <h2 className="py-4 text-base font-medium font-poppins  text-textcolor">
            if you are disabling the toggle for AWS s3 bucket then the media files will get stored on the server and vice versa

          </h2>
        </div>
      </div>
    </>
  );
}

export default Bucket;
