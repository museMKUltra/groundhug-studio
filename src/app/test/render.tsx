import {render} from "@testing-library/react";
import type {ReactNode} from "react";

import {SnackbarProvider} from "@/shared/providers/SnackbarProvider";

export function renderWithProviders(
    ui: React.ReactElement,
) {
    return render(ui, {
        wrapper: function ({children}: { children: ReactNode }) {
            return (
                <SnackbarProvider>
                    {children}
                </SnackbarProvider>
            );
        },
    });
}