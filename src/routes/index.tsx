import {Route, Routes} from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import AttendancePage from "@/pages/AttendancePage";
import ProtectedRoute from "@/routes/ProtectedRoute";
import GuestRoute from "@/routes/GuestRoute.tsx";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={
                <GuestRoute>
                    <LoginPage/>
                </GuestRoute>
            }/>

            <Route
                path="/attendance"
                element={
                    <ProtectedRoute>
                        <AttendancePage/>
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}