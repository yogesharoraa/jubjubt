import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Eye from "/Images/eye.png";
import SearchBar from "../../Componets/SearchBar/SearchBar";
import Search from "/Images/search.png";
import WithoutSorttableHeader from "../../Componets/TableComponets/WithoutSorttableHeader";
import SortableHeader from "../../Componets/TableComponets/SortableHeader";
import StoryThumbnail from "../../Componets/TableComponets/StoryThumbnail";
import TableDateTimeDisplay from "../../Componets/TableComponets/TableDateTimeDisplay";
import PaginationComponets from "../../Componets/PaginationComponets";
import Loader from "/Images/Loader.gif";
import Add from "/Images/add.png";
import EditIcon from "/Images/edit.png";
import notfound from "/Images/notfound.png";
import { useAppDispatch, useAppSelector } from "../../Hooks/Hooks";
import { setPaginationValues } from "../../Appstore/Slice/PaginationValues";
import defaultPagination from "../../Appstore/Slice/PaginationValues";
import useApiPost from "../../Hooks/PostData";
import { showModal } from "../../Appstore/Slice/ModalSlice";
import Apimethod from "../../Hooks/Apimethod";
import { clearSelectedCategory } from "../../Appstore/Slice/CategorySelectedIDandValues";
import TableActionButtons from "../../Componets/TableComponets/TableActionButtons";
import { reset } from "../../Appstore/Slice/toggleSlice";
import { clearCoverImagegift } from "../../Appstore/Slice/AddImageSliceGift";
import { clearSelectedCategoryGift } from "../../Appstore/Slice/AddGiftCategorySlice";

function Gift() {
    const isSidebarOpen = useSelector((state: any) => state.sidebar.isOpen);
    const dispatch = useAppDispatch();
    const mediaflow = sessionStorage.getItem("mediaflow") || "LOCAL";

    const [category, setCategory] = useState<string>("");
    const [order, setOrder] = useState<string>("");

    const { data, loading, error, postData } = useApiPost();
    const sliceValues = useAppSelector((state) => state.toggle.value);
    const [search, setSearch] = useState("")


    const {
        current_page,
        records_per_page,
    } = useAppSelector(
        (state) => state.PaginationValues.giftPagination || defaultPagination
    );

    const [toggleStates, setToggleStates] = useState<{ [key: number]: boolean }>({});



    // Fetch data
    useEffect(() => {
        const params = {
            page: current_page,
            pageSize: records_per_page,
            ...(category && { sortBy: "createdAt" }),
            ...(order !== null && order !== undefined && {
                orderBy: order === "0" ? "ASC" : "DESC",
            }),
            ...(search && { name: search }), // Add search term as 'name' in the body
        };

        postData("/gift/get-gift", params);
    }, [current_page, records_per_page, category, order, search, sliceValues]);






    // Update pagination state
    useEffect(() => {
        if (data?.data?.Pagination) {
            dispatch(
                setPaginationValues({
                    key: "giftPagination",
                    data: data.data.Pagination,
                })
            );
        }
    }, [data]);

    useEffect(() => {
        if (data?.data?.Records) {
            const toggles = data.data.Records.reduce((acc, gift) => {
                acc[gift.gift_id] = gift.status;
                return acc;
            }, {} as { [key: number]: boolean });
            setToggleStates(toggles);
        }
    }, [data]);



    const { makeRequest } = Apimethod()
    const IS_DEMO = import.meta.env.VITE_IS_DEMO === 'true';

    const handleToggleStatus = async (giftId: number) => {
        if (IS_DEMO) {
            toast.error("This action is disabled in the demo version.");
            return;
        }
        const newStatus = !toggleStates[giftId];
        try {
            await makeRequest(
                "/admin/gift",
                {
                    gift_id: giftId,
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



    const selectedCategories = useAppSelector(
        (state) => state.category.selectedCategory
    );



    console.log("selectedCategoriesmonu", selectedCategories)


    const handalUpdateGift = async (giftId: number) => {
       
        if (mediaflow === "LOCAL") {
            sessionStorage.setItem("giftId", giftId.toString())
            dispatch(showModal("Update_Gift_Modal"))
            dispatch(reset())
        }
        else {
            sessionStorage.setItem("giftId", giftId.toString())
            dispatch(showModal("Update_Gift_ModalS3"))
            dispatch(reset())
        }
    }



    const handleOpenStory = (gift: any) => {
        sessionStorage.setItem("selectedGiftThumbnail", gift.gift_thumbnail);
        dispatch(showModal("Gift_Image_Modal"));
    };




    console.log("mediaflow", mediaflow)

    const handalOpneAddGift = () => {
       

        if (mediaflow === "LOCAL") {
            dispatch(showModal("Add_Gift_Modal"))
            dispatch(clearCoverImagegift());
            dispatch(clearSelectedCategory());
            dispatch(clearSelectedCategoryGift())
            dispatch(reset())

        }
        else {
            dispatch(showModal("Add_Gift_ModalUploadS3"));
            dispatch(clearCoverImagegift());
            dispatch(clearSelectedCategory());
            dispatch(clearSelectedCategoryGift())
            dispatch(reset())
        }
    };










    return (
        <div className={`bg-primary ${isSidebarOpen ? "xl:pl-20" : "xl:pl-72"}`}>
            <SearchBar />
            <div className="px-4 pb-10 xl:px-6">
                <div className="flex justify-between border-t-bordercolor py-3">
                    <h2 className="text-textcolor font-poppins text-xl font-semibold pt-3 ">Gift List</h2>
                    <div className="relative">
                        <div className="absolute flex items-center p-2 transform -translate-y-1/2 left-2 top-1/2">
                            <img src={Search} alt="Search" className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <input
                            type="text"
                            className=" xl:placeholder:text-sm  bg-primary  text-textcolor border border-bordercolor  placeholder:dark:text-tableDarkLarge border-opacity-10 rounded-lg md:w-[250px] w-[180px] py-2 pl-10 placeholder:text-sm placeholder:text-textcolor0004F] focus:outline-none focus:ring-1 focus:ring-gray-600"
                            placeholder="Search by giftname..."
                            onChange={(e) => setSearch(e.target.value)}
                            value={search}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link to="/dashboard">
                            <h3 className="text-[#3A3A3A] font-poppins text-base  font-semibold">Dashboard</h3>
                        </Link>
                        <div className="rounded-full w-1 h-1 bg-[#E0E0E0]"></div>
                        <h3 className="text-[#858585] font-poppins text-base">Gift List</h3>
                    </div>

                    <button
                        className="flex gap-1.5 mr-1 py-2 cursor-pointer place-items-center px-4 font-poppins font-medium text-white rounded-md bggradient"
                        onClick={handalOpneAddGift}
                    >
                        <img src={Add} className="w-4 h-4" />
                        <p className="md:text-sm text-xs">Add Gift</p>
                    </button>
                </div>

                <div className="relative border border-bordercolor rounded-lg mt-8 mx-4 sm:mx-0 overflow-x-auto w-full">
                    <div className="min-w-[1200px]">
                        <div className="flex px-4 py-3 text-left border-b bg-headercolortable border-b-bordercolor sm:pl-8">
                            <div className="w-[10%]"><WithoutSorttableHeader label="S.L" /></div>
                            <div className="w-[14%]"><WithoutSorttableHeader label="GIFT IMAGE" /></div>
                            <div className="w-[14%]"><WithoutSorttableHeader label="GIFT NAME" /></div>
                            <div className="w-[10%]"><WithoutSorttableHeader label="CATEGORY NAME" /></div>
                            <div className="w-[10%]"><WithoutSorttableHeader label="COINS" /></div>
                            <div className="w-[14%]"><SortableHeader title="CREATED DATE/TIME" category={category} order={order} setCategory={setCategory} setOrder={setOrder} /></div>
                            <div className="w-[14%]"><WithoutSorttableHeader label="STATUS" /></div>
                            <div className="w-[14%]"><WithoutSorttableHeader label="ACTIONS" /></div>
                        </div>

                        <div className="relative">
                            {loading && (
                                <div className=" h-[400px] flex items-center justify-center  ">
                                    <img src={Loader} alt="Loading..." className="w-12 h-12" />
                                </div>
                            )}

                            {!loading && data?.data?.Records?.length > 0 ? (
                                data.data.Records.map((gift: any, index: number) => (
                                    <div key={gift.gift_id} className={`  ${index % 2 === 0 ? 'bg-white dark:bg-primary' : 'bg-[#00162e0a] dark:bg-primary'
                                        } flex items-center px-4 py-3 border-b border-b-bordercolor sm:pl-8`}>
                                        <div className="w-[10%] text-sm text-textcolor font-poppins">
                                            {(current_page - 1) * records_per_page + index + 1}
                                        </div>
                                        <div className="w-[14%]">
                                            <div
                                                className="relative w-14 h-14 cursor-pointer"
                                            >
                                                <img
                                                    src={gift.gift_thumbnail}
                                                    className="object-cover rounded-lg w-full h-full"
                                                    alt="Story thumbnail"
                                                />

                                            </div>
                                        </div>
                                        <div className="w-[14%]"><h2 className="font-poppins  text-textcolor text-sm">{gift.name}</h2></div>
                                        <div className="w-[10%]"><h2 className="font-poppins text-textcolor text-sm">{gift.Gift_category?.name}</h2></div>
                                        <div className="w-[10%] relative">
                                            <h2 className="font-poppins top-[-0.5rem]   absolute left-3 text-textcolor text-sm">{gift.gift_value} </h2>
                                        </div>
                                        <div className="w-[14%]"><TableDateTimeDisplay dateString={gift.createdAt} /></div>
                                        <div className="w-[14%]">
                                            <label className="flex items-center cursor-pointer select-none">
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        checked={toggleStates[gift.gift_id] || false}
                                                        onChange={() => handleToggleStatus(gift.gift_id)}
                                                        className="sr-only"
                                                    />
                                                    <div className={`block h-6 w-10 rounded-full border transition duration-300 ${toggleStates[gift.gift_id] ? " border-toggalbtcolorborder bggradient" : "bg-transparent  border  border-toggalbtcolorborder"}`}></div>
                                                    <div className={`absolute top-1 h-4 w-4 rounded-full transition duration-300 ${toggleStates[gift.gift_id] ? "right-1 bg-white" : "left-1 bggradient"}`}></div>
                                                </div>
                                            </label>
                                        </div>
                                        <div className="w-[14%]  flex items-center gap-2">
                                            <button className=" px-[10px] py-[10px] bg-[#D0CCE1]/60 rounded-full  cursor-pointer" onClick={() => handalUpdateGift(gift.gift_id)}>
                                                <img src={EditIcon} alt="Edit" className="w-5 h-4" />
                                            </button>
                                            <TableActionButtons
                                                viewButtonIcon={Eye}
                                                onViewClick={() => handleOpenStory(gift)}
                                                viewButtonColor="#CCE1CD"
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


                    <PaginationComponets paginationKey="giftPagination" />

                </div>
            </div>
        </div>
    );
}

export default Gift;
