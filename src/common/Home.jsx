import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <section
      className="frequent-bg d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh", padding: "3rem 1rem" }}
    >
      <div
        className="frequent-card text-center"
        style={{
          width: "90%",
          maxWidth: 1100,
          padding: "4rem",
          borderRadius: 14,
          boxShadow: "0 20px 60px rgba(27,60,83,0.08)",
        }}
      >
        <h1
          className="frequent-title"
          style={{ fontSize: "3rem", lineHeight: 1.05, marginBottom: "0.6rem" }}
        >
          Take control of your finance
        </h1>
        <p className="lead text-muted mb-4" style={{ fontSize: "1.125rem" }}>
          Track expenses, monitor budgets and get insights — all in one simple app.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate("/dashboard")}
            style={{ backgroundColor: "#456882", borderColor: "#456882", padding: "0.75rem 1.4rem" }}
          >
            Get Started
          </button>
        </div>
      </div>
    </section>
  );
};

export default Home;
