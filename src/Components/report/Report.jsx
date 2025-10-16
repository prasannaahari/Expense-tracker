import React, { useEffect, useState, useCallback } from "react";
import BarChartReport from "./Charts/BarChartReport";
import PieChartReport from "./Charts/PieChartReport";
import { expenseService } from "../../services/expenseServices";

const Report = () => {
  const [dailyData, setDailyData] = useState({});
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await expenseService.getDailyRecords();
      setDailyData(res.data || {});
    } catch (err) {
      console.error("Failed to fetch daily records", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 10000);
    return () => clearInterval(id);
  }, [fetchData]);

  const parseEnGB = (s) => {
    if (!s) return null;
    const parts = s.split("/");
    if (parts.length !== 3) return null;
    const [d, m, y] = parts.map((p) => Number(p));
    return new Date(y, m - 1, d);
  };

  const flattenExpenses = (range = null) => {
    const entries = [];
    Object.entries(dailyData).forEach(([date, items]) => {
      if (!items || typeof items !== "object") return;
      const dateObj = parseEnGB(date);
      if (range) {
        const { from, to } = range;
        if (from && dateObj < from) return;
        if (to && dateObj > to) return;
      }
      Object.entries(items).forEach(([key, val]) => {
        if (val && val.total && val.category && val.category !== "income") {
          entries.push({ name: key, category: val.category, amount: Number(val.total), date });
        }
      });
    });
    return entries;
  };

  const computeTotalIncome = (range = null) => {
    let income = 0;
    Object.entries(dailyData).forEach(([date, items]) => {
      if (!items || typeof items !== "object") return;
      const dateObj = parseEnGB(date);
      if (range) {
        const { from, to } = range;
        if (from && dateObj < from) return;
        if (to && dateObj > to) return;
      }
      Object.entries(items).forEach(([key, val]) => {
        if (val && val.total && val.category === "income") {
          income += Number(val.total) || 0;
        }
      });
    });
    return income;
  };

  const [filteredEntries, setFilteredEntries] = useState([]);

  useEffect(() => {
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    setFilteredEntries(flattenExpenses(from || to ? { from, to } : null));
  }, [dailyData, fromDate, toDate]);

  const entries = filteredEntries;

  const getMonthKey = (d) => `${d.getFullYear()}-${d.getMonth() + 1}`;

  const selectedMonth = (() => {
    if (fromDate) return getMonthKey(new Date(fromDate));
    if (toDate) return getMonthKey(new Date(toDate));
    const now = new Date();
    return getMonthKey(now);
  })();

  const monthlyExpenses = entries.filter((e) => {
    const dateObj = parseEnGB(e.date);
    if (!dateObj) return false;
    return getMonthKey(dateObj) === selectedMonth;
  });

  const categoryMap = entries.reduce((acc, e) => {
    const cat = e.category || "Others";
    acc[cat] = (acc[cat] || 0) + e.amount;
    return acc;
  }, {});

  const categoryData = Object.entries(categoryMap).map(([name, amount]) => ({ name, amount }));
  const pieData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  const categories = Object.entries(categoryMap);
  const highest = categories.length ? categories.reduce((a, b) => (a[1] > b[1] ? a : b))[0] : "-";
  const lowest = categories.length ? categories.reduce((a, b) => (a[1] < b[1] ? a : b))[0] : "-";
  const days = Object.keys(dailyData).length || 1;
  const totalSpend = entries.reduce((s, e) => s + e.amount, 0);
  const avgDaily = Math.round(totalSpend / days);
  const totalIncome = computeTotalIncome(fromDate || toDate ? { from: fromDate ? new Date(fromDate) : null, to: toDate ? new Date(toDate) : null } : null);
  const net = totalIncome - totalSpend;

  const insights = [
    { title: "Total Income", value: `₹${totalIncome}`, color: "text-success" },
    { title: "Total Spend", value: `₹${totalSpend}`, color: "text-danger" },
    { title: "Net Balance", value: `₹${net}`, color: net >= 0 ? "text-success" : "text-danger" },
  ];

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center">
        <h2 className="frequent-title mb-4">📊 Expense Reports</h2>
        <div className="d-flex gap-2 align-items-center">
          <label className="mb-0 me-1">From</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="form-control form-control-sm" />
          <label className="mb-0 mx-1">To</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="form-control form-control-sm" />
          <button className="btn btn-sm ms-2" onClick={() => { fetchData(); }} disabled={loading} style={{ backgroundColor: "#456882", color: "#fff" }}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button className="btn btn-sm btn-secondary ms-1" onClick={() => { setFromDate(""); setToDate(""); }}>
            Reset
          </button>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <PieChartReport data={pieData} />
        </div>
        <div className="col-md-6">
          <BarChartReport data={categoryData} />
        </div>
      </div>

      <div className="row g-4 mt-4">
        <div className="col-12">
          <div className="card shadow-sm p-4 frequent-card">
            <h5 className="mb-3 frequent-title">Monthly Expenses</h5>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Amount (₹)</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {monthlyExpenses.map((item, index) => (
                  <tr key={`${item.name}-${index}`}>
                    <td>{index + 1}</td>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>{item.amount}</td>
                    <td>{item.date}</td>
                  </tr>
                ))}
                {monthlyExpenses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-muted">No expenses available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="row g-4 mt-4">
        {insights.map((insight, index) => (
          <div className="col-md-4" key={index}>
            <div className="card shadow-sm text-center p-4 frequent-card">
              <h6>{insight.title}</h6>
              <h2 className={`fw-bold mt-3 ${insight.color}`}>{insight.value}</h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Report;
