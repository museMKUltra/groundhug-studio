import {DialogContent, Stack, Typography} from "@mui/material";
import {DatePicker, TimePicker} from "@mui/x-date-pickers";
import dayjs from "dayjs";
import {useMemo, useState} from "react";
import type {AxiosError} from "axios";

import {useSnackbar} from "@/shared/providers/SnackbarContext.ts";
import type {Session} from "@/features/attendance/types.ts";
import {useLabelContext} from "@/features/attendance/LabelContext.tsx";
import {getDuration} from "@/shared/utils/duration.ts";

import LabelChip from "@/shared/components/LabelChip.tsx";
import LabelSelect from "@/shared/components/LabelSelect.tsx";
import LabelDialog from "@/shared/components/LabelDialog.tsx";
import ViewEditField from "@/shared/components/ViewEditField.tsx";

type FormState = {
    clockIn: string;
    clockOut: string;
    labelId: number;
    description: string;
};

type Props = {
    session: Session | null;
    form: FormState;
    onChange: <K extends keyof FormState>(key: K, value: FormState[K]) => void
    isEditing: boolean
};

export default function SessionDialogContent({session, form, onChange, isEditing}: Props) {
    const {
        labels,
        globalLabels,
        sortableLabels,
        setSortableLabels,
        createLabel,
        updateLabel,
        deleteLabel,
        reorderLabels
    } = useLabelContext();
    const {showError, showSuccess} = useSnackbar();
    const [openLabelDialog, setOpenLabelDialog] = useState(false);

    const handleError = (err: unknown) => {
        const error = err as AxiosError<{ error?: string }>;
        console.error(error);
        showError(error?.response?.data?.error || "Something went wrong");
    };

    const sessionLabel = session?.label || null;
    const isDeletedLabel =
        sessionLabel && !labels.some(l => l.id === sessionLabel.id);
    const labelsWithDeleted = isDeletedLabel
        ? [...labels, sessionLabel]
        : labels;
    const chipLabel = isDeletedLabel ? sessionLabel : labels.find(l => l.id === sessionLabel?.id);

    const sessionDuration = useMemo(() => {
        const {clockIn, clockOut} = session || {};
        return getDuration({clockIn: clockIn || "", clockOut: clockOut || ""});
    }, [session]);

    const formDuration = useMemo(() => {
        const {clockIn, clockOut} = form;
        return getDuration({clockIn, clockOut});
    }, [form]);


    const updateDatePart = (original: string, newDate: dayjs.Dayjs) => {
        const base = dayjs(original || newDate);
        return base
            .year(newDate.year())
            .month(newDate.month())
            .date(newDate.date())
            .format("YYYY-MM-DDTHH:mm");
    };

    const updateTimePart = (original: string, newTime: dayjs.Dayjs) => {
        const base = dayjs(original || newTime);
        return base
            .hour(newTime.hour())
            .minute(newTime.minute())
            .format("YYYY-MM-DDTHH:mm");
    };

    return (
        <DialogContent sx={{pt: 2}}>
            <ViewEditField
                label="Duration"
                value={""}
                isEditing={isEditing}
                size="small"
                renderEdit={() => (
                    <Typography sx={{lineHeight: "40px"}}>
                        {formDuration}
                    </Typography>
                )}
                renderView={() => (
                    <Typography sx={{lineHeight: "40px"}}>
                        {sessionDuration}
                    </Typography>
                )}
            />

            <ViewEditField
                label="Clock In"
                value={form.clockIn}
                isEditing={isEditing}
                renderView={(val) => (
                    <Typography sx={{lineHeight: "40px"}}>
                        {val ? dayjs(val).format("MM/DD hh:mm A") : "--"}
                    </Typography>
                )}
                renderEdit={() => (
                    <Stack
                        direction={{xs: "column", md: "row"}}
                        spacing={1}
                    >
                        <DatePicker
                            value={form.clockIn ? dayjs(form.clockIn) : null}
                            onChange={(date) => {
                                if (!date) return;
                                onChange("clockIn", updateDatePart(form.clockIn, date));
                            }}
                            slotProps={{
                                textField: {size: "small"}
                            }}
                            minDate={dayjs(session?.clockIn).startOf("month")}
                            maxDate={dayjs(session?.clockIn).endOf("month")}
                            desktopModeMediaQuery="@media (min-width: 0px)"
                        />

                        <TimePicker
                            value={form.clockIn ? dayjs(form.clockIn) : null}
                            onChange={(time) => {
                                if (!time) return;
                                onChange("clockIn", updateTimePart(form.clockIn, time));
                            }}
                            slotProps={{
                                textField: {size: "small"}
                            }}
                            desktopModeMediaQuery="@media (min-width: 0px)"
                        />
                    </Stack>
                )}
            />

            <ViewEditField
                label="Clock Out"
                value={form.clockOut}
                isEditing={isEditing}
                renderView={(val) => (
                    <Typography sx={{lineHeight: "40px"}}>
                        {val ? dayjs(val).format("MM/DD hh:mm A") : "--"}
                    </Typography>
                )}
                renderEdit={() => (
                    <Stack
                        direction={{xs: "column", md: "row"}}
                        spacing={1}
                    >
                        <DatePicker
                            value={form.clockOut ? dayjs(form.clockOut) : null}
                            onChange={(date) => {
                                if (!date) return;
                                onChange("clockOut", updateDatePart(form.clockOut, date));
                            }}
                            slotProps={{
                                textField: {size: "small"}
                            }}
                            minDate={form.clockIn ? dayjs(form.clockIn) : undefined}
                            desktopModeMediaQuery="@media (min-width: 0px)"
                        />

                        <TimePicker
                            value={form.clockOut ? dayjs(form.clockOut) : null}
                            onChange={(time) => {
                                if (!time) return;
                                onChange("clockOut", updateTimePart(form.clockOut, time));
                            }}
                            slotProps={{
                                textField: {size: "small"}
                            }}
                            desktopModeMediaQuery="@media (min-width: 0px)"
                        />
                    </Stack>
                )}
            />
            <ViewEditField
                label="Label"
                value={String(form.labelId)}
                isEditing={isEditing}
                size="small"
                renderView={() =>
                    chipLabel ? <div><LabelChip label={chipLabel}/></div> : "--"
                }
                renderEdit={() =>
                    <LabelSelect
                        size="small"
                        labels={labelsWithDeleted}
                        value={form.labelId}
                        onChange={(val) => onChange("labelId", val)}
                        onManage={() => setOpenLabelDialog(true)}
                    />
                }
            />

            <LabelDialog
                open={openLabelDialog}
                globalLabels={globalLabels}
                sortableLabels={sortableLabels}
                setSortableLabels={setSortableLabels}
                onClose={() => setOpenLabelDialog(false)}
                onCreate={createLabel}
                onUpdate={updateLabel}
                onDelete={deleteLabel}
                onReorder={reorderLabels}
                onError={handleError}
                onSuccess={showSuccess}
            />

            <ViewEditField
                label="Description"
                value={form.description}
                isEditing={isEditing}
                size="small"
                multiline
                minRows={2}
                onChange={(val) => onChange("description", val)}
            />
        </DialogContent>
    );
}