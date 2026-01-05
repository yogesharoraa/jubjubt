import React, { useState } from 'react';
import PasswordInput from '../../Componets/Form/PasswordInput';
import toast from 'react-hot-toast';
import useApiPost from '../../Hooks/PostData';
import { useAppSelector } from '../../Hooks/Hooks';
import Cookies from 'js-cookie';

interface FormData {
  password: string;
  npassword: string;
  cpassword: string;
}

const ChangePassword: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    password: '',
    npassword: '',
    cpassword: ''
  });


  const IS_DEMO = import.meta.env.VITE_IS_DEMO === 'true'; 




  const UserDetail = useAppSelector((state) => state.admin)





  const { postData, loading, error } = useApiPost();


  const handlePasswordChange = (field: keyof FormData) => (newPassword: string) => {
   
    setFormData((prevData) => ({
      ...prevData,
      [field]: newPassword,
    }));
  };
  const handleChangePassword = async () => {

    if (IS_DEMO) {
      toast.error("This action is disabled in the demo version.");
      return;
    }

    const { password, npassword, cpassword } = formData;

    // 1. Validate input fields
    if (!password || !npassword || !cpassword) {
      toast.error("All fields are required");
      return;
    }

    if (npassword !== cpassword) {
      toast.error("New Password and Confirm Password must match");
      return;
    }

    // 2. Prepare form data
    const payload = new FormData();
    payload.append("oldpassword", password);
    payload.append("password", cpassword);

    try {
      const response = await postData("/admin/update-profile", payload);

      if (response?.status) {
        toast.success(response.message || "Password changed successfully");

        // Clear fields
        setFormData({
          password: '',
          npassword: '',
          cpassword: ''
        });

        Cookies.remove("token")
        // window.location.reload()
      } else {
        if (response?.toast) {
          toast.error(response.message || "Something went wrong");
        }
      }
    } catch (err) {
      toast.error("Server error. Please try again later.");
    }
  };



  return (
    <div>
      <div className="flex justify-center">
        <div className="max-w-[1000px] w-full">

          <div className="flex items-center justify-center w-full py-3">
            <div className="shadow-[9.3px_10.46px_64.96px_0px_rgba(0,0,0,0.2)] px-1 py-1 rounded-full">
              <div className="relative flex items-center justify-center w-24 h-24">
                {/* User Image */}
                <img src={UserDetail?.profile_pic} alt="User" className="absolute inset-0 w-24 h-24 m-auto rounded-full" />
              </div>
            </div>
          </div>
          <h2 className='flex justify-center pb-3 text-base font-semibold font-poppins  text-textcolor'>{UserDetail.full_name}</h2>

          <div className='grid gap-3 px-10 py-4 md:gap-10 md:grid-cols-2'>
            {/* Current Password */}
            <PasswordInput
              label="Current Password"
              placeholder="Enter Current Password"
              onPasswordChange={handlePasswordChange('password')}
            />
            {/* New Password */}
            <PasswordInput
              label="New Password"
              placeholder="Enter New Password"
              onPasswordChange={handlePasswordChange('npassword')}
            />
            {/* Confirm Password */}
            <PasswordInput
              label="Confirm Password"
              placeholder="Enter Confirm Password"
              onPasswordChange={handlePasswordChange('cpassword')}
            />
          </div>

          {/* Submit Button */}
          <div className='flex justify-center py-8'>
            <button
              className='text-base font-poppins text-[#FFFFFF] px-16 py-2 rounded-lg bggradient  cursor-pointer'
              onClick={handleChangePassword}
              disabled={loading}

            >
              {loading ? 'Processing...' : 'Submit'}

            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
