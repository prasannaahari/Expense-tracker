import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useLocation,
} from "react-router-dom";
import ActualTracking from "./Components/ActualTracking";
import Home from "./common/Home";
import FrequentList from "./Components/FrequentList";
import Dashboard from "./Components/dashboard/Dashboard";
import Report from "./Components/report/Report";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Navbar from "./common/Navbar";
import Footer from "./common/Footer";
import DailySummary from "./Components/DailySummary";
import Edit from "./Components/Edit";
import WeeklyMonthlySummary from "./Components/WeeklyMonthlySummary";
import MonthlySavings from "./Components/MonthlySavings";

// Layout component to handle Navbar/Footer logic
function Layout() {
  const location = useLocation();
  const showNavFooter = location.pathname !== "/";
  const navbarHeight = 70;

  return (
    <>
      {showNavFooter && (
        <div className="fixed-top" style={{ zIndex: 1030 }}>
          <Navbar />
        </div>
      )}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          paddingTop: showNavFooter ? `${navbarHeight}px` : 0,
        }}
      >
        <Outlet />
      </main>
      {showNavFooter && <Footer />}
    </>
  );
}

// Define routes as objects
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/budget", element: <ActualTracking /> },
      { path: "/frequent", element: <FrequentList /> },
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/report", element: <Report /> },
      {
        path: "/daily",
        element: <DailySummary date={new Date().toLocaleDateString("en-GB")} />,
      },
      { path: "/edit", element: <Edit /> },
      { path: "/weeklyMonthy", element: <WeeklyMonthlySummary /> },
      { path: "/savings", element: <MonthlySavings /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
