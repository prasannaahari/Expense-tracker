import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

function BarChartReport({ data = [] }) {
  // Expects data: [{ name: string, amount: number }]
  return (
    <div className="card shadow-sm p-4 frequent-card">
      <h5 className="mb-3 frequent-title">Spending by Category</h5>
      {data.length === 0 ? (
        <div className="text-center text-muted">No data to display</div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} barSize={40}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => `₹${value}`} />
            <Bar dataKey="amount" fill="#456882" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default BarChartReport;
