import React, { useEffect, useMemo } from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    Cell,
} from "recharts";
import Cookies from "js-cookie";
import Loader from "/Images/Loader.gif";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import useApiPost from "../../Hooks/PostData";
import SearchBar from "../../Componets/SearchBar/SearchBar";
import UserCountryWisPagination from "../../Componets/PaginationComponets/UserCountryWisPagination";
import { useAppDispatch, useAppSelector } from "../../Hooks/Hooks";
import { setPaginationCountryWiseUserList } from "../../Appstore/Slice/PaginationSlice/UsersByCountryPaginationSlice";
import { useTheme } from "../../Context/ThemeContext";

const COLORS = ["#46BFDA", "#3DD0B7", "#F3CC5C", "#59A7FF"];

interface RootState {
    sidebar: {
        isOpen: boolean;
    };
}

function UsersByCountry() {
    const { loading, data: countryData, error, postData } = useApiPost();
    const dispatch = useAppDispatch();

    const pagination = useAppSelector((state) => state.UsersByCountryPaginationSlice);
    const { current_page, records_per_page } = pagination;
    const theme = useTheme().theme;

    const isSidebarOpen = useSelector((state: RootState) => state.sidebar.isOpen);

    useEffect(() => {
        const formData = new FormData();
        formData.append("page", current_page.toString());
        formData.append("pageSize", records_per_page.toString());
        formData.append("sort_order", "DESC");
        postData("/admin/countrysie-user", formData);
    }, [current_page, records_per_page]);

    useEffect(() => {
        if (countryData?.data?.pagination) {
            dispatch(setPaginationCountryWiseUserList(countryData.data.pagination));
        }
    }, [countryData?.data?.pagination, dispatch]);

    // Filter valid countries and map chart data
    const data = useMemo(() => {
        const records = countryData?.data?.Records || [];
        return records
            .filter((item: any) => item.country?.trim()) // Exclude empty country
            .map((item: any) => ({
                country: item.country,
                users: Number(item.user_count),
            }))
            .sort((a, b) => b.users - a.users);
    }, [countryData]);

    const totalUsers = useMemo(
        () => Number(countryData?.data?.total_users || 1),
        [countryData]
    );

    const chartHeight = Math.max(data.length * 50, 200); 

    if (loading || !countryData) {
        return (
            <div className="border border-bordercolor rounded-lg p-4 w-full h-[440px] flex items-center justify-center">
                <img src={Loader} className="w-12 h-12" alt="Loading..." />
            </div>
        );
    }

    return (
        <div className={`${isSidebarOpen ? "xl:pl-20" : "xl:pl-72"}`}>
            <SearchBar />

            <div className="mx-4 xl:mx-6">
                <div className="flex justify-between border-t-[#F2F2F2] py-3">
                    <h2 className="text-textcolor font-poppins text-xl font-semibold pt-3">
                        Country Wise Users
                    </h2>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link to="/dashboard">
                            <h3 className="text-[#3A3A3A] font-poppins text-base font-semibold">
                                Dashboard
                            </h3>
                        </Link>
                        <div className="rounded-full w-1 h-1 bg-[#E0E0E0]"></div>
                        <h3 className="text-[#858585] font-poppins text-base">
                            Country Wise Users
                        </h3>
                    </div>
                </div>

                <div
                    className="w-full mt-5 border border-bordercolor rounded-lg  py-4"
                    style={{ height: `${chartHeight}px` }}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={data}
                            margin={{ top: 20, right: 50, left: 10, bottom: 20 }}
                            barSize={10}
                        >
                            <XAxis type="number" domain={[0, totalUsers]} hide />
                            <Bar
                                dataKey="users"
                                background={{
                                    fill: theme === "dark" ? "#212020" : "#E5E7EB",
                                }}
                                radius={[10, 10, 10, 10]}
                                label={({ x, y, width, height, value, index }) => {
                                    const item = data[index];
                                    return (
                                        <g>
                                            {/* Country Name - Left aligned */}
                                            <text
                                                x={10}
                                                y={y! + height! / 220 -5}
                                                fontSize="14"
                                                fill="#4B5563"
                                                fontFamily="Poppins"
                                                dominantBaseline="middle"

                                                id="grapppph"
                                            >
                                                {item.country}
                                            </text>

                                            {/* Users label - Right aligned */}
                                            <text
                                                x={x! + width! + 15}
                                                y={y! + height! / 2}
                                                fontSize="12"
                                                fill="#4B5563"
                                                fontFamily="Poppins"
                                                dominantBaseline="middle"
                                                textAnchor="start"
                                            >
                                                {value} Users
                                            </text>

                                            {/* End circle */}
                                            <circle
                                                cx={x! + width!}
                                                cy={y! + height! / 2}
                                                r={6}
                                                fill={COLORS[index % COLORS.length]}
                                                stroke="#fff"
                                                strokeWidth={2}
                                            />
                                        </g>
                                    );
                                }}
                            >
                                {data.map((_, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <UserCountryWisPagination />
            </div>
        </div>
    );
}

export default UsersByCountry;
