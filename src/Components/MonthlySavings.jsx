import React, { useEffect, useState } from "react";
import { expenseService } from "../services/expenseServices";
import Button from "../common/Button";
import { Link } from "react-router-dom";

function MonthlySavings() {
  const [dailyRecords, setDailyRecords] = useState({});
  const [monthlySavings, setMonthlySavings] = useState({});
  const [grandSavings, setGrandSavings] = useState(0);

  useEffect(() => {
    async function fetchRecords() {
      try {
        const res = await expenseService.getDailyRecords();
        setDailyRecords(res.data);
      } catch (err) {
        console.error("Error fetching daily records:", err);
      }
    }
    fetchRecords();
  }, []);

  useEffect(() => {
    const tempSavings = {};
    let totalSavings = 0;

    Object.entries(dailyRecords).forEach(([dateStr, items]) => {
      const [day, month, year] = dateStr.split("/").map(Number);
      const monthKey = `${year}-${month.toString().padStart(2, "0")}`;

      if (!tempSavings[monthKey]) tempSavings[monthKey] = { income: 0, expense: 0 };

      Object.values(items).forEach((item) => {
        if (item.category === "income") tempSavings[monthKey].income += item.total;
        else tempSavings[monthKey].expense += item.total;
      });
    });

    Object.entries(tempSavings).forEach(([month, data]) => {
      data.savings = data.income - data.expense;
      totalSavings += data.savings;
    });

    setMonthlySavings(tempSavings);
    setGrandSavings(totalSavings);
  }, [dailyRecords]);

    return (
      <div className="container rounded shadow-lg py-4 px-3 mt-4 frequent-bg">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="frequent-title mb-0">Monthly Savings</h2>
        </div>

        <div className="card frequent-card mb-4">
          <div className="card-header text-white frequent-card-header" style={{ backgroundColor: "#456882" }}>
            <h4 className="mb-0">Monthly Breakdown</h4>
          </div>
          <div className="card-body">
            {Object.entries(monthlySavings).length === 0 ? (
              <p className="text-muted">No records found</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-hover align-middle frequent-table">
                  <thead className="table-dark">
                    <tr>
                      <th>Month</th>
                      <th>Income</th>
                      <th>Expenses</th>
                      <th>Savings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(monthlySavings).map(([month, data]) => (
                      <tr key={month}>
                        <td className="fw-bold">{month}</td>
                        <td className="text-success">₹{data.income}</td>
                        <td className="text-danger">₹{data.expense}</td>
                        <td className={data.savings >= 0 ? "fw-bold text-primary" : "fw-bold text-danger"}>₹{data.savings}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="card frequent-card mb-4">
          <div className="card-header text-white frequent-card-header" style={{ backgroundColor: "#456882" }}>
            <h5 className="mb-0">Summary</h5>
          </div>
          <div className="card-body">
            <p className="fw-bold fs-4 mb-0">
              Total Savings: <span className="text-primary">₹{grandSavings}</span>
            </p>
          </div>
        </div>

        <div className="card frequent-card mb-4">
          <div className="card-header text-white frequent-card-header" style={{ backgroundColor: "#456882" }}>
            <h5 className="mb-0">Navigate</h5>
          </div>
          <div className="card-body d-flex gap-2 flex-wrap">
            <Link to="/budget">
              <Button label="Actual Tracking" className="btn" style={{ backgroundColor: "#456882", color: "#fff", border: "2px solid #ffffff", borderRadius: "8px" }} />
            </Link>
            <Link to="/frequent">
              <Button label="Frequent List" className="btn" style={{ backgroundColor: "#456882", color: "#fff", border: "2px solid #ffffff", borderRadius: "8px" }} />
            </Link>
            <Link to="/daily">
              <Button label="Daily Summary" className="btn" style={{ backgroundColor: "#456882", color: "#fff", border: "2px solid #ffffff", borderRadius: "8px" }} />
            </Link>
            <Link to="/edit">
              <Button label="Edit" className="btn" style={{ backgroundColor: "#456882", color: "#fff", border: "2px solid #ffffff", borderRadius: "8px" }} />
            </Link>
            <Link to="/weeklyMonthy">
              <Button label="Weekly/Monthly Summary" className="btn" style={{ backgroundColor: "#456882", color: "#fff", border: "2px solid #ffffff", borderRadius: "8px" }} />
            </Link>
          </div>
        </div>
      </div>
    );
}

export default MonthlySavings;
