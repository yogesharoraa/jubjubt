import { TotalSocial } from "../../Appstore/Api/Dashboard/TotalSocial";

function TotalPosts(): JSX.Element {
    const { data: UserData } = TotalSocial();

    const totalUsers = UserData?.data?.total_counts ?? 0;
    const lastMonthUsers = UserData?.data?.lastMonth_Count ?? 0;

    // Properly handle percentage change including edge cases
    let userChange = 0;

    if (lastMonthUsers > 0) {
        userChange = ((totalUsers - lastMonthUsers) / lastMonthUsers) * 100;
    } else if (totalUsers > 0) {
        userChange = 100; // Assume 100% increase if no users last month but some now
    }

    const isDecrease = userChange < 0;

    return (
        <div className="border border-bordercolor  cursor-pointer rounded-lg px-4 py-5">
            <div className="flex justify-between py-1">
                <h2 className="font-poppins text-textcolorsecondary font-semibold text-base">
                    Total Reels
                </h2>
                <h2
                    className={`${isDecrease
                        ? "text-[#EE6D3D] bg-[#FCECD6]"
                        : "text-[#22973F] bg-[#D1F9DB]"
                        } px-5 py-0.5 justify-center rounded-2xl font-medium flex gap-1 place-items-center`}
                >
                    {Math.abs(userChange).toFixed(2)}%

                    {/*  for icon show  */}
                    {/* <span className="pt-0.5">
            {isDecrease ? (
              <svg
                fill="#EE6D3D"
                viewBox="0 0 256 256"
                className="size-3"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M244,128v64a12,12,0,0,1-12,12H168a12,12,0,0,1,0-24h35l-67-67-31.51,31.52a12,12,0,0,1-17,0l-72-72a12,12,0,0,1,17-17L96,119l31.51-31.52a12,12,0,0,1,17,0L220,163V128a12,12,0,0,1,24,0Z" />
              </svg>
            ) : (
              <svg
                fill="#22973F"
                viewBox="0 0 256 256"
                className="size-3"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M244,56v64a12,12,0,0,1-24,0V85l-75.51,75.52a12,12,0,0,1-17,0L96,129,32.49,192.49a12,12,0,0,1-17-17l72-72a12,12,0,0,1,17,0L136,135l67-67H168a12,12,0,0,1,0-24h64A12,12,0,0,1,244,56Z" />
              </svg>
            )}
          </span> */}
                </h2>
            </div>
            <h1 className=" text-textcolor font-poppins text-2xl font-semibold ">
                {totalUsers}
            </h1>
            <p className="text-[#9B9B9B] font-poppins text-sm py-1">
                vs last month:{" "}
                <span className="text-textcolorsecondary font-semibold text-sm ">
                    {lastMonthUsers} Reels
                </span>
            </p>
        </div>
    );
}

export default TotalPosts;
