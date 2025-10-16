import React, { useEffect, useState } from "react";
import { expenseService } from "../services/expenseServices";
import { Link } from "react-router-dom";
import loaderGif from "../assets/loader.gif"; 

function DailySummary({ date = new Date().toLocaleDateString("en-GB") }) {
  const [summary, setSummary] = useState({});
  const [items, setItems] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      setLoading(true);
      try {
        const allDailyRecords = await expenseService.getDailyRecords();
        const dailyItems = allDailyRecords.data[date] || {};
        setItems(dailyItems);

        const categorySummary = {};
        Object.entries(dailyItems).forEach(([name, item]) => {
          if (!categorySummary[item.category])
            categorySummary[item.category] = {};
          categorySummary[item.category][name] = {
            quantity: item.quantity,
            price: item.price,
            total: item.total,
          };
        });

        setSummary(categorySummary);
      } catch (error) {
        console.error("Error fetching daily summary:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, [date]);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "60vh" }}
      >
        <img src={loaderGif} alt="Loading..." />
      </div>
    );
  }

  const totalAmount = Object.values(items).reduce(
    (sum, item) => sum + item.total,
    0
  );

  return (
    <div className="container rounded shadow-lg py-4 px-3 mt-4 frequent-bg">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="frequent-title mb-0">Daily Summary ({date})</h2>
        <Link to="/weeklyMonthy">
          <button
            className="btn"
            style={{
              backgroundColor: "#456882",
              color: "#fff",
              border: "2px solid #ffffff",
              borderRadius: "8px",
            }}
          >
            Weekly/Monthly Summary
          </button>
        </Link>
      </div>

      {/* Today's Items */}
      <div className="card frequent-card mb-4">
        <div
          className="card-header text-white frequent-card-header"
          style={{ backgroundColor: "#456882" }}
        >
          <h4 className="mb-0">Today's Items</h4>
        </div>
        <div className="card-body">
          {Object.keys(items).length === 0 ? (
            <p className="text-muted">No items for today.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle frequent-table">
                <thead className="table-dark">
                  <tr>
                    <th>Name</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Category</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(items).map(([name, item]) => (
                    <tr key={name}>
                      <td className="fw-bold">{name}</td>
                      <td>{item.quantity}</td>
                      <td>₹{item.price}</td>
                      <td>{item.category}</td>
                      <td className="fw-bold text-success">₹{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="card frequent-card mb-4">
        <div
          className="card-header text-white frequent-card-header"
          style={{ backgroundColor: "#456882" }}
        >
          <h5 className="mb-0">Category Summary</h5>
        </div>
        <div className="card-body">
          {Object.entries(summary).length === 0 ? (
            <p className="text-muted">No items for today.</p>
          ) : (
            <ul className="list-group mb-3">
              {Object.entries(summary).map(([category, items]) => {
                const categoryTotal = Object.values(items).reduce(
                  (sum, item) => sum + item.total,
                  0
                );
                return (
                  <li
                    key={category}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>{category}</strong>
                    </div>
                    <div>
                      {Object.entries(items).map(([name, item]) => (
                        <span key={name} className="me-3">
                          {name} (Qty: {item.quantity}, ₹{item.price})
                        </span>
                      ))}
                      | <span className="fw-bold">Total: ₹{categoryTotal}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="fw-bold fs-4 mb-0">
            Grand Total: <span className="text-primary">₹{totalAmount}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default DailySummary;
