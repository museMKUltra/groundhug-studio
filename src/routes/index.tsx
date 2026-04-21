import {Navigate, Route, Routes} from "react-router-dom";
import MainLayout from "@/layouts/MainLayout.tsx";
import GuardPipeline from "@/routes/GuardPipeline.tsx";
import {routes} from "./config";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace/>}/>

            {routes.map((route) => (
                <Route
                    key={route.path}
                    element={<GuardPipeline guards={route.guards}/>}
                >
                    <Route
                        element={route.layout || <MainLayout/>}
                    >
                        <Route
                            path={route.path}
                            element={
                                route.wrapper
                                    ? route.wrapper(route.element)
                                    : route.element
                            }
                        />
                    </Route>
                </Route>
            ))}
        </Routes>
    );
}