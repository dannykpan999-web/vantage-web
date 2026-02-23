import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Booking from "./pages/Booking";
import Payment from "./pages/Payment";
import Wallet from "./pages/Wallet";
import BarberDashboard from "./pages/BarberDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import AiConcierge from "./components/AiConcierge";

function PrivateRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AiConcierge />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/booking" element={<PrivateRoute><Booking /></PrivateRoute>} />
        <Route path="/payment" element={<PrivateRoute><Payment /></PrivateRoute>} />
        <Route path="/wallet" element={<PrivateRoute roles={["barber"]}><Wallet /></PrivateRoute>} />
        <Route path="/barber-dashboard" element={<PrivateRoute roles={["barber"]}><BarberDashboard /></PrivateRoute>} />
        <Route path="/owner-dashboard" element={<PrivateRoute roles={["owner"]}><OwnerDashboard /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
