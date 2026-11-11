import {AppRoutes} from "@/app/routes";
import {AppProviders} from "@/app/providers";
import ErrorBoundary from "@/app/components/ErrorBoundary.tsx";
import PwaUpdatePrompt from "@/app/components/PwaUpdatePrompt.tsx";

export default function App() {
    return (
        <AppProviders>
            <ErrorBoundary>
                <AppRoutes/>
            </ErrorBoundary>
            <PwaUpdatePrompt/>
        </AppProviders>
    );
}