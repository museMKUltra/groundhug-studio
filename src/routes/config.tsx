import {type ReactNode} from "react";

import LoginPage from "@/pages/LoginPage";
import SummaryPage from "@/pages/SummaryPage";
import AttendancePage from "@/pages/AttendancePage";

import {SessionProvider} from "@/features/attendance/SessionProvider";
import {LabelProvider} from "@/features/attendance/LabelProvider";

export interface AppRoute {
    path: string;
    component: ReactNode;
    label?: string;
    layout?: "main" | "auth";
    protected?: boolean;
    wrapper?: (node: ReactNode) => ReactNode;
}

export const routes: AppRoute[] = [
    {
        path: "/login",
        component: <LoginPage/>,
        layout: "auth",
    },
    {
        path: "/attendance",
        component: <AttendancePage/>,
        label: "Attendance",
        layout: "main",
        protected: true,
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
        component: <SummaryPage/>,
        label: "Summary",
        layout: "main",
        protected: true,
    },
];

export const navPages = routes.filter((r) => r.label);