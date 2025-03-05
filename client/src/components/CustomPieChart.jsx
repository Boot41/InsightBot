import { FiPieChart } from "react-icons/fi";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const COLORS = ["#0c8ee7", "#7c3aed", "#f59e0b", "#10b981", "#ef4444"];

const CustomPieChart = ({ data }) => {
  return (
    <div className="card md:col-span-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <FiPieChart className="mr-2 text-secondary-500" />
        {data.xlabel}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data.values}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.values.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomPieChart;
