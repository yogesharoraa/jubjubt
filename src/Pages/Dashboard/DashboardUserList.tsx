import { Link, useNavigate } from 'react-router-dom';
import WithoutSorttableHeader from '../../Componets/TableComponets/WithoutSorttableHeader';
import useApiPost from '../../Hooks/PostData';
import { useEffect } from 'react';
import TableUserInfo from '../../Componets/TableComponets/TableUserInfo';
import TableDateTimeDisplay from '../../Componets/TableComponets/TableDateTimeDisplay';
import TableLoginTypeBadge from '../../Componets/TableComponets/TableLoginTypeBadge';
import TableStatusBadge from '../../Componets/TableComponets/TableStatusBadge';
import TableReportCount from '../../Componets/TableComponets/TableReportCount';
import notfound from "/Images/notfound.png";


function DashboardUserList() {
  const { data, loading, error, postData } = useApiPost();
  const pageSize = 5;


  useEffect(() => {
    const formData = new FormData();
    formData.append("pageSize", pageSize.toString());

    postData("/admin/get-user", formData);
  }, []);





  const navigate = useNavigate();


  const handleUserClick = (userId) => {
    navigate(`/user-list/user-profile`);
    sessionStorage.setItem("userIdProfileDetail", userId);
  };


  return (
    <div className="border   border-bordercolor rounded-lg overflow-x-auto w-full h-fit">
      <div className="min-w-[1000px]">
        <div className="py-5">
          {/* Header */}
          <div className="flex items-center justify-between px-4 mb-4">
            <h2 className="text-textcolor font-poppins text-base font-semibold ">
              Latest Users List
            </h2>
            <Link to="/user-list">
              <p className="cursor-pointer text-[#484848] text-sm underline font-poppins">View All</p>

            </Link>
          </div>

          {/* Table */}
          <div className="border border-bordercolor rounded-lg overflow-x-auto mx-4">
            {/* Table Header */}
            <div className="flex px-4 py-2 bg-headercolortable border-b   border-bordercolor text-sm font-medium text-gray-700 whitespace-nowrap">
              <div className="w-1/3"><WithoutSorttableHeader label="USERNAME" /></div>
              <div className="w-1/5"><WithoutSorttableHeader label="CREATED DATE/TIME" /></div>
              <div className="w-[15%]"><WithoutSorttableHeader label="LOGIN TYPE" /></div>
              <div className="w-[15%]"><WithoutSorttableHeader label="ACCOUNT STATUS" /></div>
              <div className="w-[15%]"><WithoutSorttableHeader label="TOTAL REPORTS" /></div>
            </div>

            {/* Table Body */}
            {data?.data?.Records?.length > 0 ? (
              data.data.Records.map((user: any, index: number) => (
                <div
                  key={user.user_id}
                  className={`flex items-center px-4 py-3 border-b border-bordercolor text-sm ${index % 2 === 0 ? 'bg-white dark:bg-primary' : 'bg-[#00162e0a] dark:bg-primary'
                    } whitespace-nowrap`}
                >
                  <div className="w-1/3 overflow-hidden">
                    {/* <TableUserInfo
                      profilePic={user.profile_pic}
                      username={user.user_name || "N/A"}
                      email={(user.login_type === 'email' || user.login_type === 'social') ? user.email || '' : ''}
                      mobile={user.login_type === 'phone' ? `${user.country_code || ''} ${user.mobile_num || ''}`.trim() : ''}
                      loginType={user.login_type as 'email' | 'phone' | 'social'}
                      onClick={() => handleUserClick(user.user_id)}
                    /> */}

                    <TableUserInfo
                      profilePic={user.profile_pic}
                      username={user.user_name || "N/A"}
                      email={(user.login_type === 'email' || user.login_type === 'social') ? user.email || '' : ''}
                      mobile={user.login_type === 'phone' ? `${user.country_code || ''} ${user.mobile_num || ''}`.trim() : ''}
                      loginType={user.login_type as 'email' | 'phone' | 'social'}
                      onClick={() => handleUserClick(user.user_id)}
                    />
                  </div>

                  <div className="w-1/5 pl-3">
                    <TableDateTimeDisplay dateString={user.updatedAt} />
                  </div>

                  <div className="w-[15%] pl-3">
                    <TableLoginTypeBadge loginType={user.login_type} />
                  </div>



                  <div className="w-[15%] pl-6">
                    <TableStatusBadge
                      key={user.user_id}
                      status={user.blocked_by_admin ? "0" : "1"}
                      activeText="Active"
                      deactiveText="Deactive"
                      activeColor="#64A555"
                      activeBg="#D1EADB"
                      deactiveColor="#EF4444"
                      deactiveBg="#FDE4EA"
                    />
                  </div>

                  <div className="w-[15%] relative">
                    <div className=' absolute left-[20%]'>
                      <TableReportCount count={user.reportCounts} />
                    </div>
                  </div>
                </div>
              ))
            ) : !loading ? (
              <div className='h-[370px]'>
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

export default DashboardUserList;
