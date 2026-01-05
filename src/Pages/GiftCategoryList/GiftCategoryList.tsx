import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Add from "/Images/add.png"
import SearchBar from '../../Componets/SearchBar/SearchBar';
import WithoutSorttableHeader from '../../Componets/TableComponets/WithoutSorttableHeader';
import useApiPost from '../../Hooks/PostData';
import notfound from "/Images/notfound.png"
import { useAppDispatch, useAppSelector } from '../../Hooks/Hooks';
import Loader from "/Images/Loader.gif"
import SimpletextTableBody from '../../Componets/TableComponets/SimpletextTableBody';
import TableDateTimeDisplay from '../../Componets/TableComponets/TableDateTimeDisplay';
import toast from 'react-hot-toast';
import Apimethod from '../../Hooks/Apimethod';
import GiftCategoryPagination from '../../Componets/PaginationComponets/GiftCategoryPagination';
import { setPaginationCategoryList } from '../../Appstore/Slice/PaginationSlice/GiftCategorySlice';
import { showModal } from '../../Appstore/Slice/ModalSlice';
import { reset } from '../../Appstore/Slice/toggleSlice';
import EditIcon from "/Images/edit.png"
import TableActionButtons from '../../Componets/TableComponets/TableActionButtons';
import Block from "/Images/deleteicon.png"

function GiftCategoryList() {

    const isSidebarOpen = useSelector((state: any) => state.sidebar.isOpen);
    const { data, loading, error, postData } = useApiPost();


    const IS_DEMO = import.meta.env.VITE_IS_DEMO === 'true';


    const pagination = useAppSelector((state) => state.GiftCategorySlice);
    const { current_page, records_per_page } = pagination;


    const [toggleStates, setToggleStates] = useState<{ [key: number]: boolean }>({});

    // Fetch data
    useEffect(() => {
        const params = {
            page: current_page,
            pageSize: records_per_page,
            sort_order:"DESC"

        };

        postData("/gift/get-gift-category", params);
    }, [current_page, records_per_page]);



    const isaddgiftvalues = useAppSelector((state) => state.toggle.value)


    useEffect(() => {

        if (isaddgiftvalues) {
            postData("/gift/get-gift-category", {});
        }

    }, [isaddgiftvalues])




    useEffect(() => {
        if (data?.data?.Records) {
            const toggles = data.data.Records.reduce((acc, gift) => {
                acc[gift.gift_category_id] = gift.status;
                return acc;
            }, {} as { [key: number]: boolean });
            setToggleStates(toggles);
        }
    }, [data]);



    const dispatch = useAppDispatch()


    useEffect(() => {
        if (data?.data?.Pagination) {
            dispatch(setPaginationCategoryList(data.data.Pagination));
        }
    }, [data, dispatch]);



    const { makeRequest } = Apimethod()

    const handleToggleStatus = async (giftId: number) => {

         if (IS_DEMO) {
            toast.error("This action is disabled in the demo version.");
            return;
        }
        const newStatus = !toggleStates[giftId];
        try {
            await makeRequest(
                "/admin/gift-category",
                {
                    gift_category_id: giftId,
                    status: newStatus,
                },
                "application/json",
                "PUT"
            );
            setToggleStates((prev) => ({
                ...prev,
                [giftId]: newStatus,
            }));
            toast.success("Gift status updated");
        } catch (err) {
            toast.error("Failed to update status");
        }
    };



    interface GiftCategory {
        name: string;
        gift_category_id: string;
    }

    const handalUpdateGift = (gift: GiftCategory) => {
        sessionStorage.setItem("giftcname", gift?.name)
        sessionStorage.setItem("gift_category_id", gift?.gift_category_id)
        dispatch(reset())
        dispatch(showModal("AddGiftCategoryUpdateModal"))
    }


    const handleBlock = (giftid: string) => {
         if (IS_DEMO) {
            toast.error("This action is disabled in the demo version.");
            return;
        }
        dispatch(showModal("DeleteGiftCategoryModal"))
        sessionStorage.setItem("giftcategoryid", giftid)
        dispatch(reset())
    }

    return (
        <div className={`bg-primary ${isSidebarOpen ? "xl:pl-20" : "xl:pl-72"}`}>
            <SearchBar />
            <div className="px-4 pb-10 xl:px-6">
                <div className="flex justify-between border-t-[#F2F2F2] py-3">
                    <h2 className="text-textcolor font-poppins text-xl font-semibold pt-3 ">Gift  Category List</h2>

                </div>

                <div className="flex items-center  flex-col  md:flex-row  gap-y-4     md:gap-y-0  justify-between">
                    <div className="flex items-center gap-2">
                        <Link to="/dashboard">
                            <h3 className="text-[#3A3A3A] font-poppins text-base  font-semibold">Dashboard</h3>
                        </Link>
                        <div className="rounded-full w-1 h-1 bg-[#E0E0E0]"></div>
                        <h3 className="text-[#858585] font-poppins text-base">Gift Category List</h3>
                    </div>

                    <button
                        className="flex gap-1.5 mr-1 py-2 cursor-pointer place-items-center px-4 font-poppins font-medium text-white rounded-md bggradient"

                        onClick={() => {
                            dispatch(showModal("AddGiftCategory"))
                            dispatch(reset())
                        }}

                    >
                        <img src={Add} className="w-4 h-4" />
                        <p className="md:text-sm text-xs">Add Gift Category</p>
                    </button>
                </div>


                <div className="relative border border-bordercolor rounded-lg mt-8 mx-4 sm:mx-0 overflow-x-auto w-full">
                    <div className="min-w-[1200px]">
                        <div className="flex px-4 py-3 text-left border-b w-full bg-headercolortable border-b-bordercolor sm:pl-8">
                            <div className="w-[10%]"><WithoutSorttableHeader label="S.L" /></div>
                            <div className="w-[30%]"><WithoutSorttableHeader label="CATEGORY NAME" /></div>
                            <div className="w-[20%]"><WithoutSorttableHeader label="GIFT COUNT" /></div>
                            <div className=' w-[30%]'>
                                <WithoutSorttableHeader label="CREATED DATE/TIME" />
                            </div>
                            <div className=' w-[25%]'>
                                <WithoutSorttableHeader label="STATUS" />
                            </div>
                            <div className="w-[15%]"><WithoutSorttableHeader label="ACTIONS" /></div>
                        </div>


                        <div className="relative">
                            {loading && (
                                <div className=" h-[400px] flex items-center justify-center  ">
                                    <img src={Loader} alt="Loading..." className="w-12 h-12" />
                                </div>
                            )}

                            {!loading && data?.data?.Records?.length > 0 ? (
                                data.data.Records.map((gift: any, index: number) => (
                                    <div key={gift.gift_id} className={`    ${index % 2 === 0 ? 'bg-white dark:bg-primary' : 'bg-[#00162e0a] dark:bg-primary'
                                        } flex items-center px-4 py-3 border-b border-b-bordercolor sm:pl-8`}>
                                        <div className="w-[10%] text-sm text-textcolor font-poppins">
                                            {(current_page - 1) * records_per_page + index + 1}
                                        </div>


                                        <div className=' w-[30%]'>
                                            <SimpletextTableBody title={gift.name} />
                                        </div>

                                        <div className=' relative w-[20%]'>
                                            <div className=' absolute   top-[-0.5rem] left-[10%]'>
                                                <SimpletextTableBody title={gift.count} />

                                            </div>
                                        </div>

                                        <div className=' w-[30%]'>
                                            <TableDateTimeDisplay dateString={gift.createdAt} />
                                        </div>
                                        <div className=' w-[25%]  relative'>
                                            <label className="flex items-center  absolute   top-[-1rem] left-2 cursor-pointer select-none">
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        checked={toggleStates[gift.gift_category_id] || false}
                                                        onChange={() => handleToggleStatus(gift.gift_category_id)}
                                                        className="sr-only"
                                                    />
                                                    <div className={`block h-6 w-10 rounded-full border transition duration-300 ${toggleStates[gift.gift_category_id] ? " border-toggalbtcolorborder bggradient" : "bg-transparent  border  border-toggalbtcolorborder"}`}></div>
                                                    <div className={`absolute top-1 h-4 w-4 rounded-full transition duration-300 ${toggleStates[gift.gift_category_id] ? "right-1 bg-white" : "left-1 bggradient"}`}></div>
                                                </div>
                                            </label>
                                        </div>


                                        <div className=' w-[15%]  flex gap-3'>
                                            <button className=" px-[10px] py-[10px] bg-[#D0CCE1]/60 rounded-full  cursor-pointer" onClick={() => handalUpdateGift(gift)}>
                                                <img src={EditIcon} alt="Edit" className="w-5 h-4" />
                                            </button>
                                            <TableActionButtons
                                                blockButtonIcon={Block}
                                                onBlockClick={() => {
                                                    handleBlock(gift.gift_category_id);
                                                }}
                                                viewButtonColor="#CCE1CD"
                                                blockButtonColor="#FDE4EA"
                                                borderColor="#01D312"
                                            />
                                        </div>


                                    </div>
                                ))
                            ) : !loading &&

                            <div className="p-4 h-[38rem] flex justify-center items-center">
                                <div className="w-full flex flex-col items-center h-full justify-center">
                                    <img
                                        src={notfound}
                                        alt="Not Found"
                                        className="w-1/2 max-h-[40vh] object-contain"
                                    />
                                    <h2 className="font-poppins text-lg text-textcolor  mt-4">
                                        No Gift Found
                                    </h2>
                                </div>
                            </div>

                            }
                        </div>
                    </div>

                    <GiftCategoryPagination />
                </div>
            </div>

        </div>
    )
}

export default GiftCategoryList
