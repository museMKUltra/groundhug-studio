import {type ReactNode} from "react";

import HomePage from "@/app/pages/HomePage.tsx";
import LoginPage from "@/app/pages/LoginPage.tsx";
import SummaryPage from "@/app/pages/SummaryPage.tsx";
import AttendancePage from "@/app/pages/AttendancePage.tsx";
import ProjectsPage from "@/app/pages/ProjectsPage.tsx";

import LoginLayout from "@/app/layouts/LoginLayout.tsx";

import {SessionProvider} from "@/features/attendance/SessionProvider.tsx";
import {LabelProvider} from "@/features/attendance/LabelProvider.tsx";
import {ProjectProvider} from "@/features/projects/ProjectProvider.tsx";

import {authGuard, type Guard, guestGuard, roleGuard} from "@/app/routes/guards.tsx";
import type {Role} from "@/features/auth/types.ts";
import HomeLayout from "@/app/layouts/HomeLayout.tsx";

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
        path: "/projects",
        element: <ProjectsPage/>,
        label: "Projects",
        guards: [authGuard],
    },
    {
        // no label → not shown in nav
        path: "/projects/:projectId/attendance",
        element: <AttendancePage/>,
        guards: [authGuard],
        wrapper: (node) => (
            <ProjectProvider>
                <LabelProvider>
                    <SessionProvider>
                        {node}
                    </SessionProvider>
                </LabelProvider>
            </ProjectProvider>
        ),
    },
    {
        path: "/summary",
        element: <SummaryPage/>,
        label: "Summary",
        roles: ["ADMIN", "PREMIUM"],
        guards: [roleGuard(["ADMIN", "PREMIUM"])],
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