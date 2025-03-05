import { FiTrendingUp } from "react-icons/fi";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const CustomLineChart = ({ data }) => {
  // Transform data into recharts format
  const chartData = data.xvalues.map((x, index) => ({
    xLabel: x,
    yValue: data.yvalues[index],
  }));

  return (
    <div className="card md:col-span-10">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <FiTrendingUp className="mr-2 text-primary-500" />
        {`${data.xlabel} vs ${data.ylabel}`}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="xLabel" label={{ value: data.xlabel, position: "bottom" }} />
          <YAxis label={{ value: data.ylabel, angle: -90, position: "left" }} />
          <Tooltip 
            formatter={(value) => [value, data.ylabel]} 
            labelFormatter={(label) => label} 
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="yValue" 
            stroke="#7c3aed" 
            activeDot={{ r: 8 }} 
            connectNulls  // This prop connects the line across null values
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomLineChart;
