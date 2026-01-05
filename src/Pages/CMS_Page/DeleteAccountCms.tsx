import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import JoditEditor from 'jodit-react';
import { useAppDispatch, useAppSelector } from '../../Hooks/Hooks';
import Apimethod from '../../Hooks/Apimethod';
import { setAppConfig } from '../../Appstore/Slice/appConfigSlice';

const editorConfig = {
    readonly: false,
    height: 520,
    toolbarAdaptive: false,
    placeholder: ' ',
    spellcheck: true,
    showCharsCounter: false,
    showWordsCounter: false,
    toolbar: true,
    askBeforePasteHTML: false,
    cleanHTML: {
        removeStyles: true,
        removeTags: ['style', 'script'],
    },
};

function DeleteAccountCms(): JSX.Element {

        const IS_DEMO = import.meta.env.VITE_IS_DEMO === 'true';

    const appConfig = useAppSelector((state) => state.appConfig.config);
    const [privacyPolicy, setPrivacyPolicy] = useState();
    const { loading, makeRequest } = Apimethod();



      useEffect(()=>{
              if(appConfig?.delete_account) {
                   setPrivacyPolicy(appConfig?.delete_account)
              }
            }, [appConfig])


    const dispatch = useAppDispatch()

    const handleAddPolicy = async () => {
         if (IS_DEMO) {
            toast.error("This action is disabled in the demo version.");
            return;
        }
        const formData = new FormData();
        formData.append('delete_account', privacyPolicy);

        try {
            const res = await makeRequest('/admin/update-project-conf', formData, 'multipart/form-data', 'PUT');
            toast.success(' Delete Account Updated Successfully!');
            dispatch(setAppConfig(res?.data))


        } catch (error) {
            toast.error('Failed to update policy');
        }
    };

    return (
        <div className="p-3 space-y-5 md:p-6">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div>
                    <label className="block mb-2 text-2xl text-textcolor  font-semibold">Delete Account</label>
                    <div className="p-4 bg-white border-[#E3E3E3] rounded shadow h-[550px]">
                        <JoditEditor
                            value={privacyPolicy}
                            config={editorConfig}
                            onChange={(newContent: string) => setPrivacyPolicy(newContent)}
                        />
                    </div>
                </div>
            </form>

            <button
                type="button"
                className="flex gap-1.5 items-center cursor-pointer px-6 py-2 bggradient rounded-lg font-poppins font-medium text-white"
                onClick={handleAddPolicy}
                disabled={loading}
            >
                {loading ? 'Submitting...' : 'Submit'}
            </button>
        </div>
    );
}

export default DeleteAccountCms;
