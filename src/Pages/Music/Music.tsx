import { useSelector } from "react-redux";
import Search from "/Images/search.png";
import SearchBar from "../../Componets/SearchBar/SearchBar";
import { Link } from "react-router-dom";
import WithoutSorttableHeader from "../../Componets/TableComponets/WithoutSorttableHeader";
import useApiPost from "../../Hooks/PostData";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../Hooks/Hooks";
import notfound from "/Images/notfound.png"
import StoryThumbnail from "../../Componets/TableComponets/StoryThumbnail";
import SimpletextTableBody from "../../Componets/TableComponets/SimpletextTableBody";
import Apimethod from "../../Hooks/Apimethod";
import toast from "react-hot-toast";
import MusicListPagination from "../../Componets/PaginationComponets/MusicListPagination";
import { setPaginationMusiclList } from "../../Appstore/Slice/PaginationSlice/MusicListPaginationSlice";
import TableActionButtons from "../../Componets/TableComponets/TableActionButtons";
import EditIcon from "/Images/edit.png";
import Block from "/Images/deleteicon.png";
import { showModal } from "../../Appstore/Slice/ModalSlice";
import Add from "/Images/add.png";
import { reset } from "../../Appstore/Slice/toggleSlice";
import Eye from "/Images/eye.png";

function Music() {


    const mediaflow = sessionStorage.getItem("mediaflow") || "LOCAL";


    const IS_DEMO = import.meta.env.VITE_IS_DEMO === 'true';

    const isSidebarOpen = useSelector((state: any) => state.sidebar.isOpen);
    const { data, loading, postData } = useApiPost();
    const pagination = useAppSelector((state) => state.MusicListPaginationSlice);
    const [toggleStates, setToggleStates] = useState<{ [key: number]: boolean }>({});


    console.log("paginationpaginationmonu", pagination)


    const { current_page, records_per_page } = pagination;
    const dispatch = useAppDispatch()



    const fetchData = () => {
        const formData = new FormData();
        formData.append("page", current_page.toString());
        formData.append("pageSize", records_per_page.toString());
        formData.append("sort_order", "DESC")
        postData("/music/get-music", formData);
    };

    useEffect(() => {
        fetchData();
    }, [current_page, records_per_page,]);

    // ✅ URL replace function
    const replaceUrlToS3 = (url: string) => {
        if (url && url.includes('cloudfront.net')) {
            return url.replace(
                'https://d1yb64k1jgx7ak.cloudfront.net/', 
                'https://reelboost.s3.us-east-1.amazonaws.com/'
            );
        }
        return url;
    };

    const handleOpenStory = (user) => {
    const musicUrl = replaceUrlToS3(user?.music_url);
        sessionStorage.setItem("Musicurl", user?.music_url);

        dispatch(showModal("MusicShow_Modal"));
    }


    useEffect(() => {
        if (data?.data?.Records) {
            const toggles = data.data.Records.reduce((acc, gift) => {
                acc[gift.music_id] = gift.status;
                return acc;
            }, {} as { [key: number]: boolean });
            setToggleStates(toggles);
        }
    }, [data]);



    const isapicall = useAppSelector((state) => state.toggle.value)



    useEffect(() => {
        if (isapicall) {
            fetchData()
        }
    }, [isapicall])




    useEffect(() => {
        if (data?.data?.Pagination) {
            dispatch(setPaginationMusiclList(data.data.Pagination));
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
                "/admin/update-music",
                {
                    music_id: giftId,
                    status: newStatus,
                },
                "application/json",
                "POST"
            );
            setToggleStates((prev) => ({
                ...prev,
                [giftId]: newStatus,
            }));
            toast.success("Music status updated");
        } catch (err) {
            toast.error("Failed to update status");
        }
    };




    const handalUpdateGift = (giftId: number) => {
        

        if (mediaflow === "LOCAL") {
            sessionStorage.setItem("Music_Id_Update", giftId.toString());
            dispatch(showModal("MusicUpdate_Modal"));
            dispatch(reset())
        }
        else {
            sessionStorage.setItem("Music_Id_Update", giftId.toString());
            dispatch(showModal("MusicUpdate_ModalS3"));
            dispatch(reset())
        }
    };




    const handleBlock = (giftId: number) => {

        sessionStorage.setItem("Music_Id_Delete", giftId.toString());
        dispatch(showModal("MusicDelete_Modal"))
        dispatch(reset())
    };



    useEffect(() => {
        const fetchConfig = async () => {
            const res = await makeRequest("/project_conf", null, undefined, "GET");
            if (res) {
                sessionStorage.setItem("mediaflow", res.data?.mediaflow);
            }
        };
        fetchConfig();
    }, []);




    const handalUploadMusic = () => {

        if (mediaflow === "LOCAL") {
            dispatch(showModal("MusicAdd_Modal"))
            dispatch(reset())
        }
        else {
            dispatch(showModal("UploadMusicModalWithS3"));
            dispatch(reset());
        }
    }

    return (
        <div className={`bg-primary ${isSidebarOpen ? "xl:pl-20" : "xl:pl-72"}`}>
            <SearchBar />

            <div className="px-4 pb-10 xl:px-6">
                {/* Header */}
                <div className="flex justify-between border-t-[#F2F2F2] py-3">
                    <h2 className="text-textcolor font-poppins text-xl font-semibold pt-3 ">Music List </h2>
                    <div className="relative">
                        <div className="absolute left-2 top-1/2 flex transform -translate-y-1/2 items-center p-2">
                            <img src={Search} alt="Search" className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <div className=" w-full">
                            <input
                                type="text"
                                placeholder="Search by music name..."
                                className="w-[180px] md:w-[250px] pl-10 py-2 text-sm placeholder:text-placeholdercolor   text-textcolor
              border border-bordercolor border-opacity-10 rounded-lg  bg-inputbgcolor
              focus:outline-none focus:ring-1 focus:ring-gray-600 
              placeholder:dark:text-tableDarkLarge "
                            />
                        </div>
                    </div>
                </div>

                {/* Breadcrumb */}
                <div className="mb-4 flex items-center  flex-col   md:flex-row justify-between gap-2">

                    <div className=" flex  items-center  gap-2">
                        <Link to="/dashboard">
                            <h3 className="text-base font-semibold text-[#3A3A3A]  font-poppins">Dashboard</h3>
                        </Link>
                        <div className="h-1 w-1 rounded-full bg-[#E0E0E0]"></div>
                        <h3 className="text-base text-[#858585] font-poppins">Music List</h3>
                    </div>

                    <button
                        className="flex gap-1.5 mr-1 py-2 cursor-pointer place-items-center px-4 font-poppins font-medium text-white rounded-md bggradient"
                        onClick={handalUploadMusic}
                    >
                        <img src={Add} className="w-4 h-4" />
                        <p className="md:text-sm text-xs">Add Music</p>
                    </button>
                </div>

                {/* Table */}
                <div className="w-full overflow-x-auto rounded-lg border border-bordercolor mt-6">
                    <div className="min-w-[1200px]">
                        {/* Table Header */}
                        <div className="flex bg-headercolortable px-4 py-3 text-left font-medium border-b border-b-bordercolor sm:pl-8">
                            <div className="w-[18%]"><WithoutSorttableHeader label="S.L" /></div>
                            <div className="w-[20%]"><WithoutSorttableHeader label="MUSIC IMAGE" /></div>


                            <div className="w-[30%]">
                                <WithoutSorttableHeader label=" MUSIC TITLE" />
                            </div>
                            <div className="w-[30%]">
                                <WithoutSorttableHeader label="  TOTAL USE" />
                            </div>
                            <div className="w-[30%]">
                                <WithoutSorttableHeader label=" STATUS" />
                            </div>

                            <div className="w-[20%]"><WithoutSorttableHeader label="ACTIONS" /></div>
                        </div>



                        {/* Table Rows */}
                        {data?.data?.Records.length > 0 ? (
                            data?.data?.Records.map((user: any, index: number) => (
                                <div
                                    key={user.music_id}
                                    className={`flex items-center px-4 py-3 border-b border-b-bordercolor   ${index % 2 === 0 ? 'bg-white dark:bg-primary' : 'bg-[#00162e0a] dark:bg-primary'
                                        }  sm:pl-8`}
                                >
                                    <div className="w-[18%] text-sm font-poppins text-textcolor"> {(current_page - 1) * records_per_page + index + 1}</div>

                                    <div className="w-[20%]">
                                        <StoryThumbnail
                                        url={replaceUrlToS3(user.music_thumbnail)}
                                            //url={user.music_thumbnail}
                                            storyId={user.music_id}
                                            onClick={() => handleOpenStory(user)}
                                        />
                                    </div>


                                    <div className=" w-[30%]">
                                        <SimpletextTableBody title={user.music_title} />
                                    </div>


                                    <div className=" w-[30%] flex justify-center relative  items-center">
                                        <div className=" absolute left-[14%]">
                                            <SimpletextTableBody title={user.total_use} />
                                        </div>

                                    </div>

                                    <div className=" w-[30%]">
                                        <label className="flex items-center cursor-pointer select-none">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={toggleStates[user.music_id] || false}
                                                    onChange={() => handleToggleStatus(user.music_id)}
                                                    className="sr-only"
                                                />
                                                <div className={`block h-6 w-10 rounded-full border transition duration-300 ${toggleStates[user.music_id] ? " border-toggalbtcolorborder bggradient" : "bg-transparent  border  border-toggalbtcolorborder"}`}></div>
                                                <div className={`absolute top-1 h-4 w-4 rounded-full transition duration-300 ${toggleStates[user.music_id] ? "right-1 bg-white" : "left-1 bggradient"}`}></div>
                                            </div>
                                        </label>
                                    </div>

                                    <div className=" w-[20%] flex gap-3">
                                        <button className=" py-[9.9px] px-[11px] bg-[#D0CCE1]/60 rounded-full  cursor-pointer" onClick={() => handalUpdateGift(user.music_id)}>
                                            <img src={EditIcon} alt="Edit" className="w-5 h-4" />
                                        </button>
                                        <TableActionButtons
                                            blockButtonIcon={Block}
                                            viewButtonIcon={Eye}

                                            onBlockClick={() => {
                                                handleBlock(user.music_id);
                                            }}

                                            onViewClick={() => {
                                                handleOpenStory(user);
                                            }}
                                            viewButtonColor="#CCE1CD"
                                            blockButtonColor="#FDE4EA"
                                            borderColor="#01D312"

                                        />
                                    </div>


                                </div>
                            ))
                        ) : (
                            !loading && (
                                <div className="p-4 h-[38rem] flex justify-center items-center">
                                    <div className="w-full flex flex-col items-center h-full justify-center">
                                        <img
                                            src={notfound}
                                            alt="Not Found"
                                            className="w-1/2 max-h-[40vh] object-contain"
                                        />
                                        <h2 className="font-poppins text-lg text-textcolor  mt-4">
                                            Don't have any data to show
                                        </h2>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                    <MusicListPagination />
                </div>
            </div>
        </div>
    );
}

export default Music;
