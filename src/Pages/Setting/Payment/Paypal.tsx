import React, { useEffect, useMemo, useState, useCallback } from 'react';
import ToggleSwitchSettingLogin from '../../../Componets/ToggleSwitchSettingLogin';
import Apimethod from '../../../Hooks/Apimethod';
import { useAppDispatch, useAppSelector } from '../../../Hooks/Hooks';
import { setAppConfig } from '../../../Appstore/Slice/appConfigSlice';
import { toast } from 'react-hot-toast';

function Paypal() {
  const dispatch = useAppDispatch();
  const { makeRequest, loading } = Apimethod();
  const appConfig = useAppSelector((state) => state.appConfig.config);


      const IS_DEMO = import.meta.env.VITE_IS_DEMO === 'true';

  // Memoize initial form data from appConfig
  const initialFormData = useMemo(() => ({
    paypal_public_key: appConfig?.paypal_public_key || '',
    paypal_secret_key: appConfig?.paypal_secret_key || '',
    paypal: String(appConfig?.paypal ?? 'false'),
  }), [appConfig]);

  // Local state for form
  const [formData, setFormData] = useState(initialFormData);

  // Sync formData when appConfig changes
  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  // Update only changed fields on submit
  const handleSubmit = useCallback(async () => {
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

    if (changedFields.entries().next().done) {
      toast.info('No changes to update.');
      return;
    }

    try {
      const response = await makeRequest(
        '/admin/update-project-conf',
        changedFields,
        'multipart/form-data',
        'PUT'
      );

      if (response?.data) {
        dispatch(setAppConfig(response.data));
        toast.success('paypal config updated successfully.');
      }
    } catch (error) {
      toast.error('Update failed. Please try again.');
    }
  }, [formData, initialFormData, makeRequest, dispatch]);

  // Toggle the paypal status separately
  const handleStatusToggle = useCallback(async () => {
     if (IS_DEMO) {
            toast.error("This action is disabled in the demo version.");
            return;
        }
    const newStatus = formData.paypal === 'true' ? 'false' : 'true';

    try {
      const response = await makeRequest(
        '/admin/update-project-conf',
        { paypal: newStatus },
        'application/json',
        'PUT'
      );

      if (response?.data) {
        setFormData((prev) => ({
          ...prev,
          paypal: newStatus,
        }));

        dispatch(setAppConfig(response.data));
        toast.success(`paypal status updated to ${newStatus} successfully!`);
      }
    } catch (error) {
      toast.error('Status update failed. Please try again.');
    }
  }, [formData.paypal, makeRequest, dispatch]);

  return (
    <div className="p-4">
      {/* Toggle paypal status */}
      <div className="w-full flex items-end justify-end">
        <ToggleSwitchSettingLogin
          label="Enable paypal Payment"
          enabled={formData.paypal === 'true'}
          loading={loading}
          onChange={handleStatusToggle}
        />
      </div>

      {/* Input Fields */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {[
          { label: 'Paypla Public Key', key: 'paypal_public_key' },
          { label: 'Paypal Secret Key', key: 'paypal_secret_key' },
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
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  [key]: e.target.value,
                }))
              }
            />
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-20 pb-4">
        <button
          className={`px-24 py-3 text-lg font-medium text-white rounded-xl bggradient ${
            loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
          }`}
          disabled={loading}
          onClick={handleSubmit}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  );
}

export default Paypal;
