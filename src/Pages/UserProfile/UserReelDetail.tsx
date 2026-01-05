import React, { useEffect, useState } from 'react';
import useApiPost from '../../Hooks/PostData';
import ShimmerEffect from '../../Componets/ShimmerEffect';
import ReelIcon from '/Images/reel_icon.png';
import MultiplePostIcon from '/Images/multiple_post_icon.png';
import { useAppDispatch } from '../../Hooks/Hooks';
import { showModal } from '../../Appstore/Slice/ModalSlice';
import notfound from "/Images/notfound.png";
import InfiniteScroll from 'react-infinite-scroll-component';
import { setReel } from '../../Appstore/Slice/ReelDetailSlice';

function UserReelDetail() {
    const { loading, postData , data } = useApiPost();
    const dispatch = useAppDispatch();
    const user_id = sessionStorage.getItem("userIdProfileDetail");

    const [records, setRecords] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [initialLoading, setInitialLoading] = useState(true);

    const fetchData = async (pageNum: number) => {
        const formData = new FormData();
        formData.append("user_id", user_id ?? "");
        formData.append("social_type", "reel");
        formData.append("page", String(pageNum));
        formData.append("pageSize", "8");

        const response = await postData("/admin/get-social-admin", formData);

        const newRecords = response?.data?.Records || [];
        const totalPages = response?.data?.Pagination?.total_pages || 1;

        setRecords(prev => {
            const existingIds = new Set(prev.map(item => item.social_id));
            const filteredNew = newRecords.filter(item => !existingIds.has(item.social_id));
            return [...prev, ...filteredNew];
        });

        setHasMore(pageNum < totalPages);
        setInitialLoading(false);
    };

    useEffect(() => {
        fetchData(1);
    }, []);

    const fetchMoreData = () => {
        if (!hasMore) return;
        const nextPage = page + 1;
        setPage(nextPage);
        fetchData(nextPage);
    };

    const handleOpenReel = (item: any) => {
        dispatch(showModal("ReelDetail_Modal"));
        sessionStorage.setItem("reelId", item.social_id);
    };

    useEffect(() => {
        if (data?.data?.Pagination) {
            dispatch(setReel(data?.data?.Pagination?.total_records));
        }
    }, [data?.data?.Pagination]);

    return (
        <>
            {initialLoading ? (
                <div className="grid grid-cols-4 gap-2 py-4 px-36">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="w-full h-80">
                            <ShimmerEffect />
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    {records.length > 0 ? (
                        <InfiniteScroll
                            dataLength={records.length}
                            next={fetchMoreData}
                            hasMore={hasMore}
                            loader={
                                <div className="grid grid-cols-4 gap-2 py-4 px-36">
                                    {Array.from({ length: 4 }).map((_, index) => (
                                        <div key={index} className="w-full h-80">
                                            <ShimmerEffect />
                                        </div>
                                    ))}
                                </div>
                            }
                            endMessage={
                                <p className="text-center text-gray-400 mt-4">No more records</p>
                            }
                        >
                            <div className="grid    md:grid-cols-2  xl:grid-cols-4 gap-2   px-6 py-4 xl:px-36">
                                {records.map((item: any, index: number) => {
                                    const isReel = item.social_type === 'reel';
                                    const mediaArray = item.Media || [];
                                    const mediaType = isReel ? 'video' : 'image';
                                    const mediaUrl = isReel
                                        ? item.reel_thumbnail
                                        : mediaArray[0]?.media_location;

                                    return (
                                        <div key={index} className="relative overflow-hidden cursor-pointer">
                                            {mediaType === 'video' ? (
                                                <video
                                                    className="object-cover w-full transition-all duration-300 cursor-pointer h-80 hover:scale-110"
                                                    src={mediaArray[0]?.media_location}
                                                    poster={item.reel_thumbnail}
                                                    muted
                                                    loop
                                                    autoPlay
                                                    onClick={() => handleOpenReel(item)}
                                                />
                                            ) : (
                                                <div className="relative w-full overflow-hidden cursor-pointer h-80">
                                                    <img
                                                        src={mediaUrl}
                                                        alt="media"
                                                        className="object-cover w-full transition-all duration-300 h-80 hover:scale-110"
                                                        onClick={() => handleOpenReel(item)}
                                                    />
                                                </div>
                                            )}
                                            <div className="absolute flex space-x-1 text-white top-2 right-2 drop-shadow-md">
                                                {mediaType === 'video' ? (
                                                    <img src={ReelIcon} className="w-7 h-7" />
                                                ) : (
                                                    <img src={MultiplePostIcon} className="w-5 h-5" />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </InfiniteScroll>
                    ) : (
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
                    )}
                </>
            )}
        </>
    );
}

export default UserReelDetail;
