import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#456882", "#0d6efd", "#ffc107", "#dc3545", "#20c997", "#6f42c1"];

function PieChartReport({ data = [] }) {
  // Expects data: [{ name: string, value: number }]
  return (
    <div className="card shadow-sm p-4 frequent-card">
      <h5 className="mb-3 frequent-title">Expense Distribution</h5>
      {data.length === 0 ? (
        <div className="text-center text-muted">No data to display</div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `₹${value}`} />
            <Legend formatter={(value) => `${value}`} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default PieChartReport;
