import AppRoutes from "@/routes";
import {AppProviders} from "@/app/providers";

export default function App() {
    return (
        <AppProviders>
            <AppRoutes/>
        </AppProviders>
    );
}