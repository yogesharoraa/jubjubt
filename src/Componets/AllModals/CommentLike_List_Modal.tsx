import Vector from '/Images/vectorLike.png';
import Empty from '/Images/empty.png';
import useApiPost from '../../Hooks/PostData';
import { useEffect } from 'react';

interface CommentLikeListModalProps {
  onClose: () => void;
  commentId: number;
}

const CommentLike_List_Modal = ({ onClose, commentId }: CommentLikeListModalProps) => {
  const { data, loading, postData } = useApiPost();

  const fetchData = () => {
    if (!commentId) return;
    const formData = new FormData();
    formData.append('comment_id', String(commentId));
    formData.append('include', 'User');
    postData('/admin/like-list', formData);
  };

  useEffect(() => {
    fetchData();
  }, [commentId]);

  const handleOpenUserProfile = (userId: number) => {
    // Add navigation/modal logic here
  };

  const CommentLikeList =
    data?.data?.Records?.map((record: any) => {
      const user = record?.User;
      return {
        user_id: user?.user_id,
        username: user?.user_name || 'Unknown',
        profile_pic: user?.profile_pic || '',
      };
    }) || [];

  const getProfilePic = (url: string) => {
    return url && url.trim() !== '' ? url : '/assets/default_user.png';
  };

  return (
    <div className="relative py-6 text-center bg-white shadow-lg w-80 rounded-xl">
      {/* Arrow pointer */}
      <div className="absolute -top-5 left-6 w-0 h-0 border-l-[20px] border-r-[20px] border-b-[20px] border-l-transparent border-r-transparent border-b-white"></div>

      {/* Close button */}
      <button
        className="absolute text-sm top-2 right-2 text-[#1B191F] rounded-full px-3 py-1"
        onClick={onClose}
      >
        ✕
      </button>

      {/* Header */}
      <div className="items-center justify-center mb-4">
        <p className="font-bold text-base text-center font-gilroy_semibold text-textcolor">
          Like
        </p>
        <img src={Vector} className="w-8 mx-auto" alt="vector" />
      </div>

      {/* Likes List */}
      {!loading && CommentLikeList.length > 0 ? (
        <div className="px-6 space-y-2 max-h-72 overflow-y-auto">
          {CommentLikeList.map((like) => (
            <div
              key={like.user_id}
              className="flex items-center border-b border-[#EFEFEF] justify-between p-2 rounded-md cursor-pointer hover:bg-gray-100"
            >
              <div className="flex items-center">
                <img
                  src={getProfilePic(like.profile_pic)}
                  alt={like.username}
                  className="mr-3 rounded-full w-14 h-14 object-cover"
                />
                <div className="flex flex-col justify-center">
                  <p
                    className="font-poppins text-textcolor text-sm font-semibold cursor-pointer"
                    onClick={() => handleOpenUserProfile(like.user_id)}
                  >
                    {like.username}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !loading ? (
        <div className="py-12 text-center">
          <img src={Empty} className="w-12 h-12 mx-auto" alt="empty" />
          <p className="text-[#B4B4B4] font-poppins text-base">No Likes</p>
        </div>
      ) : (
        <div className="py-12 text-center text-gray-400 font-poppins">Loading...</div>
      )}
    </div>
  );
};

export default CommentLike_List_Modal;
