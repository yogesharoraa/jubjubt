import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import SearchBar from '../../Componets/SearchBar/SearchBar';
import { Link } from 'react-router-dom';
import WithoutSorttableHeader from '../../Componets/TableComponets/WithoutSorttableHeader';
import useApiPost from '../../Hooks/PostData';
import notfound from '/Images/not_tick.png';
import Loader from '/Images/Loader.gif';
import { useAppDispatch, useAppSelector } from '../../Hooks/Hooks';
import toast from 'react-hot-toast';
import Apimethod from '../../Hooks/Apimethod';
import LanguageTranslatePagination from '../../Componets/PaginationComponets/LanguageTranslatePagination';
import { setPaginationLanguageTransalateList } from '../../Appstore/Slice/PaginationSlice/LanguageTranslatePaginationSlice';

function LanguageTranslate() {
    const isSidebarOpen = useSelector((state: any) => state.sidebar.isOpen);
    const { loading, data, postData } = useApiPost();
    const pagination = useAppSelector((state) => state.LanguageTranslatePaginationSlice);
    const { current_page, records_per_page } = pagination;

    const dispatch = useAppDispatch()

    const language_idTransalate = sessionStorage.getItem("language_idTransalate");
    const [translations, setTranslations] = useState<Record<number, string>>({});

    useEffect(() => {
        const formData = new FormData();
        formData.append("language_id", language_idTransalate ?? "");
        postData("/language/get-language-words", formData);
    }, [language_idTransalate]);


    useEffect(() => {
        if (data?.data?.Pagination) {
            dispatch(setPaginationLanguageTransalateList(data.data.Pagination));
        }
    }, [data, dispatch]);

    const handleChange = (key_id: number, value: string) => {
        setTranslations({ [key_id]: value });
    };


    const handleUpdate = (key_id: number) => {
        if (!translations[key_id]) return;
        // call update API here
    };

    const { makeRequest } = Apimethod()




    const handleTransalteLanguage = async (key_id: number) => {
        const formdata = new FormData();
        formdata.append("language_id", language_idTransalate ?? "");
        formdata.append("key_id", key_id.toString());
        formdata.append("key", translations[key_id] ?? "");

        try {
            const response = await makeRequest("/admin/translate-single-keyword", formdata, undefined, "POST");

            toast.success("Key updated with translated value");

        } catch (error) {
            toast.error("An error occurred during translation");
        }
    };




    const handalTransalateAll = async () => {

        const formdata = new FormData()

        formdata.append("language_id", language_idTransalate ?? "");
        try {
            const response = await makeRequest("/admin/translate-all-keywords", formdata, undefined, "POST");

            toast.success("Language Translated All key");

        } catch (error) {
            toast.error("An error occurred during translation");
        }

    }




    return (
        <div className={`bg-primary ${isSidebarOpen ? "xl:pl-20" : "xl:pl-72"}`}>
            <SearchBar />

            <div className="px-4 pb-10 xl:px-6">
                {/* Page Header */}
                <div className="flex justify-between py-3">
                    <h2 className="text-textcolor font-poppins text-xl font-semibold pt-3 ">Language Setting</h2>
                </div>

                {/* Breadcrumb and Add Button */}
                <div className="w-full flex flex-col md:flex-row justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                        <Link to="/dashboard">
                            <h3 className="text-base font-semibold text-[#3A3A3A]  font-poppins">Dashboard</h3>
                        </Link>
                        <div className="h-1 w-1 rounded-full bg-[#E0E0E0]"></div>
                        <h3 className="text-base text-[#858585] font-poppins">Language Setting</h3>
                    </div>
                    <button className="flex items-center gap-1.5 mb-2 mr-1 py-2 px-4 cursor-pointer rounded-md font-poppins text-white font-medium bggradient" onClick={handalTransalateAll}>
                        <span className="text-xs md:text-sm">Translate All</span>
                    </button>
                </div>

                <div className="border border-[#E3E3E3] rounded-lg mt-8 mx-4 sm:mx-0 overflow-x-auto w-full">
                    <div className="xl:overflow-x-auto lg:overflow-x-auto 2xl:overflow-hidden min-w-[1200px]">
                        <div className="min-w-max">
                            {/* Table Header */}
                            <div className="flex px-4 py-3 pl-4 text-left border-b bg-[#D5D5D5] border-b-[#E3E3E3] sm:pl-8">
                                <div className='w-[10%]'><WithoutSorttableHeader label="SETTING ID" /></div>
                                <div className='w-[35%]'><WithoutSorttableHeader label="KEY" /></div>
                                <div className='w-[35%]'><WithoutSorttableHeader label="VALUE" /></div>
                                <div className='w-[10%]'><WithoutSorttableHeader label="Auto Translate" /></div>
                                <div className='w-[10%]'><WithoutSorttableHeader label="Update" /></div>
                            </div>

                            {/* Table Body */}
                            {loading ? (
                                <div className="p-4 h-[20rem] flex justify-center items-center">
                                    <img src={Loader} alt="Loading..." className="w-12 h-12" />
                                </div>
                            ) : data?.data?.Records?.length > 0 ? (
                                data.data.Records.map((item: any, index: number) => {
                                    const currentValue = translations[item.key_id] ?? item.Translation ?? "";
                                    const isUnchanged = currentValue === item.Translation;

                                    return (
                                        <div
                                            key={item.key_id}
                                            className={`flex items-center px-4 py-3 border-b border-[#E5E7EB] ${index % 2 === 0 ? "bg-white" : "bg-[#00162e0a]"} sm:pl-8`}
                                        >
                                            <div className="w-[10%] text-sm font-poppins text-textcolor ">
                                                {(current_page - 1) * Number(records_per_page) + index + 1}
                                            </div>

                                            <div className='w-[35%]'>
                                                <h2 className="font-poppins text-sm cursor-not-allowed border border-[#E5E7EB] text-textcolor   w-[80%] p-2 rounded-md">
                                                    {item.key}
                                                </h2>
                                            </div>

                                            <div className='w-[35%]'>
                                                <input
                                                    value={currentValue}
                                                    onChange={(e) => handleChange(item.key_id, e.target.value)}
                                                    placeholder="Enter value"
                                                    className="border border-[#7fad9344] text-textcolor  font-poppins  bg-transparent border-opacity-10 rounded p-2 w-[80%] text-sm focus:outline-none focus:ring-1 focus:ring-[#f9a866]"
                                                />
                                            </div>

                                            <div className='w-[10%]'>
                                                <button className="bggradient cursor-pointer font-poppins text-[#ffffff] text-xs rounded-md px-6 py-1.5" onClick={() => handleTransalteLanguage(item.key_id)}>
                                                    Translate
                                                </button>
                                            </div>

                                            <div className="w-[10%]">
                                                <button
                                                    disabled={isUnchanged}
                                                    onClick={() => handleUpdate(item.key_id)}
                                                    className={`border border-[#FE2A40] bg-[#D23C3C] font-poppins  text-[#FFFFFF] text-xs rounded-md px-6 py-1.5 transition-opacity ${isUnchanged ? "opacity-50 cursor-not-allowed" : "opacity-100"}`}
                                                >
                                                    Update
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-4 h-[38rem] flex justify-center items-center">
                                    <div className="flex flex-col items-center w-full h-full justify-center">
                                        <img src={notfound} alt="Not Found" className="w-1/2 max-h-[40vh] object-contain" />
                                        <h2 className="font-poppins text-lg text-textcolor  mt-4">
                                            Don't have any data to show
                                        </h2>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <LanguageTranslatePagination />
                </div>
            </div>
        </div>
    );
}

export default LanguageTranslate;
