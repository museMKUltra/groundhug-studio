import {type ReactNode} from "react";

import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import SummaryPage from "@/pages/SummaryPage";
import AttendancePage from "@/pages/AttendancePage";

import LoginLayout from "@/layouts/LoginLayout";

import {SessionProvider} from "@/features/attendance/SessionProvider";
import {LabelProvider} from "@/features/attendance/LabelProvider";

import {authGuard, type Guard, guestGuard, roleGuard} from "@/routes/guards";
import type {Role} from "@/features/auth/types";
import HomeLayout from "@/layouts/HomeLayout";

export interface AppRoute {
    path: string;
    element: ReactNode;
    label?: string;
    roles?: Role[];
    guards?: Guard[];
    layout?: ReactNode;
    wrapper?: (node: ReactNode) => ReactNode;
}

export const routes: AppRoute[] = [
    {
        path: "/",
        element: <HomePage/>,
        layout: <HomeLayout/>,
    },
    {
        path: "/login",
        element: <LoginPage/>,
        guards: [guestGuard],
        layout: <LoginLayout/>,
    },
    {
        path: "/attendance",
        element: <AttendancePage/>,
        label: "Attendance",
        guards: [authGuard],
        wrapper: (node) => (
            <LabelProvider>
                <SessionProvider>
                    {node}
                </SessionProvider>
            </LabelProvider>
        ),
    },
    {
        path: "/summary",
        element: <SummaryPage/>,
        label: "Summary",
        roles: ["ADMIN"],
        guards: [roleGuard(["ADMIN"])],
    },
];

export const getNavPages = (role?: Role) => {
    return routes.filter((r) => {
        if (!r.label) return false;

        // no role restriction → visible to all logged-in users
        if (!r.roles) return true;

        // role-based visibility
        return role ? r.roles.includes(role) : false;
    });
};
