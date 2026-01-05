import React, { useEffect, useState } from 'react';
import useApiPost from '../../../Hooks/PostData';
import Empty from '/Images/user-not-found.gif';
import InfiniteScroll from 'react-infinite-scroll-component';

interface Like {
  User: {
    user_id: number;
    user_name: string;
    profile_pic: string;
  };
}

function LikeDetail() {
  const { data, loading, postData } = useApiPost();

  const [likes, setLikes] = useState<Like[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchData = async (pageNumber: number) => {
    const formData = new FormData();
    const reelId = sessionStorage.getItem("reelId") || "";
    formData.append("include", "User");
    formData.append("social_id", reelId);
    formData.append("page", pageNumber.toString()); // Assuming API supports pagination by page

    const response = await postData("/admin/like-list", formData);

    const newLikes: Like[] = response?.data?.Records || [];

    if (pageNumber === 1) {
      setLikes(newLikes);
    } else {
      setLikes((prevLikes) => [...prevLikes, ...newLikes]);
    }

    // If fewer likes returned than expected, stop fetching more
    if (!newLikes.length) {
      setHasMore(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, []);

  const fetchMoreData = () => {
    const nextPage = page + 1;
    fetchData(nextPage);
    setPage(nextPage);
  };

  const handleOpenUserProfile = (userId: number) => {
  };

  return (
    <div className="py-6 overflow-y-auto" id="scrollableDiv" style={{ height: '70vh', overflow: 'auto' }}>
      {likes.length > 0 ? (
        <InfiniteScroll
          dataLength={likes.length}
          next={fetchMoreData}
          hasMore={hasMore}
          loader={<p className="text-center">Loading more likes...</p>}
          scrollableTarget="scrollableDiv"
          endMessage={
            <p className="text-center text-paginationtextcolor">
              <b>No more likes</b>
            </p>
          }
        >
          {likes.map((like, index) => (
            <div
              key={index}
              className="flex items-center border-b border-[#EFEFEF] dark:border-b-[#1F1F1F] justify-between p-2 rounded-md cursor-pointer light:hover:bg-gray-100"
            >
              <div className="flex px-4">
                <img
                  src={
                    like.User.profile_pic ||
                    "https://plus.unsplash.com/premium_photo-1677870728110-3b3b41677a9b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  }
                  alt={like.User.user_name}
                  className="w-12 h-12 mr-3 rounded-full"
                />
                <div className="flex flex-col justify-center py-2 text-left">
                  <p
                    className="font-poppins text-textcolor text-sm font-semibold cursor-pointer "
                    onClick={() => handleOpenUserProfile(like.User.user_id)}
                  >
                    {like.User.user_name}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </InfiniteScroll>
      ) : (
        !loading && (
          <div className="py-48 text-center">
            <img src={Empty} className="w-12 h-12 mx-auto" />
            <p className="text-Relldetailscrencolordate font-poppins text-base">No Likes</p>
          </div>
        )
      )}
    </div>
  );
}

export default LikeDetail;
