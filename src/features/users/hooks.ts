import {useState} from "react";
import {registerApi, updateApi} from "./api";

export const useUsers = () => {
    const [loading, setLoading] = useState(false);

    const register = async (name: string, email: string, password: string) => {
        setLoading(true);
        try {
            const data = await registerApi({name, email, password});
            return data;
        } finally {
            setLoading(false);
        }
    };

    const update = async (name: string) => {
        setLoading(true);
        try {
            const data = await updateApi({name});
            return data;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        register,
        update,
    };
};