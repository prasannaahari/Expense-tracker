import React, { useEffect, useState } from "react";
import { expenseService } from "../services/expenseServices";
import { useNavigate } from "react-router-dom";
import Input from "../common/Input";
import Button from "../common/Button";
import '../App.css';
import loaderGif from "../assets/loader.gif"; 

function FrequentList() {
  const [frequentState, setFrequentState] = useState({});
  const [newItem, setNewItem] = useState({ name: "", quantity: "", price: "", category: "" });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate("/budget"); 
  };

  useEffect(() => {
    const fetchFrequentRecords = async () => {
      setLoading(true);
      try {
        const response = await expenseService.getFrequentRecords();
        setFrequentState(response.data);
      } catch (err) {
        console.error("Error fetching frequent records", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFrequentRecords();
  }, []);

  const handleChange = (itemName, field, value) => {
    setFrequentState((prev) => {
      const updatedItem = { ...prev[itemName], [field]: value };
      if (field === "quantity" || field === "price") {
        updatedItem.total = Number(updatedItem.quantity) * Number(updatedItem.price);
      }
      return { ...prev, [itemName]: updatedItem };
    });
  };

  const handleUpdate = async (itemName) => {
    setLoading(true);
    try {
      const updatedItem = {
        ...frequentState[itemName],
        total: Number(frequentState[itemName].quantity) * Number(frequentState[itemName].price),
      };
      const updatedData = { ...frequentState, [itemName]: updatedItem };
      await expenseService.updateFrequentRecord("", updatedData);
      setFrequentState(updatedData);
    } catch (err) {
      alert("Error updating record", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (itemName) => {
    setLoading(true);
    const { [itemName]: removed, ...rest } = frequentState;
    try {
      await expenseService.updateFrequentRecord("", rest);
      setFrequentState(rest);
    } catch (err) {
      alert("Error removing item", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = async () => {
    if (!newItem.name) return alert("Enter item name");
    setLoading(true);

    const record = {
      [newItem.name]: {
        quantity: Number(newItem.quantity),
        price: Number(newItem.price),
        total: Number(newItem.quantity) * Number(newItem.price),
        category: newItem.category,
      },
    };

    try {
      const updatedData = { ...frequentState, ...record };
      await expenseService.updateFrequentRecord("", updatedData);
      setFrequentState(updatedData);
      setNewItem({ name: "", quantity: "", price: "", category: "" });
    } catch (err) {
      alert("Error adding new item", err);
    } finally {
      setLoading(false);
    }
  };

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
        <h2 className="frequent-title mb-0">Frequent Expense Tracker</h2>
        <Button label="Go Back" onClick={handleGoBack} className="btn" style={{ backgroundColor: "#456882", color: "#fff", border: "2px solid #ffffff", borderRadius: "8px" }} />
      </div>

      <div className="card mb-4 frequent-card">
        <div className="card-header text-white frequent-card-header" style={{ backgroundColor: "#456882" }}>
          <h4 className="mb-0">Add New Item</h4>
        </div>
        <div className="card-body">
          <div className="row align-items-end g-2">
            <div className="col-md-3">
              <Input label="Name" value={newItem.name} onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="col-md-2">
              <Input label="Quantity" value={newItem.quantity} onChange={(e) => setNewItem(prev => ({ ...prev, quantity: e.target.value }))} />
            </div>
            <div className="col-md-2">
              <Input label="Price" value={newItem.price} onChange={(e) => setNewItem(prev => ({ ...prev, price: e.target.value }))} />
            </div>
            <div className="col-md-2 mb-2">
              <label htmlFor="categoryDropdown" className="form-label">Choose</label>
              <select id="categoryDropdown" className="form-control" value={newItem.category} onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}>
                <option value="">Category</option>
                <option value="food">Food & Beverage</option>
                <option value="travel">Travel</option>
                <option value="entertainment">Entertainment</option>
                <option value="others">Others</option>
              </select>
            </div>
            <div className="col-md-2 mb-2">
              <Button label="Add Item" onClick={handleAddNew} className="btn w-100" style={{ backgroundColor: "#456882", color: "#fff", border: "2px solid #ffffff", borderRadius: "8px" }} />
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
            <p className="text-muted">No items yet.</p>
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
                      <td><Input label="Quantity" value={itemData.quantity} onChange={(e) => handleChange(itemName, "quantity", e.target.value)} /></td>
                      <td><Input label="Price" value={itemData.price} onChange={(e) => handleChange(itemName, "price", e.target.value)} /></td>
                      <td>{itemData.category}</td>
                      <td className="fw-bold text-success">₹{itemData.total}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button label="Update" onClick={() => handleUpdate(itemName)} className="btn" style={{ backgroundColor: "#456882", color: "#fff", border: "2px solid #ffffff", borderRadius: "8px" }} />
                          <Button label="Remove" onClick={() => handleRemove(itemName)} className="btn btn-danger btn-sm" />
                        </div>
                      </td>
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
          {Object.entries(frequentState).length === 0 ? (
            <p className="text-muted">No items yet.</p>
          ) : (
            <div className="table-responsive mb-3">
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
                  {Object.entries(frequentState).map(([itemName, itemData]) => (
                    <tr key={itemName}>
                      <td><strong>{itemName}</strong></td>
                      <td><span className="badge bg-secondary">{itemData.category}</span></td>
                      <td>{itemData.quantity}</td>
                      <td>₹{itemData.price}</td>
                      <td className="fw-bold text-success">₹{itemData.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="fw-bold fs-4 mb-0">
            Grand Total: <span className="text-primary">₹{Object.values(frequentState).reduce((sum, item) => sum + Number(item.total || 0), 0)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default FrequentList;
