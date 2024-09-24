import { Outlet, Navigate } from "react-router-dom";
import Cookies from 'js-cookie'
const ProtectedRoutes = () => {
    const token = Cookies.get('token')
    const isAuthenticated = !!token;
    return isAuthenticated ? <Outlet/> : <Navigate to="/login"/>
}

export default ProtectedRoutes