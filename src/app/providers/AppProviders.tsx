import type {ReactNode} from "react";
import {ThemeProviders} from "./ThemeProviders";
import {RouterProvider} from "./RouterProvider";
import {UiProviders} from "./UiProviders";
import {FeatureProviders} from "./FeatureProviders";

interface Props {
    children: ReactNode;
}

export default function AppProviders({children}: Props) {
    return (
        <ThemeProviders>
            <UiProviders>
                <FeatureProviders>
                    <RouterProvider>
                        {children}
                    </RouterProvider>
                </FeatureProviders>
            </UiProviders>
        </ThemeProviders>
    );
}