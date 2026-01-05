// GeneralSetting.js
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import ColorPicker from "react-pick-color";
import { useAppDispatch, useAppSelector } from "../../Hooks/Hooks";
import Apimethod from "../../Hooks/Apimethod";
import { setAppConfig } from "../../Appstore/Slice/appConfigSlice";
import { reset, setTrue } from "../../Appstore/Slice/toggleSlice";

function GeneralSetting() {

      const IS_DEMO = import.meta.env.VITE_IS_DEMO === 'true';


  const dispatch = useAppDispatch()

  const [formData, setFormData] = useState({
    app_name: "",
    email: "",
    copyright_text: "",
    primary_color: "",
    secondary_color: "",
    app_logo_dark: "",
    app_logo_light: "",
    splash_image: "",
    fav_icon: "",
    banner_image: "",
  });

  const [fileNames, setFileNames] = useState({
    app_logo_dark: "No File Chosen",
    app_logo_light: "No File Chosen",
    splash_image: "No File Chosen",
  });

  const [imageFiles, setImageFiles] = useState({
    app_logo_dark: null,
    app_logo_light: null,
    fav_icon: null,
    banner_image: null,
  });

  const [isEdited, setIsEdited] = useState(false);
  const [primaryColor, setPrimaryColor] = useState(false);
  const [secondaryColor, setSecondaryColor] = useState(false);


  const appConfig = useAppSelector((state) => state.appConfig.config)




  useEffect(() => {
    if (appConfig) {
      setFormData({
        app_name: appConfig?.app_name || "",
        email: appConfig?.app_email || "",
        copyright_text: appConfig?.copyright_text || "",
        primary_color: appConfig?.app_primary_color || "",
        secondary_color: appConfig?.app_secondary_color || "",
        app_logo_dark: appConfig?.app_logo_dark || "",
        splash_image: appConfig?.splash_image || "",
        app_logo_light: appConfig?.app_logo_light || "",
        fav_icon: appConfig?.fav_icon || "",
        banner_image: appConfig?.banner_image || "",
      });

      setFileNames({
        app_logo_dark: getFileName(appConfig.app_logo_dark),
        app_logo_light: getFileName(appConfig.app_logo_light),
        splash_image: getFileName(appConfig.splash_image),
      });
    }
  }, [appConfig]);

  const getFileName = (url) => {
    return url ? url.split("/").pop() : "No File Chosen";
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsEdited(true);
  };

  const handleImageSelect = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    setFormData((prev) => ({
      ...prev,
      [type]: imageUrl,
    }));

    setFileNames((prev) => ({
      ...prev,
      [type]: file.name,
    }));

    setImageFiles((prev) => ({
      ...prev,
      [type]: file,
    }));

    setIsEdited(true);
  };

  const handlePrimaryColor = (color) => {
    setFormData({ ...formData, primary_color: color.hex });
    setPrimaryColor(false);
  };

  const handleSecondaryColor = (color) => {
    setFormData({ ...formData, secondary_color: color.hex });
    setSecondaryColor(false);
  };




  const { makeRequest } = Apimethod()




  const handleSettingsUpdate = async () => {


    dispatch(reset())

     if (IS_DEMO) {
            toast.error("This action is disabled in the demo version.");
            return;
        }
    try {
      const formDataToUpload = new FormData();
      const settings = appConfig || {};

      // Check and append only changed text fields
      if (formData.app_name !== settings?.app_name) {
        formDataToUpload.append("app_name", formData.app_name);
      }
      if (formData.email !== settings?.app_email) {
        formDataToUpload.append("app_email", formData.email);
      }
      if (formData.copyright_text !== settings?.copyright_text) {
        formDataToUpload.append("copyright_text", formData.copyright_text);
      }
      if (formData.primary_color !== settings?.app_primary_color) {
        formDataToUpload.append("app_primary_color", formData.primary_color);
      }
      if (formData.secondary_color !== settings?.app_secondary_color) {
        formDataToUpload.append("app_secondary_color", formData.secondary_color);
      }

      // Append only newly selected image files
      Object.keys(imageFiles).forEach((key) => {
        if (imageFiles[key]) {
          formDataToUpload.append(key, imageFiles[key]);
        }
      });

      if ([...formDataToUpload.entries()].length === 0) {
        toast("No changes detected", { icon: "ℹ️" });
        return;
      }

      const response = await makeRequest(
        "/admin/update-project-conf",
        formDataToUpload,
        "multipart/form-data",
        "PUT"
      );



      dispatch(setTrue())
      dispatch(setAppConfig(response?.data))
     

      


      toast.success(response?.message || "Settings updated!");
      setIsEdited(false);
    } catch (err) {
      toast.error("Something went wrong");
    }
  };




  return (
    <>
      <h2 className="text-textcolor font-semibold font-poppins mt-4 md:mt-0 text-xl pb-4">General Settings</h2>
      <div className="border border-bordercolor bg-primary rounded-lg p-4 mt-5 md:mt-0">
        {/* Input Fields */}
        <div className="grid gap-4 pb-5 md:grid-cols-2">
          {/* App/Website Name =============== */}
          <div>
            <label className="text-textcolor font-poppins font-semibold text-sm ">App/Website Name</label>
            <input
              type="text"
              placeholder="Enter App/Website Name"
              className="border text-textcolor border-bordercolor  rounded-lg w-full py-3 my-1 px-4 placeholder:font-gilroy_regular placeholder:text-sm placeholder:text-textcolor placeholder:opacity-50  bg-primary focus:outline-none focus:ring-1 focus:ring-header"
              //  onChange={(e) => handleChange({ ...formData, app_name: e.target.value })}
              onChange={(e) => handleChange("app_name", e.target.value)}
              value={formData.app_name}
            />
          </div>

          {/* Contact Email ========= */}
          <div>
            <label className="text-textcolor   font-poppins font-semibold text-sm ">Contact Email</label>
            <input
              type="text"
              placeholder="Enter Email"
              className="border text-textcolor border-bordercolor  rounded-lg w-full py-3 my-1 px-4 placeholder:font-gilroy_regular placeholder:text-sm placeholder:text-textcolor placeholder:opacity-50  bg-primary focus:outline-none focus:ring-1 focus:ring-header"
              value={formData.email}
              //  onChange={(e) => setFormData({...formData, email: e.target.value}) }
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 pb-5 md:grid-cols-2">
          {/* Dark Logo =============== */}
          {/* <div>
            <label className="text-textcolor font-poppins font-semibold text-sm ">Dark Logo</label>
            <div className="relative">
              <div
                style={{ background: "linear-gradient(213deg, rgba(108, 71, 183, 0.1) -27.59%, rgba(52, 31, 96, 0.1) 105.15%)" }}
                onClick={() => document.getElementById("app_logo_dark_input").click()}
                className="absolute left-2 top-3 bottom-3 h-[32px] text-textcolor  font-poppins text-xs flex items-center justify-center px-3 cursor-pointer border-r border-header py-3 "
              >
                Choose File
              </div>

              <input id="app_logo_dark_input" type="file" className="hidden " onChange={(e) => handleImageSelect(e, "app_logo_dark")} />
              <input
                type="text"
                placeholder={fileNames.app_logo_dark}
                className="border   border-bordercolor  rounded-lg w-full py-3 pl-[110px] my-1 px-4 placeholder:font-gilroy_regular placeholder:text-sm placeholder:text-textcolor bg-primary text-textcolor focus:outline-none focus:ring-1 focus:ring-header"
                style={{ height: "48px" }}
              />
              {formData.app_logo_dark && <img src={formData.app_logo_dark} className="w-20" />}
            </div>
          </div> */}

          {/* Light Logo ========= */}
          <div>
            <label className="text-textcolor font-poppins font-semibold text-sm ">Logo</label>
            <div className="relative">
              <div
                style={{ background: "linear-gradient(213deg, rgba(108, 71, 183, 0.1) -27.59%, rgba(52, 31, 96, 0.1) 105.15%)" }}
                onClick={() => document.getElementById("app_logo_light_input").click()}
                className="absolute left-2 top-3 bottom-3  h-[32px] text-textcolor font-poppins text-xs flex items-center justify-center px-3 cursor-pointer border-r border-header py-3 "
              >
                Choose File
              </div>

              <input id="app_logo_light_input" type="file" className="hidden" onChange={(e) => handleImageSelect(e, "app_logo_light")} />
              <input
                type="text"
                placeholder={fileNames.app_logo_light}
                className="border   border-bordercolor  rounded-lg w-full py-3 pl-[110px] my-1 px-4 placeholder:font-gilroy_regular placeholder:text-sm placeholder:text-textcolor bg-primary text-textcolor focus:outline-none focus:ring-1 focus:ring-header"
                style={{ height: "48px" }}
              />
              {formData.app_logo_light && <img src={formData.app_logo_light} className="w-20" />}
            </div>
          </div>
          <div>
            <label className="text-textcolor font-poppins font-semibold text-sm ">Copyright Text</label>
            <input
              type="text"
              placeholder="Enter Language Name"
              className="border border-bordercolor rounded-lg w-full py-3 my-1 px-4 placeholder:font-gilroy_regular placeholder:text-sm placeholder:text-textcolor placeholder:opacity-50 bg-primary  text-textcolor focus:outline-none focus:ring-1 focus:ring-header"
              value={formData.copyright_text}
              // onChange={(e) => setFormData({...formData,copyright_text:e.target.value})}
              onChange={(e) => handleChange("copyright_text", e.target.value)}
            />
          </div>
        </div>

        {/*  */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Splash Image */}
          {/* <div>
            <label className="text-textcolor font-poppins font-semibold text-sm ">Splash Image</label>
            <div className="relative">
              <div
                style={{ background: "linear-gradient(213deg, rgba(108, 71, 183, 0.1) -27.59%, rgba(52, 31, 96, 0.1) 105.15%)" }}
                onClick={() => document.getElementById("splash_image_input").click()}
                className="absolute left-2 top-3 bottom-3 h-[32px] text-textcolor  font-poppins text-xs flex items-center justify-center px-3 cursor-pointer border-r border-header py-3 "
              >
                Choose File
              </div>

              <input id="splash_image_input" type="file" className="hidden " onChange={(e) => handleImageSelect(e, "splash_image")} />
              <input
                type="text"
                placeholder={fileNames.splash_image}
                className="border   border-bordercolor  rounded-lg w-full py-3 pl-[110px] my-1 px-4 placeholder:font-gilroy_regular placeholder:text-sm placeholder:text-textcolor bg-primary text-textcolor focus:outline-none focus:ring-1 focus:ring-header"
                style={{ height: "48px" }}
              />
              {formData.splash_image && <img src={formData.splash_image} className="w-20" />}
            </div>
          </div> */}
          {/* Copyright Text */}
          {/* <div>
            <label className="text-textcolor font-poppins font-semibold text-sm ">Copyright Text</label>
            <input
              type="text"
              placeholder="Enter Language Name"
              className="border border-bordercolor rounded-lg w-full py-3 my-1 px-4 placeholder:font-gilroy_regular placeholder:text-sm placeholder:text-textcolor placeholder:opacity-50 bg-primary  text-textcolor focus:outline-none focus:ring-1 focus:ring-header"
              value={formData.copyright_text}
              // onChange={(e) => setFormData({...formData,copyright_text:e.target.value})}
              onChange={(e) => handleChange("copyright_text", e.target.value)}
            />
          </div> */}
        </div>
      </div>

      <div className="border border-bordercolor bg-[#FFFFFF] dark:bg-primary rounded-lg px-4 py-8 my-8">
        <h2 className="text-base font-semibold font-poppins  text-textcolor">App Settings</h2>

        <div className="flex gap-4 pb-4  flex-col  md:flex-row h-fit  relative  ">
          {/* Primary Color */}
          <div className="    w-full md:w-1/2 ">
            <p className="text-textcolor text-sm font-semibold py-3 font-poppins ">Primary Color</p>
            <div className="relative  p-2 border border-bordercolor rounded-2xl cursor-pointer" onClick={() => setPrimaryColor(true)}>
              <div className="w-full py-2 rounded-2xl" style={{ backgroundColor: formData.primary_color }}></div>


            </div>
            {primaryColor && (
              <div className=" cursor-pointer   z-50  ">
                <ColorPicker color={formData.primary_color} onChange={handlePrimaryColor} />
              </div>
            )}
          </div>

          {/* Secondary Color */}

          <div className="     w-full md:w-1/2">
            <p className="text-textcolor text-sm font-semibold py-3 font-poppins ">Secondary Color</p>
            <div className="relative p-2 border border-bordercolor rounded-2xl cursor-pointer" onClick={() => setSecondaryColor(true)}>
              <div className="w-full py-2 rounded-2xl" style={{ backgroundColor: formData.secondary_color }}></div>

              {secondaryColor && (
                <div className=" cursor-pointer">
                  <ColorPicker color={formData.secondary_color} onChange={handleSecondaryColor} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center py-6 place-items-center">
        <button className={`px-24 py-3 font-medium bg-opacity-[80%] text-white rounded-xl ${isEdited ? "bggradient cursor-pointer" : " bggradient opacity-50"}`} onClick={handleSettingsUpdate}>
          Submit
        </button>
      </div>
    </>
  );
}

export default GeneralSetting;
