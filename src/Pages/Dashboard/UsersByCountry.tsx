import React, { useEffect } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, Cell } from "recharts";
import { Link } from "react-router-dom";
import { WorldMap } from "react-svg-worldmap";
import { getCode } from "country-list";
import Loader from "/Images/Loader.gif";
import useApiPost from "../../Hooks/PostData";
import { useTheme } from "../../Context/ThemeContext";

const COLORS = ["#46BFDA", "#3DD0B7", "#F3CC5C", "#59A7FF"];

const UsersByCountry = () => {
  const { loading, data: countryData, error, postData } = useApiPost();
  const theme = useTheme().theme


  useEffect(() => {
    const fetchData = async () => {
      try {
        await postData("/admin/countrysie-user", {}); // Adjust endpoint/body as needed
      } catch (err) {
      }
    };

    fetchData();
  }, []);

  const normalizeCountryName = (name: string) => {
    const mapping: Record<string, string> = {
      USA: "United States of America",
      Russia: "Russian Federation",
      UK: "United Kingdom",
      UAE: "United Arab Emirates",
      SouthKorea: "Korea, Republic of",
    };
    return mapping[name?.trim()] || name;
  };

  // Correct country short codes if needed
  const correctedShortNames: Record<string, string> = {
    CANADA: "CA", // Fix Canada code
  };

  // Prepare map data with correct country codes in uppercase
  const mapData =
    countryData?.data?.Records
      ?.map((item: any) => {
        const normalized = normalizeCountryName(item.country || "");
        const correctedCode =
          correctedShortNames[item.country?.toUpperCase() || ""] || item.country_short_name;
        const code = correctedCode || getCode(normalized);
        if (!code) return null;
        return {
          country: code.toUpperCase(), // Use uppercase codes for react-svg-worldmap
          value: Number(item.user_count),
        };
      })
      .filter(Boolean) || [];

  if (loading || !countryData) {
    return (
      <div className="border border-bordercolor rounded-lg p-4 w-full h-[440px] flex items-center justify-center">
        <img src={Loader} className="w-12 h-12" alt="Loading..." />
      </div>
    );
  }

  const totalUsers = Number(countryData?.data?.total_users || 1);

  const data =
    (countryData?.data?.Records?.filter((item: any) => item.country?.trim() !== "")
      .map((item: any) => ({
        country: item.country,
        shortName: item.country_short_name,
        users: Number(item.user_count),
      })) || []).sort((a: any, b: any) => b.users - a.users);


  return (
    <div className="border border-bordercolor p-4 w-full rounded-lg bg-primary xl:w-[100%]">
      <div className="flex items-center justify-between mb-4">
        <h2 className=" text-textcolor font-poppins text-base font-semibold">
          Users by Countries
        </h2>
        <Link to="/country-wise-users">
          <span className="cursor-pointer text-[#484848] text-sm underline font-poppins">
            View All
          </span>
        </Link>
      </div>

      <div className="flex flex-col gap-4 xl:flex-row">
        <div className="overflow-x-auto 2xl:overflow-hidden">
          <div className="w-full  rounded-lg  sm:h-[250px]  relative custom-worldmap">
            <WorldMap
              color="#f9a866"
              value-suffix="users"
              size="lg"
              strokeWidth={2}
              strokeOpacity={50}
              backgroundColor={theme === 'dark' ? '#424242' : '#fff'}

              data={mapData}

            />
          </div>
        </div>

        <div className="w-full my-10 bg-primary rounded-lg xl:w-1/2">
          <div className="items-start gap-6 2xl:flex 2xl:flex-row">
            <div className="w-full h-[150px] mt-5" >
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
                            y={y! + height! / 220 - 5}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersByCountry;
