import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import Calendar from "/Images/bar_calendar.png";
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'; import Loader from "/Images/Loader.gif";
import useApiPost from "../../Hooks/PostData";
import { Fragment } from 'react';
import { useTheme } from "../../Context/ThemeContext";


interface BarGraphData {
  name: string;
  value: number;
  remaining: number;
  color: string;
}

const max = 20;

const monthMap: Record<number, string> = {
  1: "Jan",
  2: "Feb",
  3: "Mar",
  4: "Apr",
  5: "May",
  6: "Jun",
  7: "Jul",
  8: "Aug",
  9: "Sep",
  10: "Oct",
  11: "Nov",
  12: "Dec",
};

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) => {
  if (active && payload && payload.length > 0) {
    const valueData = payload.find((p) => p.dataKey === "value");
    return (
      <div className="px-3 py-2 bg-white border border-gray-200 rounded shadow-sm">
        <p className="text-sm text-gray-700 font-poppins">{label}</p>
        <p className="text-sm font-semibold text-textcolor font-poppins">
          Users: {valueData?.value}
        </p>
      </div>
    );
  }
  return null;
};

function UserGetByYear() {
  const { postData, loading, error } = useApiPost();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<string>(currentYear.toString());
  const [barData, setBarData] = useState<BarGraphData[] | undefined>();
  const theme = useTheme().theme

  const currentMonthNumber = new Date().getMonth() + 1;


  const startYear = 2025;
  const yearOptions = Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => startYear + i
  );

  useEffect(() => {
    const fetchData = async () => {
      const formData = new FormData();
      formData.append("year", year);

      try {
        const response = await postData("/admin/monthly-user-by-year", formData);

        if (
          response.status &&
          response.data &&
          Array.isArray(response.data.monthlyCounts)
        ) {
          const mappedData: BarGraphData[] = response.data.monthlyCounts.map(
            (item: { month: number; count: number }) => ({
              name: monthMap[item.month] || `Month ${item.month}`,
              value: item.count,
              remaining: max - item.count > 0 ? max - item.count : 0,
              color: item.month === currentMonthNumber ? "#00C49F" : "#59A7FF",
            })
          );

          setBarData(mappedData);
        } else {
          setBarData(undefined);
        }
      } catch (err) {
        setBarData(undefined);
      }
    };

    fetchData();
  }, [year, currentMonthNumber]); // no postData dependency here

  if (loading) {
    return (
      <div className="border border-bordercolor rounded-lg p-4 w-full h-[440px] flex items-center justify-center">
        <img src={Loader} className="w-12 h-12" alt="Loading..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-500 rounded-lg p-4 w-full h-[440px] flex items-center justify-center text-red-600">
        Error loading data
      </div>
    );
  }

  if (!barData || barData.length === 0) {
    return (
      <div className="border border-gray-300 rounded-lg p-4 w-full h-[440px] flex items-center justify-center">
        No data available
      </div>
    );
  }

  return (
    <div className="border border-bordercolor rounded-lg p-4 w-full ">
      <div className="overflow-x-auto 2xl:overflow-x-visible">
        <div className=" w-full">
          <div className="flex justify-between items-center">
            <h2 className="text-textcolor font-poppins text-base font-semibold">
              User Growth Summary Graph
            </h2>
            <div className="w-[7rem]">
              <Listbox value={year} onChange={setYear}>
                <div className="relative">
                  <Listbox.Button className="relative w-full cursor-pointer rounded-md border border-bordercolor bg-primary py-2 pl-10 pr-10 text-left text-sm text-textcolor shadow-sm hover:border-gray-400 focus:outline-none focus:ring-1  transition">
                    <img src={Calendar} className="absolute left-2 top-2.5 w-4 h-4" alt="Calendar" />
                    <span>{year}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                      <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </span>
                  </Listbox.Button>

                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-hidden rounded-md  bg-primary   py-1 text-sm shadow-lg ring-1 ring-black/5 focus:outline-none">
                      {yearOptions.map((yr) => (
                        <Listbox.Option
                          key={yr}
                          className={({ active }) =>
                            `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-100 text-[#f9a866]' : ' text-textcolor'
                            }`
                          }
                          value={yr.toString()}
                        >
                          {({ selected }) => (
                            <>
                              <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                {yr}
                              </span>
                              {selected && (
                                <span className="absolute inset-y-0 left-2 flex items-center text-[#f9a866]">
                                  <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                </span>
                              )}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            </div>


          </div>
          <p className="text-[#737373] font-poppins text-sm pb-12">
            Revealing risk and growth in investment
          </p>

          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={barData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="name" />
              <YAxis domain={[0, max]} axisLine={false} />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(0,0,0,0)" }}
              />

              {/* Foreground actual value */}
              <Bar
                dataKey="value"
                stackId="a"
                barSize={20}
                radius={[4, 4, 0, 0]}
              >
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>

              {/* Remaining gray bar */}
              <Bar dataKey="remaining" stackId="a" fill={theme === 'dark' ? '#333333' : '#F0F0F0'} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default UserGetByYear;
