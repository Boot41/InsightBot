import { FiPieChart } from "react-icons/fi";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const COLORS = ["#0c8ee7", "#7c3aed", "#f59e0b", "#10b981", "#ef4444"];

const CustomPieChart = ({ data }) => {
  // Transform data.values if they are not objects (e.g., numbers)
  let pieData = [];
  if (data.values && data.values.length > 0) {
    if (typeof data.values[0] === "object") {
      pieData = data.values;
    } else {
      // Convert array of numbers to array of objects with a label and value
      pieData = data.values.map((v, i) => ({
        label: v.toString(), // or you can use a default like `Value ${i + 1}`
        value: v,
      }));
    }
  }

  // Determine the dynamic label key if pieData consists of objects.
  // If it's numbers transformed into objects, it'll use "label".
  const labelKey =
    pieData.length > 0 && typeof pieData[0] === "object"
      ? Object.keys(pieData[0]).find((key) => key !== "value")
      : "label";

  return (
    <div className="card md:col-span-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <FiPieChart className="mr-2 text-secondary-500" />
        {data.xlabel}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ payload, percent }) =>
              `${payload[labelKey]} ${(percent * 100).toFixed(0)}%`
            }
          >
            {pieData.map((entry, index) => (
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
