import React, { useEffect, useState, useCallback } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import useApiPost from '../../../Hooks/PostData';
import formatTime from '../../../Hooks/formatTime';
import CommentLike_List_Modal from '../CommentLike_List_Modal';
import Empty from '/Images/user-not-found.gif';

interface Commenter {
  user_name: string;
  full_name: string;
  profile_pic: string;
  country: string;
  user_id: number;
}

interface Reply {
  comment_id: number;
  comment: string;
  createdAt: string;
  like_count: number;
  commenter: Commenter;
}

interface Comment extends Reply {
  reply_count: number;
}

const PAGE_SIZE = 10;

const CommentDetail: React.FC = () => {
  const { data: commentsData, loading: commentsLoading, postData: postComments } = useApiPost();
  const { data: repliesData, loading: repliesLoading, postData: postReplies } = useApiPost();

  const [comments, setComments] = useState<Comment[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [openReplies, setOpenReplies] = useState<Record<number, boolean>>({});
  const [replies, setReplies] = useState<Record<number, Reply[]>>({});
  const [repliesPage, setRepliesPage] = useState<Record<number, number>>({});
  const [hasMoreReplies, setHasMoreReplies] = useState<Record<number, boolean>>({});
  const [loadingReplies, setLoadingReplies] = useState<Record<number, boolean>>({});
  const [openLikeCommentId, setOpenLikeCommentId] = useState<number | null>(null);

  const fetchComments = useCallback(async (pageNumber: number) => {
    const formData = new FormData();
    const reelId = sessionStorage.getItem('reelId') || '';
    formData.append('include', 'User');
    formData.append('social_id', reelId);
    formData.append('page', pageNumber.toString());
    formData.append('limit', PAGE_SIZE.toString());

    try {
      const res = await postComments('/admin/show-comment', formData);
      const fetchedComments: Comment[] = Array.isArray(res?.data?.Records) ? res.data.Records : [];
      setComments(prev => (pageNumber === 1 ? fetchedComments : [...prev, ...fetchedComments]));
      setHasMore(fetchedComments.length === PAGE_SIZE);
    } catch {
      setHasMore(false);
    }
  }, [postComments]);

  useEffect(() => {
    fetchComments(1);
  }, []);

  const fetchMoreComments = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchComments(nextPage);
  };

  const fetchReplies = useCallback(
    async (commentId: number, pageNum = 1) => {
      setLoadingReplies(prev => ({ ...prev, [commentId]: true }));

      const formData = new FormData();
      const reelId = sessionStorage.getItem('reelId') || '';
      formData.append('include', 'User');
      formData.append('comment_ref_id', commentId.toString());
      formData.append('social_id', reelId);
      formData.append('page', pageNum.toString());
      formData.append('limit', PAGE_SIZE.toString());

      try {
        const res = await postReplies('/admin/show-comment', formData);
        const fetchedReplies: Reply[] = Array.isArray(res?.data?.Records) ? res.data.Records : [];

        setReplies(prev => ({
          ...prev,
          [commentId]: pageNum === 1 ? fetchedReplies : [...(prev[commentId] || []), ...fetchedReplies],
        }));
        setRepliesPage(prev => ({ ...prev, [commentId]: pageNum }));
        setHasMoreReplies(prev => ({
          ...prev,
          [commentId]: fetchedReplies.length === PAGE_SIZE,
        }));
      } catch {
        setHasMoreReplies(prev => ({ ...prev, [commentId]: false }));
      } finally {
        setLoadingReplies(prev => ({ ...prev, [commentId]: false }));
      }
    },
    [postReplies]
  );

  const toggleReplies = useCallback(
    async (commentId: number) => {
      const isOpen = openReplies[commentId];
      setOpenReplies(prev => ({ ...prev, [commentId]: !isOpen }));

      if (!isOpen && !replies[commentId]) {
        await fetchReplies(commentId, 1);
      }
    },
    [openReplies, replies, fetchReplies]
  );

  const loadMoreReplies = (commentId: number) => {
    const nextPage = (repliesPage[commentId] || 1) + 1;
    fetchReplies(commentId, nextPage);
  };

  const handleOpenUserProfile = useCallback((userId: number) => {
  }, []);

  return (
    <div className="flex-1 px-5 py-4 overflow-y-auto" id="scrollableDiv" style={{ height: '80vh', overflow: 'auto' }}>
      {comments.length === 0 && !commentsLoading ? (
        <div className="py-48 text-center">
          <img src={Empty} className="w-12 h-12 mx-auto" alt="No comments" />
          <p className="text-Relldetailscrencolordate font-poppins text-base">No Comment</p>
        </div>
      ) : (
        <InfiniteScroll
          dataLength={comments.length}
          next={fetchMoreComments}
          hasMore={hasMore}
          loader={<p className="text-center mt-4">Loading comments...</p>}
          endMessage={<p className="text-center mt-4 text-Relldetailscrencolordate">No more comments.</p>}
          scrollableTarget="scrollableDiv"
        >
          {comments.map(comment => (
            <div key={comment.comment_id} className="py-4 border-b border-bordercolor">
              <div className="flex">
                <img
                  src={comment.commenter.profile_pic}
                  alt={`${comment.commenter.user_name} profile`}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1 px-3">
                  <h2
                    className="font-semibold   text-textcolor  cursor-pointer"
                    onClick={() => handleOpenUserProfile(comment.commenter.user_id)}
                  >
                    {comment.commenter.user_name} 
                  </h2>
                  <p className="text-sm  text-textcolor">{comment.comment}</p>
                  <div className="flex items-center gap-4 text-xs text-Relldetailscrencolor mt-1 relative">
                    <span>{formatTime(comment.createdAt)}</span>
                    <span
                      className="text-textcolor cursor-pointer"
                      onClick={() => setOpenLikeCommentId(comment.comment_id)}
                    >
                      {comment.like_count} Like{comment.like_count !== 1 ? 's' : ''}
                    </span>

                    {openLikeCommentId === comment.comment_id && (
                      <div className="absolute left-0 z-10 mt-2 top-full">
                        <CommentLike_List_Modal
                          onClose={() => setOpenLikeCommentId(null)}
                          commentId={comment.comment_id}
                        />
                      </div>
                    )}
                  </div>

                  {comment.reply_count > 0 && (
                    <div className="flex items-center px-4 pt-2 space-x-2">
                      <hr className="border-[#656565] w-[35px]" />
                      <button
                        className="text-sm text-[#656565] cursor-pointer"
                        onClick={() => toggleReplies(comment.comment_id)}
                        disabled={loadingReplies[comment.comment_id]}
                      >
                        {openReplies[comment.comment_id]
                          ? 'Hide Replies'
                          : `View Replies (${comment.reply_count})`}
                      </button>
                      <hr className="border-[#656565] w-[35px]" />
                    </div>
                  )}

                  {openReplies[comment.comment_id] && (
                    <div className="pl-5 mt-3 border-l-2 border-gray-300" id={`replyScroll-${comment.comment_id}`} style={{ maxHeight: '250px', overflow: 'auto' }}>
                      {loadingReplies[comment.comment_id] && !(replies[comment.comment_id]?.length) ? (
                        <p className="text-gray-500 text-sm">Loading replies...</p>
                      ) : replies[comment.comment_id]?.length ? (
                        <InfiniteScroll
                          dataLength={replies[comment.comment_id].length}
                          next={() => loadMoreReplies(comment.comment_id)}
                          hasMore={hasMoreReplies[comment.comment_id] ?? false}
                          loader={<p className="text-sm text-gray-400">Loading more replies...</p>}
                          endMessage={<p className="text-xs text-gray-400">No more replies.</p>}
                          scrollableTarget={`replyScroll-${comment.comment_id}`}
                        >
                          {replies[comment.comment_id].map(reply => (
                            <div key={reply.comment_id} className="mb-3 relative">
                              <div className="flex items-center gap-2">
                                <img
                                  src={reply.commenter.profile_pic}
                                  alt={`${reply.commenter.user_name} profile`}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                                <h3
                                  className="text-xs font-semibold cursor-pointer"
                                  onClick={() => handleOpenUserProfile(reply.commenter.user_id)}
                                >
                                  {reply.commenter.user_name}
                                </h3>
                                <span className="text-xs text-gray-400">{formatTime(reply.createdAt)}</span>
                              </div>
                              <p className="text-sm ml-8">{reply.comment}</p>
                              <p
                                className="text-xs ml-8 text-textcolor cursor-pointer"
                                onClick={() => setOpenLikeCommentId(reply.comment_id)}
                              >
                                {reply.like_count} like{reply.like_count !== 1 ? 's' : ''}
                              </p>

                              {openLikeCommentId === reply.comment_id && (
                                <div className="absolute left-0 z-10 mt-2 cursor-pointer top-full">
                                  <CommentLike_List_Modal
                                    onClose={() => setOpenLikeCommentId(null)}
                                    commentId={reply.comment_id}
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </InfiniteScroll>
                      ) : (
                        <p className="text-gray-500 text-sm">No replies found.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </InfiniteScroll>
      )}
    </div>
  );
};

export default CommentDetail;
