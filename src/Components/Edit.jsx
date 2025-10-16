import React, { useState } from "react";
import Input from "../common/Input";
import Button from "../common/Button";
import { expenseService } from "../services/expenseServices";
import { Link } from "react-router-dom";

function Edit() {
  const [date, setDate] = useState("");
  const [dailyItems, setDailyItems] = useState({});
  const [loading, setLoading] = useState(false);
  const [noRecord, setNoRecord] = useState(false);

  const toDDMMYYYY = (iso) => (iso ? iso.split("-").reverse().join("/") : "");

  const handleFetch = async () => {
    if (!date) return alert("Please enter a date");
    setLoading(true);
    setNoRecord(false);
    try {
      const allDailyRecords = await expenseService.getDailyRecords();
      const formattedDate = toDDMMYYYY(date);
      const records = { ...(allDailyRecords.data?.[formattedDate] || {}) };

      const expenseRecords = Object.fromEntries(
        Object.entries(records)
          .filter(([_, item]) => item.category !== "income")
          .map(([key, item]) => [key, { ...item, name: key }])
      );

      if (Object.keys(expenseRecords).length === 0) {
        setNoRecord(true);
        setDailyItems({});
      } else {
        setDailyItems(expenseRecords);
      }
    } catch (err) {
      console.error("Error fetching daily records:", err);
      alert("Error fetching records");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, field, value) => {
    setDailyItems((prev) => {
      const current = prev[key] || { name: "", quantity: "", price: "", total: 0, category: "food" };
      const updatedValue = field === "category" || field === "name" ? value : value === "" ? "" : Number(value);
      const updatedItem = { ...current, [field]: updatedValue };

      if (field === "quantity" || field === "price") {
        updatedItem.total = Number(updatedItem.quantity || 0) * Number(updatedItem.price || 0);
      }

      if (!updatedItem.name) updatedItem.name = current.name || key;
      return { ...prev, [key]: updatedItem };
    });
  };

  const addEmptyField = () => {
    const newKey = `new_${Object.keys(dailyItems).length + 1}`;
    setDailyItems((prev) => ({
      ...prev,
      [newKey]: { name: "", quantity: "", price: "", total: 0, category: "food" },
    }));
  };

  const removeItem = (key) => {
    setDailyItems((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const handleSave = async () => {
    if (!date) return alert("Enter a date first");
    setLoading(true);
    try {
      const res = await expenseService.getDailyRecords();
      const formattedDate = toDDMMYYYY(date);
      const dayData = res.data?.[formattedDate] || {};

      const incomeRecords = Object.fromEntries(
        Object.entries(dayData).filter(([_, item]) => item.category === "income")
      );

      const updatedExpenses = {};

      Object.values(dailyItems).forEach((item) => {
        if (!item.name) return;
        let finalName = item.name;
        let counter = 0;

        while (
          updatedExpenses.hasOwnProperty(finalName) ||
          (dayData.hasOwnProperty(finalName) && dayData[finalName].price !== item.price)
        ) {
          counter++;
          finalName = `${item.name}_${counter}`;
        }

        const { name, ...rest } = item;
        updatedExpenses[finalName] = {
          ...rest,
          quantity: Number(rest.quantity || 0),
          price: Number(rest.price || 0),
          total: Number(rest.quantity || 0) * Number(rest.price || 0),
        };
      });

      const newData = {
        ...res.data,
        [formattedDate]: {
          ...incomeRecords,
          ...updatedExpenses,
        },
      };

      const sortedData = Object.fromEntries(
        Object.entries(newData).sort(
          ([a], [b]) =>
            new Date(a.split("/").reverse().join("-")) - new Date(b.split("/").reverse().join("-"))
        )
      );

      await expenseService.updateDailyRecord("", sortedData);
      alert("Records saved successfully");
      setNoRecord(false);
    } catch (err) {
      console.error("Error saving records:", err);
      alert("Error saving records");
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = Object.values(dailyItems).reduce(
    (sum, item) => sum + Number(item.total || 0),
    0
  );

  return (
    <div className="container rounded shadow-lg py-4 px-3 mt-4 frequent-bg">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="frequent-title mb-0">Edit Daily Expenses</h2>
        <Link to="/budget">
          <button
            className="btn"
            style={{
              backgroundColor: "#456882",
              color: "#fff",
              border: "2px solid #ffffff",
              borderRadius: "8px",
            }}
          >
            Back
          </button>
        </Link>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <Input label="Enter Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Button label="Fetch" onClick={handleFetch} style={{ backgroundColor: "#456882" }} />
      </div>

      <div className="card mb-4 frequent-card position-relative">
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
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        <div className="card-header text-white frequent-card-header" style={{ backgroundColor: "#456882" }}>
          <h4 className="mb-0">Edit Items</h4>
        </div>
        <div className="card-body">
          {!loading && noRecord && <p>No records found. Add new expenses below:</p>}

          {!loading && Object.keys(dailyItems).length === 0 && !noRecord ? (
            <p className="text-muted">No items for this date.</p>
          ) : (
            !loading && (
              <div className="table-responsive">
                <table className="table table-striped table-hover align-middle frequent-table">
                  <thead className="table-dark">
                    <tr>
                      <th>Name</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Category</th>
                      <th>Total</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(dailyItems).map(([key, item]) => (
                      <tr key={key}>
                        <td>
                          <Input label="Name" value={item.name} onChange={(e) => handleChange(key, "name", e.target.value)} />
                        </td>
                        <td>
                          <Input label="Quantity" value={item.quantity} onChange={(e) => handleChange(key, "quantity", e.target.value)} />
                        </td>
                        <td>
                          <Input label="Price" value={item.price} onChange={(e) => handleChange(key, "price", e.target.value)} />
                        </td>
                        <td>
                          <select className="form-control" value={item.category} onChange={(e) => handleChange(key, "category", e.target.value)}>
                            <option value="food">Food & Beverage</option>
                            <option value="travel">Travel</option>
                            <option value="entertainment">Entertainment</option>
                            <option value="others">Others</option>
                          </select>
                        </td>
                        <td className="fw-bold text-success">₹{item.total}</td>
                        <td>
                          <Button label="Remove" onClick={() => removeItem(key)} style={{ backgroundColor: "red", color: "#fff" }} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {!loading && (
            <div className="d-flex gap-2 align-items-center mt-3">
              <Button label="Add Another Item" onClick={addEmptyField} style={{ backgroundColor: "#456882" }} />
              <h4 className="mb-0">Total: ₹{totalAmount}</h4>
              <Button label="Save Changes" onClick={handleSave} style={{ backgroundColor: "#456882" }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Edit;
