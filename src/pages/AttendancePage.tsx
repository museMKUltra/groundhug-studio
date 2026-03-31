import {useEffect, useState} from "react";
import {useAttendance} from "@/features/attendance/hooks";
import type {ActiveSessionResponse} from "@/features/attendance/types";

export default function AttendancePage() {
    const {getActiveSession, loading} = useAttendance();
    const [session, setSession] = useState<ActiveSessionResponse>({
        active: false,
        session: null,
        summary: null,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getActiveSession();
                setSession(data);
            } catch (err) {
                console.error("Failed to load active session", err);
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            <h1>Attendance Page</h1>

            {loading && <p>Loading...</p>}

            {!loading && session && (
                <pre>{JSON.stringify(session, null, 2)}</pre>
            )}

            {!loading && !session && <p>No active session</p>}
        </div>
    );
}