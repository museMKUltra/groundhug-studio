import {Route, Routes} from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import AttendancePage from "@/pages/AttendancePage";
import ProtectedRoute from "@/routes/ProtectedRoute";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage/>}/>

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