import React, { useEffect, useState } from "react";
import { expenseService } from "../services/expenseServices";
import Button from "../common/Button";
import { Link } from "react-router-dom";
import loaderGif from "../assets/loader.gif"; 

function WeeklyMonthlySummary() {
  const [dailyRecords, setDailyRecords] = useState({});
  const [summary, setSummary] = useState({});
  const [title, setTitle] = useState("");
  const [grandTotal, setGrandTotal] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [income, setIncome] = useState(0);
  const [balance, setBalance] = useState(0);
  const [lastMonthSavings, setLastMonthSavings] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchRecords() {
      setLoading(true);
      try {
        const res = await expenseService.getDailyRecords();
        setDailyRecords(res.data);

        const today = new Date();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = today;

        let totalExpenses = 0;
        let monthIncome = 0;

        Object.entries(res.data).forEach(([dateStr, items]) => {
          const [day, month, year] = dateStr.split("/").map(Number);
          const recordDate = new Date(year, month - 1, day);

          if (recordDate >= monthStart && recordDate <= monthEnd) {
            Object.values(items).forEach((item) => {
              if (item.category === "income") monthIncome += item.total;
              else totalExpenses += item.total;
            });
          }
        });

        setIncome(monthIncome);
        setBalance(monthIncome - totalExpenses);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchRecords();
  }, []);

  const formatDateToDDMMYYYY = (dateStr) => {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  const calculateSummary = (rangeTitle, customStart, customEnd) => {
    setLoading(true);
    setTimeout(() => { 
      const mergedItems = {};
      let total = 0;

      Object.entries(dailyRecords).forEach(([dateStr, items]) => {
        const [day, month, year] = dateStr.split("/").map(Number);
        const recordDate = new Date(year, month - 1, day);

        if (recordDate >= customStart && recordDate <= customEnd) {
          Object.entries(items).forEach(([key, item]) => {
            if (item.category === "income") return;

            const baseName = key.split("_")[0];
            if (!mergedItems[baseName]) mergedItems[baseName] = { ...item };
            else {
              mergedItems[baseName].quantity += item.quantity;
              mergedItems[baseName].total += item.total;
            }
          });
        }
      });

      const categorySummary = {};
      Object.entries(mergedItems).forEach(([name, item]) => {
        if (!categorySummary[item.category]) categorySummary[item.category] = {};
        categorySummary[item.category][name] = {
          quantity: item.quantity,
          total: item.total,
        };
        total += item.total;
      });

      setSummary(categorySummary);
      setGrandTotal(total);
      setTitle(rangeTitle);

      // Last month savings
      const today = new Date();
      const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

      if (
        customStart.getTime() === lastMonthStart.getTime() &&
        customEnd.getTime() === lastMonthEnd.getTime()
      ) {
        let incomeLastMonth = 0;
        let expensesLastMonth = 0;

        Object.entries(dailyRecords).forEach(([dateStr, items]) => {
          const [day, month, year] = dateStr.split("/").map(Number);
          const recordDate = new Date(year, month - 1, day);
          if (recordDate >= lastMonthStart && recordDate <= lastMonthEnd) {
            Object.values(items).forEach((item) => {
              if (item.category === "income") incomeLastMonth += item.total;
              else expensesLastMonth += item.total;
            });
          }
        });

        setLastMonthSavings(incomeLastMonth - expensesLastMonth);
      } else {
        setLastMonthSavings(null);
      }

      setLoading(false);
    }, 300);
  };

  const handleThisWeek = () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay());
    const end = new Date(today);
    end.setDate(today.getDate() + (6 - today.getDay()));
    calculateSummary("This Week's Summary", start, end);
  };

  const handleThisMonth = () => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    calculateSummary("This Month's Summary", start, end);
  };

  const handleCustom = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const formattedStart = formatDateToDDMMYYYY(startDate);
      const formattedEnd = formatDateToDDMMYYYY(endDate);
      calculateSummary(
        `Custom Summary (${formattedStart} to ${formattedEnd})`,
        start,
        end
      );
    }
  };

  return (
    <div className="container rounded shadow-lg py-4 px-3 mt-4 frequent-bg position-relative">
      {loading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(255,255,255,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10,
          }}
        >
          <img src={loaderGif} alt="Loading..." style={{ width: 80, height: 80 }} />
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="frequent-title mb-0">Weekly/Monthly Summary</h2>
      </div>

      <div className="card mb-4 frequent-card">
        <div className="card-header text-white frequent-card-header" style={{ backgroundColor: "#456882" }}>
          <h4 className="mb-0">Current Month Overview</h4>
        </div>
        <div className="card-body">
          <h5 className="text-success">Income: ₹{income}</h5>
          <h5 className="text-danger">Balance: ₹{balance}</h5>
          {lastMonthSavings !== null && (
            <h5 className="text-warning">Last Month's Savings: ₹{lastMonthSavings}</h5>
          )}
        </div>
      </div>

      <div className="card mb-4 frequent-card">
        <div className="card-header text-white frequent-card-header" style={{ backgroundColor: "#456882" }}>
          <h4 className="mb-0">Get Summary</h4>
        </div>
        <div className="card-body d-flex flex-wrap gap-2 align-items-end">
          <Button label="This Week" onClick={handleThisWeek} className="btn" style={{ backgroundColor: "#456882", color: "#fff", border: "2px solid #ffffff", borderRadius: "8px" }} />
          <Button label="This Month" onClick={handleThisMonth} className="btn ms-2" style={{ backgroundColor: "#456882", color: "#fff", border: "2px solid #ffffff", borderRadius: "8px" }} />
          <label className="form-label ms-3 mb-0">Custom Range:</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="form-control ms-2" style={{ maxWidth: 180 }} />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="form-control ms-2" style={{ maxWidth: 180 }} />
          <Button label="Get Summary" onClick={handleCustom} className="btn ms-2" style={{ backgroundColor: "#456882", color: "#fff", border: "2px solid #ffffff", borderRadius: "8px" }} />
        </div>
      </div>

      {title && (
        <div className="card mb-4 frequent-card">
          <div className="card-header text-white frequent-card-header" style={{ backgroundColor: "#456882" }}>
            <h4 className="mb-0">{title}</h4>
          </div>
          <div className="card-body">
            {Object.entries(summary).map(([category, items]) => {
              const categoryTotal = Object.values(items).reduce((sum, item) => sum + item.total, 0);
              return (
                <div key={category} className="mb-2">
                  <h5 className="text-info">{category}</h5>
                  <ul className="list-group mb-2">
                    {Object.entries(items).map(([name, data]) => (
                      <li key={name} className="list-group-item d-flex justify-content-between">
                        <span>{name} (Qty: {data.quantity})</span>
                        <span>₹{data.total}</span>
                      </li>
                    ))}
                    <li className="list-group-item d-flex justify-content-between fw-bold">
                      <span>{category} Total</span>
                      <span>₹{categoryTotal}</span>
                    </li>
                  </ul>
                </div>
              );
            })}
            <h5 className="text-danger mt-3">Grand Total: ₹{grandTotal}</h5>
          </div>
        </div>
      )}

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
          <Link to="/savings">
            <Button label="Savings" className="btn" style={{ backgroundColor: "#456882", color: "#fff", border: "2px solid #ffffff", borderRadius: "8px" }} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default WeeklyMonthlySummary;
