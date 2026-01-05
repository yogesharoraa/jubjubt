import React, { useEffect, useState } from 'react'
import Search from '/Images/search.png';
import { useDispatch, useSelector } from 'react-redux';
import SearchBar from '../../Componets/SearchBar/SearchBar';
import { Link } from 'react-router-dom';
import useApiPost from '../../Hooks/PostData';
import { useAppSelector } from '../../Hooks/Hooks';
import WithoutSorttableHeader from '../../Componets/TableComponets/WithoutSorttableHeader';
import SortableHeader from '../../Componets/TableComponets/SortableHeader';
import { setPaginationHastaglList } from '../../Appstore/Slice/PaginationSlice/HashtagPaginationSlice';
import HashtagPagination from '../../Componets/PaginationComponets/HashtagPagination';
import notfound from "/Images/notfound.png"
import Add from "/Images/add.png"
import { showModal } from '../../Appstore/Slice/ModalSlice';
import { reset } from '../../Appstore/Slice/toggleSlice';
import toast from 'react-hot-toast';


function HashtagList() {
    const isSidebarOpen = useSelector((state: any) => state.sidebar.isOpen);

    const dispatch = useDispatch()

    const { data, loading, postData, error } = useApiPost()
    const [category, setCategory] = useState<string>('');
    const [order, setOrder] = useState<string>('');
    const [postList, setPostList] = useState<any[]>([]);
    const [search, setSearch] = useState("")



    console.log("postListpostList@@@!~", postList)




    const pagination = useAppSelector((state) => state.HashtagPaginationSlice);

    const { current_page, records_per_page } = pagination;

    // Fetch post data on load
    useEffect(() => {
        const formData = new FormData();
        formData.append("page", current_page.toString());
        formData.append("pageSize", records_per_page.toString());
        if (search.trim() !== "") {
            formData.append("hashtag_name", search.trim());
        }

        // if (category === "HASHTAG WORD") {
        //     formData.append("sortBy", "hashtag_name");
        // }
        // if (category === "REEL COUNT") {
        //     formData.append("sortBy", "counts");
        // }
        // if (order !== null && order !== undefined) {
        //     const sortOrder = order === "0" ? "ASC" : "DESC";
        //     formData.append("sort_order", sortOrder);
        // }

        // formData.append("add_social", "true")

        postData("/hashtag/get-hashtags", formData);
    }, [current_page, records_per_page, search, category, order]);




    const isapicall = useAppSelector((state) => state.toggle.value)



    useEffect(() => {

        if (isapicall) {
            const formData = new FormData();
            postData("/hashtag/get-hashtags", formData);
        }

    }, [isapicall])

    // Update post list on data fetch
    useEffect(() => {
        if (data?.data?.Records) {
            setPostList(data.data.Records);
        }
    }, [data]);



    // Update pagination state
    useEffect(() => {
        if (data?.data?.Pagination) {
            dispatch(setPaginationHastaglList(data.data.Pagination));
        }
    }, [data, dispatch]);




    const handaladdHashtag = () => {
       
        dispatch(showModal("AddHashtagModal"))
        dispatch(reset())
    }


    return (
        <div className={`bg-primary ${isSidebarOpen ? 'xl:pl-20' : 'xl:pl-72'}`}>
            <SearchBar />

            <div className="px-4 pb-10 xl:px-6">
                {/* Header */}
                <div className="flex justify-between border-t-[#F2F2F2] py-3">
                    <h2 className="text-textcolor font-poppins text-xl font-semibold pt-3 ">
                        Hashtag List
                    </h2>
                    <div className="relative">
                        <div className="absolute left-2 top-1/2 flex transform -translate-y-1/2 items-center p-2">
                            <img src={Search} alt="Search" className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by Hashtag Word..."
                            className="w-[180px] md:w-[250px] pl-10 py-2 text-sm placeholder:text-placeholdercolor  text-textcolor
              border border-bordercolor border-opacity-10 rounded-lg bg-[#00000005] 
              focus:outline-none focus:ring-1 focus:ring-gray-600 
              placeholder:dark:text-tableDarkLarge "

                            onChange={(e) => setSearch(e.target.value)}
                            value={search}
                        />
                    </div>
                </div>

                {/* Breadcrumb */}
                <div className="mb-4  w-full  justify-between flex items-center gap-2">
                    <div className=' flex  gap-2  items-center'>
                        <Link to="/dashboard">
                            <h3 className="text-base font-semibold text-[#3A3A3A]  font-poppins">Dashboard</h3>
                        </Link>
                        <div className="h-1 w-1 rounded-full bg-[#E0E0E0]"></div>
                        <h3 className="text-base text-[#858585] font-poppins">Hashtag List</h3>
                    </div>


                    <button
                        className="flex gap-1.5 mr-1 py-2 cursor-pointer place-items-center px-4 font-poppins font-medium text-white rounded-md bggradient"
                        onClick={handaladdHashtag}
                    >
                        <img src={Add} className="w-4 h-4" />
                        <p className="md:text-sm text-xs">Add Hashtag</p>
                    </button>
                </div>
                <div className="w-full overflow-x-auto rounded-lg border border-bordercolor mt-6">
                    <div className="min-w-[1200px]">
                        {/* Table Header */}
                        <div className="flex  bg-headercolortable px-4 py-3 text-left font-medium border-b w-full border-bordercolor sm:pl-8">
                            <div className="w-[20%]">
                                <WithoutSorttableHeader label="S.L" />
                            </div>
                            <div className="w-[50%]">
                                <SortableHeader
                                    title="HASHTAG WORD"
                                    category={category}
                                    order={order}
                                    setCategory={setCategory}
                                    setOrder={setOrder}
                                />
                            </div>
                            <div className="w-[30%]">
                                <SortableHeader
                                    title="REEL COUNT"
                                    category={category}
                                    order={order}
                                    setCategory={setCategory}
                                    setOrder={setOrder}
                                />
                            </div>
                        </div>

                        {/* Table Rows */}
                        {postList.length > 0 ? (
                            postList.map((user: any, index: number) => (
                                <div
                                    key={user.social_id}
                                    className={`flex items-center px-4 py-3 border-b border-b-bordercolor     ${index % 2 === 0 ? 'bg-white dark:bg-primary' : 'bg-[#00162e0a] dark:bg-primary'
                                        } sm:pl-8`}
                                >
                                    <div className="w-[20%] text-sm font-poppins text-textcolor "> {(current_page - 1) * records_per_page + index + 1}</div>
                                    <div className="w-[50%] text-sm font-poppins text-textcolor ml-6">#{user.hashtag_name}</div>
                                    <div className="w-[30%] text-sm font-poppins text-textcolor relative  items-center ">
                                        <div className=' absolute top-[-0.5rem]  left-[8%]'>
                                            {user.total_socials}
                                        </div>


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
                                        <h2 className="font-poppins text-lg text-textcolor mt-4">
                                            Don't have any data to show
                                        </h2>
                                    </div>
                                </div>
                            )
                        )}
                    </div>

                    <HashtagPagination />
                </div>



            </div>
        </div>
    )
}

export default HashtagList
