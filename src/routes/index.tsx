import {Navigate, Route, Routes} from "react-router-dom";
import ProtectedRoute from "@/routes/ProtectedRoute";
import GuestRoute from "@/routes/GuestRoute.tsx";
import LoginPage from "@/pages/LoginPage";
import AttendancePage from "@/pages/AttendancePage";
import MainLayout from "@/layouts/MainLayout.tsx";
import AuthLayout from "@/layouts/AuthLayout.tsx";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route path="/login" element={
                <GuestRoute>
                    <AuthLayout>
                        <LoginPage/>
                    </AuthLayout>
                </GuestRoute>
            }/>

            <Route
                path="/attendance"
                element={
                    <ProtectedRoute>
                        <MainLayout>
                            <AttendancePage/>
                        </MainLayout>
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}