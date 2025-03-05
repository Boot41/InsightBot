import { FiBarChart2 } from "react-icons/fi";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const CustomBarChart = ({ data }) => {
  // Transform data into recharts format
  const chartData = data.xvalues.map((x, index) => ({
    xLabel: x,
    yValue: data.yvalues[index],
  }));

  return (
      <div className="card md:col-span-3">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FiBarChart2 className="mr-2 text-primary-500" />
          {`${data.xlabel} vs ${data.ylabel}`}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="xLabel" label={{ value: data.xlabel, position: "bottom" }} />
            <YAxis label={{ value: data.ylabel, angle: -90, position: "left" }} />
            <Tooltip 
              formatter={(value) => [value, data.ylabel]} 
              labelFormatter={(label) => label} 
            />
            <Bar dataKey="yValue" fill="#0c8ee7" />
          </BarChart>
        </ResponsiveContainer>
      </div>
  );
};

export default CustomBarChart;
