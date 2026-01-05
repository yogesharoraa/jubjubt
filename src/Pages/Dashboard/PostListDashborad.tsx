import { Link } from "react-router-dom";
import WithoutSorttableHeader from "../../Componets/TableComponets/WithoutSorttableHeader";
import useApiPost from "../../Hooks/PostData";
import { useEffect } from "react";
import TableDateTimeDisplay from "../../Componets/TableComponets/TableDateTimeDisplay";
import TableUserInfo from "../../Componets/TableComponets/TableUserInfo";
import StoryThumbnail from "../../Componets/TableComponets/StoryThumbnail";
import notfound from "/Images/notfound.png";
import { useAppDispatch } from "../../Hooks/Hooks";
import { showModal } from "../../Appstore/Slice/ModalSlice";


function PostListDashborad() {
    const { data, loading, error, postData } = useApiPost();
    const pageSize = 5;



    useEffect(() => {
        const formData = new FormData();
        formData.append("pageSize", pageSize.toString());
        formData.append("social_type", "reel");
        postData("/admin/get-social-admin", formData);
    }, []);

    const handleUserClick = () => { };


    const dispatch =  useAppDispatch()
    


     const handleOpenStory = (user: any) => {
            sessionStorage.setItem("reelId", user.social_id);
            dispatch(showModal("ReelDetail_Modal"));
        };

    return (
        <div className="border    border-bordercolor rounded-lg overflow-x-auto w-full h-fit  2xl:w-[62%] xl:w-[100%]">
            <div className="xl:overflow-x-auto pb-4 lg:overflow-x-auto 2xl:overflow-hidden min-w-[1200px] md:min-w-[1200px] lg:min-w-[0px] sm:min-w-[0px]">
                <div className="min-w-max">
                    {/* Title and View All */}
                    <div className="flex items-center justify-between px-4 mt-4 mb-4">
                        <h2 className="text-textcolor font-poppins text-base font-semibold">Reel Summary</h2>
                        <Link to="/post-list">
                            <p className="cursor-pointer text-[#484848] text-sm underline font-poppins">View All</p>
                        </Link>
                    </div>

                    {/* Table */}
                    <div className="border    border-bordercolor rounded-lg overflow-x-auto mx-4">
                        {/* Table Header */}
                        <div className="flex px-4 py-2 bg-headercolortable border-b    border-bordercolor text-sm font-medium text-gray-700 whitespace-nowrap">
                            <div className="w-[8%]">
                                <WithoutSorttableHeader label="S.L" />
                            </div>

                            <div className="w-[13%]">
                                <WithoutSorttableHeader label="Reel IMAGE   " />
                            </div>

                            <div className="w-[30%]">
                                <WithoutSorttableHeader label="USERNAME" />
                            </div>

                            <div className="w-[18%]">
                                <WithoutSorttableHeader label="POSTED DATE/TIME" />
                            </div>

                            <div className="w-[12%] ">
                                <WithoutSorttableHeader label="LIKES" />
                            </div>

                            <div className="w-[10%]">
                                <WithoutSorttableHeader label="COMMENTS" />
                            </div>
                        </div>

                        {/* Table Body */}
                        {data?.data?.Records?.length > 0 ? (
                            data.data.Records.map((user: any, index: number) => (
                                <div key={user.user_id} className={`flex items-center px-4 py-3 border-b border-bordercolor text-sm ${index % 2 === 0 ? 'bg-white dark:bg-primary' : 'bg-[#00162e0a] '
                                    } whitespace-nowrap`}>
                                    <div className="w-[8%] text-sm font-poppins text-textcolor ">{index + 1}</div>
                                    <div className=" w-[13%]">
                                        <StoryThumbnail url={user.reel_thumbnail} storyId={user.social_id} onClick={() => handleOpenStory(user)} />
                                    </div>

                                    <div className=" w-[30%] overflow-hidden">
                                        {/* <TableUserInfo
                                            profilePic={user.User.profile_pic}
                                            username={user.User.user_name || "N/A"}
                                            email={user.User.email || "N/A"}
                                            mobile={user.country_code ? `${user.country_code} ${user.mobile || ""}` : "N/A"}
                                            onClick={() => handleUserClick(user)}
                                        /> */}

                                         <TableUserInfo
                                            profilePic={user.User.profile_pic}
                                            username={user.User.user_name || 'N/A'}
                                            email={(user.User.login_type === 'email' || user.User.login_type === 'social') ? user.User.email || '' : ''}
                                            mobile={user.User.login_type === 'phone' ? `${user.User.country_code || ''} ${user.User.mobile_num || ''}`.trim() : ''}
                                            onClick={() => handleUserClick(user)}
                                            loginType={user.User.login_type as 'email' | 'phone' | 'social'}
                                        />
                                    </div>

                                    <div className="w-[18%]">
                                        <TableDateTimeDisplay dateString={user.updatedAt} />
                                    </div>

                                    <div className="w-[12%]">
                                        <p className="truncate text-gray-700  poppins">
                                            {user.total_views} {user.total_views > 1 ? "Views" : "View"}
                                        </p>
                                    </div>

                                    <div className=" w-[10%]  text-textcolor">
                                        {user.total_comments} {user.total_comments > 1 ? "Comments" : "Comment"}
                                    </div>
                                </div>
                            ))
                        ) : !loading ? (
                            <div className='h-[405px]'>
                                <div className="w-full flex flex-col items-center h-full justify-center">
                                    <img
                                        src={notfound}
                                        alt="Not Found"
                                        className="w-1/2 max-h-[30vh] object-contain"
                                    />
                                    <h2 className="font-poppins text-lg text-textcolor  mt-4">
                                        Don't have any data to show
                                    </h2>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PostListDashborad;
