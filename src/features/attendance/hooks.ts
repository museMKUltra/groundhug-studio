import {useState} from "react";
import {getActiveSessionApi} from "./api";

export const useAttendance = () => {
    const [loading, setLoading] = useState(false);

    const getActiveSession = async () => {
        setLoading(true);
        try {
            return await getActiveSessionApi();
        } finally {
            setLoading(false);
        }
    };

    return {
        getActiveSession,
        loading,
    };
};