"use client";
import Image from "next/image";
import React from "react";
import { AiOutlineEye } from "react-icons/ai";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useLiveApi } from "../store/api/LiveReels";
import { LiveList, LiveRecord } from "../types/LiveReels";
import VideoPlayer from "../components/VideoPlayer";
import { useAppDispatch } from "../utils/hooks";
import { showModal } from "../store/Slice/ModalsSlice";
import { setSelectedLive, setLiveData } from "../store/Slice/LiveSlice";

function Live() {
  const dispatch = useAppDispatch();
  const { fetchLive } = useLiveApi();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery<LiveList, Error>({
      queryKey: ["liveReels"],
      queryFn: ({ pageParam }) => fetchLive(pageParam as number),
      getNextPageParam: (lastPage) => {
        const currentPage = lastPage.data.Pagination.current_page;
        const totalPages = lastPage.data.Pagination.total_pages;
        return currentPage < totalPages ? currentPage + 1 : undefined;
      },
      initialPageParam: 1, // ✅ required in v5
    });

  // flatten pages
  const live: LiveRecord[] =
    data?.pages.flatMap((page) => page.data.Records) || [];

  // infinite scroll
  React.useEffect(() => {
    const handleScroll = () => {
      const bottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
      if (bottom && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const ShimmerCard = () => (
    <div className="animate-pulse bg-gray-300 h-[250px] w-full rounded-lg" />
  );

  return (
    <div>
      <h2 className="px-4 text-xl text-dark font-semibold 2xl:pt-8 pt-3">
        Live
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 p-4">
        {isLoading ? (
          // Render 8 shimmer cards
          Array.from({ length: 8 }).map((_, idx) => <ShimmerCard key={idx} />)
        ) : live.length === 0 ? (
          <div className="flex flex-col gap-3 justify-center items-center sm:py-56 py-36 w-full col-span-full">
            <Image
              src="/ReelBoost/NoLive.png"
              alt="No live available"
              className="object-contain"
              height={80}
              width={80}
            />
            <p className="text-sm font-semibold text-dark">No Live</p>
          </div>
        ) : (
          live.map((item, idx) => (
            <div
              key={idx}
              className="relative rounded-lg overflow-hidden h-[250px] bg-dark"
            >
              <div
                className="cursor-pointer"
                onClick={() => {
                  dispatch(setSelectedLive(item));
                  dispatch(
                    setLiveData({
                      socket_room_id: item.socket_room_id,
                      user_id: item.Live_hosts[0].user_id,
                    })
                  );
                  dispatch(showModal("LivePopup"));
                }}
              >
                <VideoPlayer
                  src={item.Live_hosts[0].peer_id}
                  autoPlay
                  muted
                  controls={false}
                />
              </div>

              {/* Profile Info */}
              <div className="flex gap-1 items-center absolute bottom-3 left-3 z-20">
                <div className="w-8 h-8 rounded-full overflow-hidden shadow-md">
                  <Image
                    src={item.Live_hosts[0]?.User.profile_pic}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="object-cover w-full h-full"
                  />
                </div>
                <p className="text-sm font-semibold text-primary px-2 py-0.5 rounded-lg">
                  {item.Live_hosts[0]?.User.user_name}
                </p>
              </div>

              {/* Likes + Views */}
              <div className="flex gap-2 rounded-l-md py-1 px-2 absolute top-2 right-0 bg-dark/70 z-20">
                <div className="flex gap-1 items-center">
                  <Image
                    src="/SidebarIcons/heart.png"
                    alt="heart"
                    width={12}
                    height={12}
                  />
                  <p className="font-medium text-primary text-[10px]">
                    {item.likes}
                  </p>
                </div>
                <div className="flex gap-1 items-center">
                  <AiOutlineEye className="w-4 h-4" />
                  <p className="font-medium text-primary text-[10px]">
                    {item.total_viewers}
                  </p>
                </div>
              </div>

              {/* Live Badge */}
              <div className="bg-red absolute top-2 left-2 py-1 px-4 text-primary font-medium text-[10px] rounded-md z-20">
                Live
              </div>
            </div>
          ))
        )}
      </div>

      {/* Optional bottom loader when fetching more */}
      {isFetchingNextPage && (
        <div className="text-center py-4 text-gray-500 text-sm">
          Loading more...
        </div>
      )}
    </div>
  );
}

export default Live;
