import { PieChart, ResponsiveContainer, Pie, Cell } from 'recharts';
import Loader from '/Images/Loader.gif';
import { UseLogintype } from '../../Appstore/Api/Dashboard/UseLogintype';

const COLORS = ['#D77960', '#6956E5', '#E6B47B'];

interface PieChartData {
  name: string;
  value: number;
  percent: number;
}

function LoginType(): JSX.Element {
  const { data, isLoading } = UseLogintype();

  const total =
    (data?.data.email_count || 0) +
    (data?.data.phone_count || 0) +
    (data?.data.social_count || 0);

  const getPercent = (count: number) =>
    total > 0 ? parseFloat(((count / total) * 100).toFixed(1)) : 0;

  const chartData: PieChartData[] = [
    {
      name: 'Email',
      value: data?.data.email_count || 0,
      percent: getPercent(data?.data.email_count || 0),
    },
    {
      name: 'Phone',
      value: data?.data.phone_count || 0,
      percent: getPercent(data?.data.phone_count || 0),
    },
    {
      name: 'Social Login',
      value: data?.data.social_count || 0,
      percent: getPercent(data?.data.social_count || 0),
    },
  ];

  if (isLoading || !data) {
    return (
      <div className="border border-bordercolor rounded-lg p-4 w-full h-[440px] flex items-center justify-center">
        <img src={Loader} className="w-12 h-12" alt="Loading..." />
      </div>
    );
  }

  return (
    <div className="border border-bordercolor p-4 w-full  h-fit 2xl:w-[45%] rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="  text-textcolor text-base font-semibold font-poppins">User by Login</h2>
      </div>

      {/* Pie Chart */}
      <div className="w-full h-[300px] md:h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              <filter id="pie-shadow" x="-20%" y="-20%" width="200%" height="200%">
                <feDropShadow dx="0" dy="4" stdDeviation="10" floodColor="#452B7A" floodOpacity="0.2" />
              </filter>
            </defs>
            <Pie
              data={chartData}
              innerRadius={75}
              outerRadius={110}
              paddingAngle={2}
              dataKey="value"
              label={({ percent }) => `${(percent * 1).toFixed(1)}%`}
              filter="url(#pie-shadow)"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Legend */}
      <div className="grid items-center justify-center grid-cols-2 gap-4 mt-6 md:flex-row sm:flex sm:flex-col lg:flex-row lg:flex 2xl:flex-row lg:gap-10">
        {chartData.map((entry, index) => (
          <div key={index} className="flex items-start gap-2">
            <div
              style={{
                width: 14,
                height: 14,
                backgroundColor: COLORS[index],
                marginTop: 4,
              }}
            />
            <div className="flex flex-col items-start">
              <span className="font-poppins text-Relldetailscrencolordate text-sm">{entry.name}</span>
              <span className="text-[#484848] font-poppins text-sm">{entry.percent}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LoginType;
