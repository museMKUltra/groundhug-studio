import {Route, Routes} from "react-router-dom";
import MainLayout from "@/app/layouts/MainLayout.tsx";
import GuardPipeline from "@/app/routes/GuardPipeline.tsx";
import {routes} from "./config.tsx";

export default function AppRoutes() {
    return (
        <Routes>
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