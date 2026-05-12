import {type ReactNode} from "react";

import HomePage from "@/pages/HomePage.tsx";
import LoginPage from "@/pages/LoginPage.tsx";
import SummaryPage from "@/pages/SummaryPage.tsx";
import AttendancePage from "@/pages/AttendancePage.tsx";

import LoginLayout from "@/layouts/LoginLayout.tsx";

import {SessionProvider} from "@/features/attendance/SessionProvider.tsx";
import {LabelProvider} from "@/features/attendance/LabelProvider.tsx";

import {authGuard, type Guard, guestGuard, roleGuard} from "@/app/routes/guards.tsx";
import type {Role} from "@/features/auth/types.ts";
import HomeLayout from "@/layouts/HomeLayout.tsx";

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
        path: "/register",
        element: <LoginPage/>,
        guards: [guestGuard],
        layout: <LoginLayout/>,
    },
    {
        path: "/guest",
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
