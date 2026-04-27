import {Outlet, useLocation} from "react-router-dom";
import {useAuth} from "@/features/auth/hooks";
import type {Guard} from "@/routes/guards";

export default function GuardPipeline({guards}: { guards?: Guard[] }) {
    const {user, isInitializing} = useAuth();
    const location = useLocation();

    if (isInitializing) return null;

    const ctx = {user, location};

    let node: React.ReactNode = <Outlet/>;

    if (guards) {
        node = guards.reduceRight<React.ReactNode>(
            (acc, guard) => guard(ctx, acc),
            node
        );
    }

    return node;
}