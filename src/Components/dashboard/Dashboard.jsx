import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import Navbar from "../../common/Navbar";
import { useNavigate } from "react-router-dom";
import { expenseService } from "../../services/expenseServices";
 
function Dashboard() {
  const [totalSpent, setTotalSpent] = useState(0);
  const [topCategory, setTopCategory] = useState("-");
  const [numberOfCategories, setNumberOfCategories] = useState(0);
  const [categoryData, setCategoryData] = useState([]);
  const navigate = useNavigate();
 
  useEffect(() => {
    async function fetchAndCalculate() {
      try {
        const res = await expenseService.getDailyRecords();
        const data = res.data;
        const today = new Date();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = today;
 
        let total = 0;
        const categoryTotals = {};
        const allCategoriesSet = new Set();
 
        Object.entries(data).forEach(([dateStr, items]) => {
          const [day, month, year] = dateStr.split("/").map(Number);
          const recordDate = new Date(year, month - 1, day);
          if (recordDate >= monthStart && recordDate <= monthEnd) {
            Object.values(items).forEach((item) => {
              if (item.category !== "income") {
                total += item.total;
                categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.total;
              }
            });
          }
          Object.values(items).forEach((item) => {
            if (item.category && item.category !== "income") {
              allCategoriesSet.add(item.category);
            }
          });
        });
 
        setTotalSpent(total);
 
        let topCat = "-";
        let topCatTotal = 0;
        Object.entries(categoryTotals).forEach(([cat, catTotal]) => {
          if (catTotal > topCatTotal) {
            topCat = cat;
            topCatTotal = catTotal;
          }
        });
        setTopCategory(topCat);
        setNumberOfCategories(allCategoriesSet.size);
 
        const chartData = Object.entries(categoryTotals).map(([cat, catTotal]) => ({ name: cat, total: catTotal }));
        setCategoryData(chartData);
      } catch {
        setTotalSpent(0);
        setTopCategory("-");
        setNumberOfCategories(0);
        setCategoryData([]);
      }
    }
    fetchAndCalculate();
  }, []);
 
  return (
    <>
      <div className="container mt-4">
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card shadow-sm text-center p-4" style={{ height: "180px" }}>
              <h6>Total Spent (This Month)</h6>
              <h2 className="fw-bold text-success mt-3">₹{totalSpent}</h2>
            </div>
          </div>
 
          <div className="col-md-4">
            <div className="card shadow-sm text-center p-4" style={{ height: "180px" }}>
              <h6>Most Spent On</h6>
              <h2 className="fw-bold mt-3" style={{color:"#456882"}}>{topCategory}</h2>
            </div>
          </div>
 
          <div className="col-md-4">
            <div className="card shadow-sm text-center p-4" style={{ height: "180px" }}>
              <h6>Number of Categories</h6>
              <h2 className="fw-bold text-warning mt-3">{numberOfCategories}</h2>
            </div>
          </div>
        </div>
 
        <div className="row g-3">
          {/* Bar Chart (8 cols) */}
          <div className="col-md-8">
            <div className="card shadow-sm p-4" style={{ height: "350px" }}>
              <h5 className="mb-3">Spending by Category</h5>
              <ResponsiveContainer width="100%" height="80%">
                <BarChart data={categoryData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#456882" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
 
          <div className="col-md-4">
            <div
              className="card shadow-sm p-4 d-flex flex-column align-items-center justify-content-center text-center"
              style={{ height: "350px" }}
            >
              <h5> Budget Planner</h5>
              <p className="text-muted small mt-2">
                Move to your budget page to add your budget and track spending effectively.
              </p>
              <button className="btn fw-bold mt-3"  style={{background:"#456882",color:"white"}} onClick={() => navigate('/budget')}>Move to Budget →</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
 
export default Dashboard;