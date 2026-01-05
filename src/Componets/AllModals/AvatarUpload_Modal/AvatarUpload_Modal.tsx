import { Dialog, DialogPanel } from "@headlessui/react";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../Hooks/Hooks";
import useApiPost from "../../../Hooks/PostData";
import { hideModal } from "../../../Appstore/Slice/ModalSlice";
import { setTrue } from "../../../Appstore/Slice/toggleSlice";
import Plus from "/Images/Plus.png";
import AvatarDefault from "/Images/Avatar.png";
import AvatarDark from "/Images/avatardakmode.png";
import ModalHeader from "../ModalHeader";

function AvatarUpload_Modal() {
  const dispatch = useAppDispatch();
  const modalData = useAppSelector((state) => state.modals.AvatarUpload_Modal);
  const { postData, loading } = useApiPost();

  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    profile_pic: "",
  });

  const [selectedProfilePic, setSelectedProfilePic] = useState<File | null>(null);
  const [defaultAvatar, setDefaultAvatar] = useState(AvatarDefault);

  // Detect dark mode and update default avatar accordingly
  useEffect(() => {
    const updateAvatar = () => {
      const isDarkMode = document.documentElement.classList.contains("dark");
      setDefaultAvatar(isDarkMode ? AvatarDark : AvatarDefault);
    };

    updateAvatar(); // Initial check

    const observer = new MutationObserver(updateAvatar);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedProfilePic(file);
    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, profile_pic: previewUrl }));
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const close = () => {
    dispatch(hideModal("AvatarUpload_Modal"));
  };


  const IS_DEMO = import.meta.env.VITE_IS_DEMO === 'true';


  const handleSubmit = async () => {

    if (IS_DEMO) {
      toast.error("This action is disabled in the demo version.");
      return;
    }
    if (!formData.name || !formData.gender || !formData.profile_pic) {
      toast.error("Please fill all required fields");
      return;
    }

    const form = new FormData();
    form.append("name", formData.name);
    form.append("avatar_gender", formData.gender);

    if (selectedProfilePic) {
      form.append("files", selectedProfilePic);
    }

    try {
      await postData("/Admin/upload-avatar", form, true);
      toast.success("Avatar added successfully");
      dispatch(setTrue());
      close();
    } catch (error: any) {
      console.error("Upload Error:", error);
      toast.error("Something went wrong");
    }
  };

  return (
    <Dialog open={modalData} onClose={close} as="div" className="z-50">
      <div className="fixed inset-0 z-10 overflow-y-auto bg-black/55 backdrop-blur-sm">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel className="mx-auto w-[90%] sm:w-[60%] xl:w-[30%] 2xl:w-[28%] rounded-2xl bg-primary shadow-lg">
            <ModalHeader title="Add Avatar" onClose={close} />

            <div className="grid gap-4 p-6">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center gap-2">
                <label
                  htmlFor="profilePicInput"
                  className="relative w-[110px] h-[110px] cursor-pointer rounded-full shadow p-1"
                >
                  <img
                    src={formData.profile_pic || defaultAvatar}
                    alt="User avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                  <img
                    src={Plus}
                    alt="Upload icon"
                    className="absolute bottom-0 right-0 w-7 h-7"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    id="profilePicInput"
                    className="hidden"
                    onChange={handleProfilePicChange}
                  />
                </label>
                <p className="text-sm text-textcolor font-medium">Add Avatar</p>
              </div>

              {/* Avatar Name */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-textcolor">
                  Avatar Name<span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter Avatar Name"
                  className="w-full rounded-lg border border-bordercolor bg-primary px-4 py-2.5 my-1 placeholder:text-sm placeholder:text-placeholdercolor text-textcolor focus:outline-none focus:ring-1 focus:ring-header"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="text-sm font-medium text-textcolor">
                  Gender<span className="text-red-600">*</span>
                </label>
                <div className="flex py-1 space-x-6">
                  {["Male", "Female"].map((option) => (
                    <label key={option} className="flex text-textcolor items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value={option}
                        checked={formData.gender === option}
                        onChange={(e) => handleChange("gender", e.target.value)}
                        className="custom-radio"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  disabled={loading}
                  onClick={handleSubmit}
                  className="px-14 py-2 rounded-xl cursor-pointer bggradient text-white disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}

export default AvatarUpload_Modal;
