import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import WithoutSorttableHeader from '../../Componets/TableComponets/WithoutSorttableHeader'
import useApiPost from '../../Hooks/PostData'
import notfound from "/Images/notfound.png";


function HashtagList() {

    const { data, postData, loading, error } = useApiPost()


    console.log("datadatadatadata!@!" ,data)


    const pageSize = 9;


    // 1st Effect: Fetch users when pagination changes
    useEffect(() => {
        const formData = new FormData();
        formData.append("pageSize", pageSize.toString());
        formData.append("add_social" ,"true")
        postData("/hashtag/get-hashtags", formData);
    }, []);
    return (
        <div className="border   border-bordercolor rounded-lg overflow-x-auto 2xl:w-[38%] h-fit xl:w-[100%]">
            <div className='xl:overflow-x-auto lg:overflow-x-auto 2xl:overflow-hidden min-w-[1200px]  sm:min-w-[0px]'>
                <div className='min-w-max'>
                    {/* Title and View All */}
                    <div className="flex items-center justify-between px-4 mt-4 mb-4">
                        <h2 className="text-textcolor font-poppins text-base font-semibold ">Popular Hashtags</h2>
                        <Link to="/hashtag-list"><p className="cursor-pointer text-[#484848] text-sm underline font-poppins">View All</p></Link>
                    </div>


                    {/* Table */}
                    <div className="border   border-bordercolor rounded-lg overflow-x-auto mx-4 mb-4 ">
                        {/* Table Header */}
                        <div className="flex px-4 py-2 bg-headercolortable border-b   border-bordercolor text-sm font-medium text-gray-700 whitespace-nowrap">
                            <div className=' w-[25%]'>
                                <WithoutSorttableHeader label="S.L" />
                            </div>
                            <div className=' w-[50%]'>
                                <WithoutSorttableHeader label="HASHTAG WORD " />
                            </div>


                            <div className=' w-[40%]'>
                                <WithoutSorttableHeader label="REEL COUNT " />
                            </div>
                        </div>

                        {/* Table Body */}
                        {data?.data?.Records?.length > 0 ? (
                            data.data.Records.map((user: any, index: number) => (
                                <div key={user.user_id} className={`flex items-center px-4 py-3 border-b border-bordercolor text-sm ${index % 2 === 0 ? 'bg-white dark:bg-primary' : 'bg-[#00162e0a] dark:bg-primary'
                                    } whitespace-nowrap`}>
                                    <div className="w-[25%] text-sm font-poppins  text-textcolor">{index + 1}</div>
                                    <div className="w-[50%] text-sm font-poppins text-textcolor pl-4 line-clamp-1">#{user.hashtag_name}</div>
                                    <div className="w-[40%] text-sm font-poppins text-textcolor pl-4">{user.total_socials}</div>

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
    )
}

export default HashtagList
