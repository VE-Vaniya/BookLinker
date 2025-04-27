import SideNav from "./SideNav";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from "recharts";

const Dashboard = () => {

  return (
    <div
      className="min-h-screen flex"
      style={{
        background: "radial-gradient(ellipse at center, #A8816C 0%, #905A40 50%, #6E4C3D 100%)",
      }}
    >
      <SideNav />
      <div className="text-white">Welcome to DashBoard</div>
    </div>
  );
};

export default Dashboard;
