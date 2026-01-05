import React, { useEffect, useMemo, useState, useCallback } from 'react';
import ToggleSwitchSettingLogin from '../../../Componets/ToggleSwitchSettingLogin';
import Apimethod from '../../../Hooks/Apimethod';
import { useAppDispatch, useAppSelector } from '../../../Hooks/Hooks';
import { setAppConfig } from '../../../Appstore/Slice/appConfigSlice';
import { toast } from 'react-hot-toast';

function Gpay() {
      const IS_DEMO = import.meta.env.VITE_IS_DEMO === 'true';

  const dispatch = useAppDispatch();
  const { makeRequest, loading } = Apimethod();
  const appConfig = useAppSelector((state) => state.appConfig.config);

  // Memoize initial form data from appConfig
  const initialFormData = useMemo(() => ({
    gpay_merch_id: appConfig?.gpay_merch_id || '',
    gpay_merch_name: appConfig?.gpay_merch_name || '',
    gpay_currency_code: appConfig?.gpay_currency_code || '',
    gpay_country_code: appConfig?.gpay_country_code || '',
    gpay: String(appConfig?.gpay ?? 'false'),
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
        toast.success('gpay config updated successfully.');
      }
    } catch (error) {
      toast.error('Update failed. Please try again.');
    }
  }, [formData, initialFormData, makeRequest, dispatch]);

  // Toggle the gpay status separately
  const handleStatusToggle = useCallback(async () => {
     if (IS_DEMO) {
            toast.error("This action is disabled in the demo version.");
            return;
        }
    const newStatus = formData.gpay === 'true' ? 'false' : 'true';

    try {
      const response = await makeRequest(
        '/admin/update-project-conf',
        { gpay: newStatus },
        'application/json',
        'PUT'
      );

      if (response?.data) {
        setFormData((prev) => ({
          ...prev,
          gpay: newStatus,
        }));

        dispatch(setAppConfig(response.data));
        toast.success(`gpay status updated to ${newStatus} successfully!`);
      }
    } catch (error) {
      toast.error('Status update failed. Please try again.');
    }
  }, [formData.gpay, makeRequest, dispatch]);

  return (
    <div className="p-4">
      {/* Toggle gpay status */}
      <div className="w-full flex items-end justify-end">
        <ToggleSwitchSettingLogin
          label="Enable Gpay Payment"
          enabled={formData.gpay === 'true'}
          loading={loading}
          onChange={handleStatusToggle}
        />
      </div>

      {/* Input Fields */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {[
          { label: ' Gpay Merch Id', key: 'gpay_merch_id' },
          { label: ' Gpay Merch Name', key: 'gpay_merch_name' },
            { label: 'Gpay Country Code', key: 'gpay_country_code' },
            { label: 'Gpay Currency Code', key: 'gpay_currency_code' },
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

export default Gpay;
