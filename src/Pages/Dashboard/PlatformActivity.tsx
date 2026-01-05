import React from "react";
import {
  ResponsiveContainer,
  Pie,
  PieChart,
  Cell,
  LabelList,
} from "recharts";
import Loader from "/Images/Loader.gif";
import { UsegetPlatformActivity } from "../../Appstore/Api/Dashboard/UsegetPlatformActivity";

interface RawPlatformData {
  platform: string;
  count: number;
}

const PlatformActivity: React.FC = () => {
  // Added a third color for iOS to cover all 3 platforms
  const COLORS = ["#29CCB1", "#34B3F1", "#FFAA00"];

  const { data: responseData, isLoading } = UsegetPlatformActivity();

  // Process platform data
  let data: { name: string; value: number; percent: number }[] = [];

  if (responseData?.data && Array.isArray(responseData.data)) {
    const platformData: RawPlatformData[] = responseData.data;

    const total = platformData.reduce((sum, p) => sum + p.count, 0);

    if (total > 0) {
      data = platformData.map((p) => ({
        name: `Login by ${p.platform.charAt(0).toUpperCase() + p.platform.slice(1)}`,
        value: p.count,
        percent: Number(((p.count / total) * 100).toFixed(0)),
      }));
    }
  }

  if (isLoading || data.length === 0) {
    return (
      <div className="border border-bordercolor rounded-lg p-4 w-[60%] h-[440px] flex items-center justify-center">
        <img src={Loader} className="w-12 h-12" alt="Loading..." />
      </div>
    );
  }

  return (
    <div className="border border-bordercolor p-4 2xl:w-[50%] rounded-lg">
      <h2 className=" text-textcolor font-poppins text-base font-semibold">
        Platform Activity
      </h2>

      <div className="relative flex">
        <ResponsiveContainer height={240} width="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="90%"
              startAngle={180}
              endAngle={0}
              innerRadius={80}
              outerRadius={100}
              dataKey="value"
              paddingAngle={2}
              label={({ percent }) => `${(percent * 1).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
              {/* <LabelList
                dataKey="percent"
                position="outside"
                fill="#484848"
                style={{ fontSize: 12, fontFamily: "Poppins" }}
              /> */}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute text-center transform -translate-x-1/2 bottom-7 left-1/2">
          <h2 className="text-textcolor text-xl font-semibold font-poppins">
            100%
          </h2>
          <p className="text-textcolor text-sm font-medium font-poppins">
            Completed
          </p>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 24 }}>
        {data.map((entry, index) => (
          <div
            key={index}
            style={{ display: "flex", alignItems: "flex-start", gap: 8 }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                backgroundColor: COLORS[index % COLORS.length],
                marginTop: 4,
              }}
            />
            <div className="flex flex-col items-start">
              <span className="font-poppins text-Relldetailscrencolordate text-sm">
                {entry.name}
              </span>
              <span className="text-Relldetailscrencolordate font-poppins text-sm">
                {entry.percent}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlatformActivity;
