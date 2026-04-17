import {Navigate, Route, Routes} from "react-router-dom";
import ProtectedRoute from "@/routes/ProtectedRoute";
import GuestRoute from "@/routes/GuestRoute.tsx";
import MainLayout from "@/layouts/MainLayout.tsx";
import AuthLayout from "@/layouts/AuthLayout.tsx";
import {routes} from "./config";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace/>}/>

            {routes.map((route) => {
                let component = route.component;

                if (route.layout === "main") {
                    component = <MainLayout>{component}</MainLayout>;
                }
                if (route.layout === "auth") {
                    component = <AuthLayout>{component}</AuthLayout>;
                }

                if (route.protected) {
                    component = <ProtectedRoute>{component}</ProtectedRoute>;
                } else {
                    component = <GuestRoute>{component}</GuestRoute>;
                }

                if (route.wrapper) {
                    component = route.wrapper(component);
                }

                return (
                    <Route key={route.path} path={route.path} element={component}/>
                );
            })}
        </Routes>
    );
}