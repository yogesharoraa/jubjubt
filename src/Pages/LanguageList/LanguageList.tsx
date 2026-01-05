import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from '../../Componets/SearchBar/SearchBar';
import AddIcon from "/Images/add.png"
import WithoutSorttableHeader from '../../Componets/TableComponets/WithoutSorttableHeader';
import LanguageListPagination from '../../Componets/PaginationComponets/LanguageListPagination';
import useApiPost from '../../Hooks/PostData';
import { useAppDispatch, useAppSelector } from '../../Hooks/Hooks';
import { useEffect, useState } from 'react';
import notfound from "/Images/notfound.png"
import Loader from "/Images/Loader.gif"
import { setPaginationLanguageList } from '../../Appstore/Slice/PaginationSlice/LanguageListPaginationSlice';
import SimpletextTableBody from '../../Componets/TableComponets/SimpletextTableBody';
import Apimethod from '../../Hooks/Apimethod';
import toast from 'react-hot-toast';
import { reset, setTrue } from '../../Appstore/Slice/toggleSlice';
import TableActionButtons from '../../Componets/TableComponets/TableActionButtons';
import EditIcon from "/Images/edit.png"
import BlockIcon from "/Images/translate.png"
import { showModal } from '../../Appstore/Slice/ModalSlice';

function LanguageList() {
    const isSidebarOpen = useSelector((state: any) => state.sidebar.isOpen);
    const [toggleStates, setToggleStates] = useState<{ [key: number]: boolean }>({});

        const IS_DEMO = import.meta.env.VITE_IS_DEMO === 'true';

    const [toggleStatesDefaultlanguage, setToggleStatesLanguage] = useState<{ [key: number]: boolean }>({});

    const pagination = useAppSelector((state) => state.LanguageListPaginationSlice);
    const { current_page, records_per_page } = pagination;

    const dispatch = useAppDispatch()

    const { loading, data, postData } = useApiPost();

    useEffect(() => {
        const formData = new FormData();
        formData.append("page", current_page.toString());
        formData.append("pageSize", records_per_page.toString());
          formData.append("sort_order" , "DESC" )
        postData("/language/get-language", formData);
    }, [current_page, records_per_page]);



    const sliceValues = useAppSelector((state) => state.toggle.value);



    useEffect(() => {
        if (sliceValues) {
            postData("/language/get-language", {});

        }
    }, [sliceValues])

    // Set pagination data from API
    useEffect(() => {
        if (data?.data?.Pagination) {
            dispatch(setPaginationLanguageList(data.data.Pagination));
        }
    }, [data, dispatch]);






    useEffect(() => {
        if (data?.data?.Records) {
            const toggles = data.data.Records.reduce((acc, record) => {
                acc[record.language_id] = record.status ?? false;
                return acc;
            }, {} as { [key: number]: boolean });
            setToggleStates(toggles);
        }
    }, [data]);


    //  default langugae 




    useEffect(() => {
        if (data?.data?.Records) {
            const toggles = data.data.Records.reduce((acc, record) => {
                acc[record.language_id] = record.default_status ?? false;
                return acc;
            }, {} as { [key: number]: boolean });
            setToggleStatesLanguage(toggles);
        }
    }, [data]);

    const { makeRequest } = Apimethod()


    const handleToggleStatus = async (socialId: number) => {
         if (IS_DEMO) {
            toast.error("This action is disabled in the demo version.");
            return;
        }
        const newStatus = !toggleStates[socialId];
        try {
            await makeRequest(
                "/Admin/update-language",
                {
                    language_id: socialId,
                    status: newStatus,
                },
                "application/json",
                "PUT"
            );
            setToggleStates((prev) => ({
                ...prev,
                [socialId]: newStatus,
            }));
            toast.success("language status updated");
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    //  language update 


    const handleToggleStatusDefaultLanguage = async (socialId: number) => {
         if (IS_DEMO) {
            toast.error("This action is disabled in the demo version.");
            return;
        }

        dispatch(reset())

        const newStatus = !toggleStates[socialId];
        try {
            await makeRequest(
                "/Admin/update-language",
                {
                    language_id: socialId,
                    default_status: "true",
                },
                "application/json",
                "PUT"
            );
            setToggleStatesLanguage((prev) => ({
                ...prev,
                [socialId]: newStatus,
            }));
            toast.success(" status updated  Default language");

            dispatch(setTrue())
        } catch (err) {
            toast.error("Failed to update status");
        }
    };



    const handleUpdateLanguage = (language_id: number) => {
         if (IS_DEMO) {
            toast.error("This action is disabled in the demo version.");
            return;
        }
        sessionStorage.setItem("language_id", language_id.toString())
        dispatch(showModal("UpdateLanguage_Modal"))
        dispatch(reset())
    };


    const navigate = useNavigate()

    const handleBlock = (statusId: number) => {
         if (IS_DEMO) {
            toast.error("This action is disabled in the demo version.");
            return;
        }
        navigate(`/language-list/${statusId}`)
        sessionStorage.setItem("language_idTransalate", statusId.toString())
    };


    const handaladdlanguage = () => {
        
        dispatch(showModal("AddLanguage_Modal"))
        dispatch(reset())
    }

    return (
        <div className={`bg-primary ${isSidebarOpen ? "xl:pl-20" : "xl:pl-72"}`}>
            <SearchBar />

            <div className="px-4 pb-10 xl:px-6">
                {/* Page Header */}
                <div className="flex justify-between py-3">
                    <h2 className="text-textcolor font-poppins text-xl font-semibold pt-3 ">Language List</h2>
                </div>

                {/* Breadcrumb and Add Button */}
                <div className="w-full flex flex-col md:flex-row justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                        <Link to="/dashboard">
                            <h3 className="text-base font-semibold text-[#3A3A3A]  font-poppins">Dashboard</h3>
                        </Link>
                        <div className="h-1 w-1 rounded-full bg-[#E0E0E0]"></div>
                        <h3 className="text-base text-[#858585] font-poppins">Language List</h3>
                    </div>
                    <button
                        className="flex items-center gap-1.5 mb-2 mr-1 py-2 px-4   cursor-pointer rounded-md font-poppins text-white font-medium bggradient"

                        onClick={handaladdlanguage}
                    >
                        <img src={AddIcon} className="w-4 h-4" alt="Add" />
                        <span className="text-xs md:text-sm">Add Language</span>
                    </button>
                </div>

                {/* Table */}
                <div className="w-full overflow-x-auto rounded-lg border border-bordercolor mt-6">
                    <div className="min-w-[1200px]">
                        {/* Table Header */}
                        <div className="flex  bg-headercolortable px-6 py-3 gap-x-4 font-medium border-b border-bordercolor sm:pl-8">
                            {[
                                "S.L",
                                "LANGUAGE",
                                "LANGUAGE ALIGNMENT",
                                "STATUS",
                                "DEFAULT",
                                "ACTIONS"
                            ].map((label, idx) => (
                                <div
                                    key={idx}
                                    className={[
                                        "w-[15%]",
                                        "w-[18%]",
                                        "w-[20%]",
                                        "w-[14%]",
                                        "w-[14%]",
                                        "w-[8%]"
                                    ][idx]}
                                >
                                    <WithoutSorttableHeader label={label} />
                                </div>
                            ))}
                        </div>

                        {/* Table Body */}
                        {loading ? (
                            <div className="p-4 h-[20rem] flex justify-center items-center">
                                <img src={Loader} alt="Loading..." className="w-12 h-12" />
                            </div>
                        ) : data?.data?.Records?.length > 0 ? (
                            data.data.Records.map((user: any, index: number) => (
                                <div
                                    key={user.avatar_id}
                                    className={`flex items-center px-6 py-3 gap-x-4 border-b border-bordercolor     ${index % 2 === 0 ? 'bg-white dark:bg-primary' : 'bg-[#00162e0a] dark:bg-primary'
                                        } sm:pl-8`}
                                >
                                    {/* S.L */}
                                    <div className="w-[15%] text-sm font-poppins text-textcolor">
                                        {(current_page - 1) * records_per_page + index + 1}
                                    </div>

                                    {/* Language */}
                                    <div className="w-[18%]">
                                        <SimpletextTableBody title={user.language} />
                                    </div>

                                    {/* Language Alignment */}
                                    <div className="w-[20%]">
                                        <SimpletextTableBody title={user.language_alignment} />
                                    </div>

                                    {/* Status Toggle */}
                                    <div className="w-[14%]">
                                        <label className="flex items-center cursor-pointer select-none">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={toggleStates[user.language_id] || false}
                                                    onChange={() => handleToggleStatus(user.language_id)}
                                                    className="sr-only"
                                                />
                                                <div className={`block h-6 w-10 rounded-full border transition duration-300 ${toggleStates[user.language_id]
                                                    ? " border-toggalbtcolorborder bggradient" : "bg-transparent  border  border-toggalbtcolorborder"}`}></div>
                                                <div className={`absolute top-1 h-4 w-4 rounded-full transition duration-300 ${toggleStates[user.language_id]
                                                    ? "right-1 bg-white"
                                                    : "left-1 bggradient"
                                                    }`}></div>
                                            </div>
                                        </label>
                                    </div>

                                    {/* Default Language Toggle */}
                                    <div className="w-[14%]">
                                        <label className="flex items-center cursor-pointer select-none">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={toggleStatesDefaultlanguage[user.language_id] || false}
                                                    onChange={() => handleToggleStatusDefaultLanguage(user.language_id)}
                                                    className="sr-only"
                                                />
                                                <div className={`block h-6 w-10 rounded-full border transition duration-300 ${toggleStatesDefaultlanguage[user.language_id]
                                                    ? " border-toggalbtcolorborder bggradient" : "bg-transparent  border  border-toggalbtcolorborder"}`}></div>
                                                <div className={`absolute top-1 h-4 w-4 rounded-full transition duration-300 ${toggleStatesDefaultlanguage[user.language_id]
                                                    ? "right-1 bg-white"
                                                    : "left-1 bggradient"
                                                    }`}></div>
                                            </div>
                                        </label>
                                    </div>

                                    {/* Actions */}
                                    <div className="w-[8%]">
                                        <div className="flex gap-2 items-center justify-between">
                                            <button
                                                className="px-[10px] py-[8px]   cursor-pointer bg-[#D0CCE1]/60 rounded-full"
                                                onClick={() => handleUpdateLanguage(user.language_id)}
                                            >
                                                <img src={EditIcon} alt="Edit" className="w-4 h-4" />
                                            </button>
                                            <div className=' w-full'>
                                                <TableActionButtons
                                                    blockButtonIcon={BlockIcon}
                                                    onBlockClick={() => handleBlock(user.language_id)}
                                                    viewButtonColor="#CCE1CD"
                                                    blockButtonColor="#FDE4EA"
                                                    borderColor="#01D312"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 h-[38rem] flex justify-center items-center">
                                <div className="flex flex-col items-center w-full h-full justify-center">
                                    <img src={notfound} alt="Not Found" className="w-1/2 max-h-[40vh] object-contain" />
                                    <h2 className="font-poppins text-lg text-textcolor   mt-4">
                                        Don't have any data to show
                                    </h2>
                                </div>
                            </div>
                        )}
                    </div>
                    <LanguageListPagination />
                </div>

            </div>


        </div>
    )
}

export default LanguageList
