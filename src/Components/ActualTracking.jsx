import React, { useEffect, useState } from "react";
import { expenseService } from "../services/expenseServices";
import { Link, NavLink } from "react-router-dom";
import Input from "../common/Input";
import Button from "../common/Button";
import '../App.css';
import loaderGif from "../assets/loader.gif"

function ActualTracker() {
  const [frequentState, setFrequentState] = useState({});
  const [dailyState, setDailyState] = useState({});
  const [newItem, setNewItem] = useState({ name: "", quantity: "", price: "", category: "" });
  const [income, setIncome] = useState("");
  const [loading, setLoading] = useState(true);

  const today = new Date().toLocaleDateString("en-GB");
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString("en-GB");

  useEffect(() => {
    const fetchAllRecords = async () => {
      setLoading(true);
      try {
        const dailyResponse = await expenseService.getDailyRecords();
        setDailyState(dailyResponse.data);

        const frequentResponse = await expenseService.getFrequentRecords();
        setFrequentState(frequentResponse.data);
      } catch (err) {
        console.error("Error fetching records", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllRecords();
  }, []);

  const handleChange = (itemName, field, value) => {
    setFrequentState((prev) => ({
      ...prev,
      [itemName]: { ...prev[itemName], [field]: value },
    }));
  };

  const handleNewItemChange = (field, value) => {
    setNewItem((prev) => ({ ...prev, [field]: value }));
  };

  const getUniqueKey = (name, price, dailyItems) => {
    let key = name;
    let counter = 1;
    while (dailyItems[key] && dailyItems[key].price !== price) {
      key = `${name}_${counter}`;
      counter++;
    }
    return key;
  };

  const handleAddFrequent = async (itemName) => {
    const itemData = frequentState[itemName];
    const price = Number(itemData.price);
    const dailyItems = dailyState[today] || {};

    const uniqueKey = getUniqueKey(itemName, price, dailyItems);
    const existing = dailyItems[uniqueKey];
    const newQuantity = (existing?.quantity || 0) + Number(itemData.quantity);

    const record = {
      [uniqueKey]: {
        quantity: newQuantity,
        price,
        total: newQuantity * price,
        category: itemData.category,
      },
    };

    try {
      const updatedToday = { ...dailyItems, ...record };
      const updatedData = { ...dailyState, [today]: updatedToday };
      await expenseService.updateDailyRecord("", updatedData);
      setDailyState(updatedData);
    } catch (err) {
      alert("Error adding record");
    }
  };

  const handleAddNewItem = async () => {
    if (!newItem.name || !newItem.quantity || !newItem.price) {
      alert("Please fill all fields");
      return;
    }

    const name = newItem.name;
    const price = Number(newItem.price);
    const dailyItems = dailyState[today] || {};
    const uniqueKey = getUniqueKey(name, price, dailyItems);
    const existing = dailyItems[uniqueKey];
    const newQuantity = (existing?.quantity || 0) + Number(newItem.quantity);

    const record = {
      [uniqueKey]: {
        quantity: newQuantity,
        price,
        total: newQuantity * price,
        category: newItem.category || "misc",
      },
    };

    try {
      const updatedToday = { ...dailyItems, ...record };
      const updatedData = { ...dailyState, [today]: updatedToday };
      await expenseService.updateDailyRecord("", updatedData);
      setDailyState(updatedData);
      setNewItem({ name: "", quantity: "", price: "", category: "" });
    } catch (err) {
      alert("Error adding record", err);
    }
  };

  const handleRemoveFrequent = async (itemName) => {
    const { [itemName]: removed, ...rest } = frequentState;
    try {
      await expenseService.updateFrequentRecord("", rest);
      setFrequentState(rest);
    } catch (err) {
      alert("Error removing frequent item", err);
    }
  };

  const handleRemoveDailyItem = async (itemName) => {
    const { [itemName]: removed, ...rest } = dailyState[today] || {};
    const updatedData = { ...dailyState, [today]: rest };
    try {
      await expenseService.updateDailyRecord("", updatedData);
      setDailyState(updatedData);
    } catch (err) {
      alert("Error removing item", err);
    }
  };

  const handleAddIncome = async () => {
    if (!income) {
      alert("Enter income amount");
      return;
    }

    const firstDayItems = dailyState[firstOfMonth] || {};
    const incomeRecord = {
      income: {
        quantity: 1,
        price: Number(income),
        total: Number(income),
        category: "income",
      },
    };

    const updatedFirstDay = { ...firstDayItems, ...incomeRecord };
    const updatedData = { ...dailyState, [firstOfMonth]: updatedFirstDay };

    try {
      await expenseService.updateDailyRecord("", updatedData);
      setDailyState(updatedData);
      setIncome("");
      alert("Income added successfully!");
    } catch (err) {
      alert("Error adding income", err);
    }
  };

  const dailyItems = dailyState[today] || {};
  const totalAmount = Object.values(dailyItems).reduce(
    (sum, item) => sum + item.total,
    0
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
        <img src={loaderGif} alt="Loading..." />
      </div>
    );
  }

  return (
    <div className="container rounded shadow-lg py-4 px-3 mt-4" style={{ backgroundColor: "#f8f8f821" }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="frequent-title mb-0">Actual Expense Tracking</h2>
        <NavLink to="/frequent" className="btn" style={{ backgroundColor: "#456882", color: "#fff", border: "2px solid #ffffff", borderRadius: "8px" }}>Frequent Items</NavLink>
      </div>

      <div className="card mb-4 frequent-card">
        <div className="card-header text-white frequent-card-header" style={{ backgroundColor: "#456882" }}>
          <h4 className="mb-0">Add Income for 1st of Month ({firstOfMonth})</h4>
        </div>
        <div className="card-body d-flex gap-2 align-items-end">
          <Input
            label="Income Amount"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
          />
          <Button
            label="Add Income"
            onClick={handleAddIncome}
            className="btn"
            style={{ backgroundColor: "#456882", color: "#fff", border: "2px solid #ffffff", borderRadius: "8px" }}
          />
        </div>
      </div>

      {/* Add New Item */}
      <div className="card mb-4 frequent-card">
        <div className="card-header text-white frequent-card-header" style={{ backgroundColor: "#456882" }}>
          <h4 className="mb-0">Add New Item</h4>
        </div>
        <div className="card-body">
          <div className="row align-items-end g-2">
            <div className="col-md-3">
              <Input
                label="Item Name"
                value={newItem.name}
                onChange={(e) => handleNewItemChange("name", e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <Input
                label="Quantity"
                value={newItem.quantity}
                onChange={(e) => handleNewItemChange("quantity", e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <Input
                label="Price"
                value={newItem.price}
                onChange={(e) => handleNewItemChange("price", e.target.value)}
              />
            </div>
            <div className="col-md-2 mb-2">
              <label htmlFor="categoryDropdown" className="form-label">Choose</label>
              <select
                id="categoryDropdown"
                className="form-control"
                value={newItem.category}
                onChange={(e) => handleNewItemChange("category", e.target.value)}
              >
                <option value="">Select Category</option>
                <option value="food">Food & Beverage</option>
                <option value="travel">Travel</option>
                <option value="entertainment">Entertainment</option>
                <option value="others">Others</option>
              </select>
            </div>
            <div className="col-md-2 mb-2">
              <Button label="Add" onClick={handleAddNewItem} className="btn w-100" style={{ backgroundColor: "#456882", color: "#fff", border: "2px solid #ffffff", borderRadius: "8px" }} />
            </div>
          </div>
        </div>
      </div>

      <div className="card frequent-card mb-4">
        <div className="card-header text-white frequent-card-header" style={{ backgroundColor: "#456882" }}>
          <h4 className="mb-0">Frequent Items</h4>
        </div>
        <div className="card-body">
          {Object.entries(frequentState).length === 0 ? (
            <p className="text-muted">No frequent items yet.</p>
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(frequentState).map(([itemName, itemData]) => (
                    <tr key={itemName}>
                      <td className="fw-bold">{itemName}</td>
                      <td>
                        <Input
                          label="Quantity"
                          value={itemData.quantity}
                          onChange={(e) => handleChange(itemName, "quantity", e.target.value)}
                        />
                      </td>
                      <td>
                        <Input
                          label="Price"
                          value={itemData.price}
                          onChange={(e) => handleChange(itemName, "price", e.target.value)}
                        />
                      </td>
                      <td>{itemData.category}</td>
                      <td className="fw-bold text-success">₹{Number(itemData.quantity) * Number(itemData.price)}</td>
                      <td>
                        <Button label="Add" onClick={() => handleAddFrequent(itemName)} className="btn btn-sm" style={{ backgroundColor: "#456882", color: "#fff", border: "2px solid #ffffff", borderRadius: "8px" }} />
                        <Button label="Remove" onClick={() => handleRemoveFrequent(itemName)} className="btn btn-sm ms-1" style={{ backgroundColor: "#ff4d4d", color: "#fff", border: "2px solid #ffffff", borderRadius: "8px" }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="container mt-4 border p-3">
        <h4>Today's Records</h4>
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead className="table-dark">
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(dailyItems).length > 0 ? (
                Object.entries(dailyItems).map(([name, data]) => (
                  <tr key={name}>
                    <td className="fw-bold">{name}</td>
                    <td>{data.category}</td>
                    <td>{data.quantity}</td>
                    <td>₹{data.price}</td>
                    <td className="fw-bold text-success">₹{data.total}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted">No records for today.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <hr />
        <h5>Total: ₹{totalAmount}</h5>
      </div>

      <div className="mt-4">
        <h5 className="text-secondary">Navigate:</h5>
        <div className="d-flex flex-wrap" style={{ gap: "0.75rem", alignItems: "stretch" }}>
          <div style={{ flex: "1 1 180px" }}>
            <Link to="/frequent">
              <Button label="Frequent List" style={{ width: "100%", backgroundColor: "#456882", color: "#fff", border: "2px solid #ffffff", borderRadius: "8px" }} />
            </Link>
          </div>
          <div style={{ flex: "1 1 180px" }}>
            <Link to="/daily">
              <Button label="Daily Summary" style={{ width: "100%", backgroundColor: "#456882", color: "#fff", border: "2px solid #ffffff", borderRadius: "8px" }} />
            </Link>
          </div>
          <div style={{ flex: "1 1 180px" }}>
            <Link to="/edit">
              <Button label="Edit" style={{ width: "100%", backgroundColor: "#456882", color: "#fff", border: "2px solid #ffffff", borderRadius: "8px" }} />
            </Link>
          </div>
          <div style={{ flex: "1 1 180px" }}>
            <Link to="/weeklyMonthy">
              <Button label="Weekly/Monthly Summary" style={{ width: "100%", backgroundColor: "#456882", color: "#fff", border: "2px solid #ffffff", borderRadius: "8px" }} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActualTracker;
