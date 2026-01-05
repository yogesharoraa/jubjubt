
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import SearchBar from "../../Componets/SearchBar/SearchBar";

import { useAppDispatch, useAppSelector } from "../../Hooks/Hooks";

import AddIcon from "/Images/add.png";
import { showModal } from "../../Appstore/Slice/ModalSlice";
import useApiPost from "../../Hooks/PostData";
import WithoutSorttableHeader from "../../Componets/TableComponets/WithoutSorttableHeader";
import NotificationPaginatiuon from "../../Componets/PaginationComponets/NotificationPaginatiuon";
import { useEffect } from "react";
import notfound from "../../../public/Images/notfound.png"
import Loader from "../../../public/Images/Loader.gif"
import SimpletextTableBody from "../../Componets/TableComponets/SimpletextTableBody";
import TableDateTimeDisplay from "../../Componets/TableComponets/TableDateTimeDisplay";
import { setPaginationNotificationlList } from "../../Appstore/Slice/PaginationSlice/NotificationPaginationSlice";
import toast from "react-hot-toast";


function Notification() {
        const IS_DEMO = import.meta.env.VITE_IS_DEMO === 'true';

    const dispatch = useAppDispatch();
    const isSidebarOpen = useSelector((state) => state.sidebar.isOpen);



    const handleAddRecharge = () => {
         
        dispatch(showModal("AddNotificationModal"));
    };


    const pagination = useAppSelector((state) => state.NotificationPaginationSlice);



    const { loading, data, postData } = useApiPost()



    const { current_page, records_per_page } = pagination;


    // Fetch avatar list with pagination
    useEffect(() => {
        const formData = new FormData();
        formData.append("page", current_page.toString());
        formData.append("pageSize", records_per_page.toString());
          formData.append("sort_order" , "DESC" )
        postData("/admin/list-broadcast-notification", formData);
    }, [current_page, records_per_page]);

    // Set pagination data from API
    useEffect(() => {
        if (data?.data?.Pagination) {
            dispatch(setPaginationNotificationlList(data.data.Pagination));
        }
    }, [data, dispatch]);
    const IsAvatar = useAppSelector((state) => state.toggle.value);


    useEffect(() => {
        if (IsAvatar) postData("/admin/list-broadcast-notification", {});
    }, [IsAvatar]);


    return (
        <div className={`bg-primary ${isSidebarOpen ? "xl:pl-20" : "xl:pl-72"}`}>
            <SearchBar />

            <div className="px-4 pb-10 xl:px-6">
                {/* Header */}
                <div className="flex justify-between border-t-[#F2F2F2] py-3">
                    <h2 className="pt-3 text-xl font-semibold text-textcolor font-poppins">Push Notification</h2>
                </div>

                {/* Breadcrumb + Add Button */}
                <div className="mb-4 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Link to="/dashboard">
                            <h3 className="text-base font-semibold text-[#3A3A3A] font-poppins">Dashboard</h3>
                        </Link>
                        <div className="h-1 w-1 rounded-full bg-[#E0E0E0]" />
                        <h3 className="text-base text-[#858585] font-poppins">Push Notification</h3>
                    </div>
                    <button onClick={handleAddRecharge} className="flex gap-1.5 mr-1 py-2 px-4   cursor-pointer font-poppins font-medium text-white rounded-md bggradient">
                        <img src={AddIcon} className="w-4 h-4" alt="Add" />
                        <p className="md:text-sm text-xs">Push Notification</p>
                    </button>
                </div>

                <div className="w-full overflow-x-auto rounded-lg border border-bordercolor mt-6">
                    <div className="min-w-[1200px]">
                        {/* Table Header */}
                        <div className="flex  bg-headercolortable px-4 py-3 text-left font-medium border-b w-full border-bordercolor sm:pl-8">
                            <div className="w-[5%]">
                                <WithoutSorttableHeader label="S.L" />
                            </div>
                            <div className="w-[15%]">
                                <WithoutSorttableHeader label="TITLE " />
                            </div>
                            <div className="w-[60%]">
                                <WithoutSorttableHeader label="DESCRIPTION " />
                            </div>

                            <div className="w-[10%]">
                                <WithoutSorttableHeader label="DATE " />
                            </div>

                        </div>
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
                                className={`flex items-center px-4 py-3 border-b border-bordercolor   ${index % 2 === 0 ? 'bg-white dark:bg-primary' : 'bg-[#00162e0a] dark:bg-primary'
                                    }  sm:pl-8`}
                            >
                                <div className="w-[5%] text-sm font-poppins text-textcolor">
                                    {(current_page - 1) * records_per_page + index + 1}
                                </div>

                                <div className="w-[15%]">
                                    <SimpletextTableBody title={user.title} />
                                </div>

                                <div className="w-[60%]">
                                    <SimpletextTableBody title={user.message} />
                                </div>


                                <div>
                                    <TableDateTimeDisplay dateString={user.createdAt} />
                                </div>



                            </div>
                        ))
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
                    <NotificationPaginatiuon />
                </div>
            </div>
        </div>
    );
}

export default Notification;