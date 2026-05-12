import {type Location, Navigate} from "react-router-dom";
import type {ReactNode} from "react";
import type {Role} from "@/features/auth/types.ts";

type GuardContext = {
    user: { role: Role } | null;
    location: Location;
};

export type Guard = (ctx: GuardContext, node: ReactNode) => ReactNode;

export const guestGuard: Guard = (ctx, node) => {
    if (ctx.user) {
        const from = ctx.location.state?.from?.pathname || "/attendance";

        return <Navigate to={from} replace/>;
    }

    return node;
};

function navigateToLogin(ctx: GuardContext) {
    return (
        <Navigate
            to="/login"
            replace
            state={{from: ctx.location}}
        />
    );
}

export const authGuard: Guard = (ctx, node) => {
    if (!ctx.user) {
        return navigateToLogin(ctx);
    }

    return node;
};

export const roleGuard = (roles: Role[]): Guard => (ctx, node) => {
    if (!ctx.user) {
        return navigateToLogin(ctx);
    }

    if (!roles.includes(ctx?.user?.role)) {
        return <Navigate to="/attendance" replace/>;
    }

    return node;
};