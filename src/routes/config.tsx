import {type ReactNode} from "react";

import LoginPage from "@/pages/LoginPage";
import SummaryPage from "@/pages/SummaryPage";
import AttendancePage from "@/pages/AttendancePage";

import LoginLayout from "@/layouts/LoginLayout";

import {SessionProvider} from "@/features/attendance/SessionProvider";
import {LabelProvider} from "@/features/attendance/LabelProvider";

import {authGuard, type Guard, guestGuard, roleGuard} from "@/routes/guards";

export interface AppRoute {
    path: string;
    element: ReactNode;
    label?: string;
    guards?: Guard[];
    layout?: ReactNode;
    wrapper?: (node: ReactNode) => ReactNode;
}

export const routes: AppRoute[] = [
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
        guards: [roleGuard(['ADMIN'])],
    },
];

export const navPages = routes.filter((r) => r.label);