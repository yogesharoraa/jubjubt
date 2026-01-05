import { Dialog, DialogPanel } from "@headlessui/react";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../Hooks/Hooks";
import useApiPost from "../../../Hooks/PostData";
import { hideModal } from "../../../Appstore/Slice/ModalSlice";
import { setTrue } from "../../../Appstore/Slice/toggleSlice";
import Plus from "/Images/Plus.png";
import AvatarDefault from "/Images/Avatar.png";
import ModalHeader from "../ModalHeader";

const AvatarUpdate_Modal = () => {
  const dispatch = useAppDispatch();
  const modalOpen = useAppSelector((state) => state.modals.AvatarUpdate_Modal);
  const { postData, loading, data } = useApiPost();
  const avatarId = sessionStorage.getItem("AvatarId");

  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    profile_pic: "",
  });

  const [initialFormData, setInitialFormData] = useState({
    name: "",
    gender: "",
    profile_pic: "",
  });

  const [selectedProfilePic, setSelectedProfilePic] = useState<File | null>(null);

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedProfilePic(file);
    setFormData((prev) => ({ ...prev, profile_pic: URL.createObjectURL(file) }));
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const closeModal = () => {
    setFormData({ name: "", gender: "", profile_pic: "" });
    setInitialFormData({ name: "", gender: "", profile_pic: "" });
    setSelectedProfilePic(null);
    dispatch(hideModal("AvatarUpdate_Modal"));
  };


  const IS_DEMO = import.meta.env.VITE_IS_DEMO === 'true';


  const handleSubmit = async () => {


    if (IS_DEMO) {
      toast.error("This action is disabled in the demo version.");
      return;
    }
    const form = new FormData();

    if (formData.name !== initialFormData.name) {
      form.append("name", formData.name);
    }

    if (formData.gender !== initialFormData.gender) {
      form.append("avatar_gender", formData.gender);
    }

    if (avatarId) {
      form.append("avatar_id", avatarId.toString());
    }

    if (selectedProfilePic) {
      form.append("files", selectedProfilePic);
    }

    // Check if any fields were actually changed
    if (Array.from(form.entries()).length <= 1 && !selectedProfilePic) {
      toast("No changes detected", { icon: "ℹ️" });
      return;
    }

    try {
      await postData("/Admin/update-avatar", form, "multipart/form-data");
      toast.success("Avatar updated successfully");
      dispatch(setTrue());
      closeModal();
    } catch {
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    const form = new FormData();
    if (avatarId) {
      form.append("avatar_id", avatarId.toString());
      postData("/Admin/update-avatar", form);
    }
  }, [avatarId]);

  useEffect(() => {
    if (data?.data?.Records[0]) {
      const record = data.data.Records[0];
      const initial = {
        name: record.name || "",
        gender: record.avatar_gender || "",
        profile_pic: record.avatar_media || "",
      };
      setFormData(initial);
      setInitialFormData(initial);
    }
  }, [data?.data?.Records[0]]);

  return (
    <Dialog open={modalOpen} onClose={closeModal} as="div" className="z-50">
      <div className="fixed inset-0 z-10 overflow-y-auto bg-black/55 backdrop-blur-sm">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel className="mx-auto w-[90%]   border border-bordercolor   sm:w-[60%] xl:w-[30%] 2xl:w-[28%] rounded-2xl  bg-primary shadow-lg">

            <ModalHeader title="Add Update Avatar " onClose={closeModal} />


            <div className="grid gap-4 p-6">
              {/* Profile Image Upload */}
              <div className="flex justify-center">
                <div
                  className="shadow px-1 py-1 rounded-full cursor-pointer"
                  onClick={() => document.getElementById("profilePicInput")?.click()}
                >
                  <div className="relative w-28 h-28">
                    <img
                      src={formData.profile_pic || AvatarDefault}
                      alt="Avatar"
                      className="w-28 h-28 rounded-full object-cover"
                    />
                    <img src={Plus} alt="plus" className="absolute bottom-0 right-0 w-7 h-7" />
                    <input
                      id="profilePicInput"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfilePicChange}
                    />
                  </div>
                </div>
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
                  className="w-full rounded-lg border border-bordercolor px-4 py-2.5 placeholder:text-sm  placeholder:text-placeholdercolor  text-textcolor focus:outline-none focus:ring-1 focus:ring-header"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="text-sm font-medium text-textcolor">
                  Gender<span className="text-red-600">*</span>
                </label>
                <div className="flex space-x-6 py-1">
                  {["Male", "Female"].map((option) => (
                    <label key={option} className="flex items-center    text-textcolor space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value={option}
                        checked={formData.gender.toLowerCase() === option.toLowerCase()}
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
                  className="px-14 py-2 rounded-xl bggradient text-white cursor-pointer disabled:opacity-50"
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
};

export default AvatarUpdate_Modal;
