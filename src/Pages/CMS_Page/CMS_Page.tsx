import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import SearchBar from '../../Componets/SearchBar/SearchBar';
import PrivacyPolicy from './PrivacyPage';
import TermsConditions from './TermsConditions';
import DeleteAccountCms from './DeleteAccountCms';
import { useAppDispatch } from '../../Hooks/Hooks';
import { useEffect } from 'react';
import { setAppConfig } from '../../Appstore/Slice/appConfigSlice';
import Apimethod from '../../Hooks/Apimethod';

function CMS_Page() {
    const isSidebarOpen = useSelector((state: any) => state.sidebar.isOpen);
    const { loading, error, data, makeRequest } = Apimethod();
    useEffect(() => {
        makeRequest("/project_conf", null, undefined, "GET");
    }, []);
    const dispatch = useAppDispatch()
    useEffect(() => {
        if (data?.data) {
            dispatch(setAppConfig(data?.data))
        }
    }, [data?.data])
    return (
        <div className={`bg-primary ${isSidebarOpen ? "xl:pl-20" : "xl:pl-72"}`}>
            <SearchBar />

            <div className="px-4 pb-10 xl:px-6">


                {/* Breadcrumb and Add Button */}
                <div className="w-full flex flex-col md:flex-row  py-4 justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                        <Link to="/dashboard">
                            <h3 className="text-base font-semibold text-[#3A3A3A]  font-poppins">Dashboard</h3>
                        </Link>
                        <div className="h-1 w-1 rounded-full bg-[#E0E0E0]"></div>
                        <h3 className="text-base text-[#858585] font-poppins">CMS Pages</h3>
                    </div>

                </div>


                <div className=' w-full  flex flex-col  gap-6'>
                    <PrivacyPolicy />
                    <TermsConditions />
                    {/* <DeleteAccountCms /> */}
                </div>

            </div>

        </div>
    )
}

export default CMS_Page
