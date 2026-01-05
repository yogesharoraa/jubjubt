import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";


const PrivateRoute: React.FC = () => {
  const token = Cookies.get("token");
  return token ? <Outlet /> : <Navigate to="/signin" replace />;
};

export default PrivateRoute;
