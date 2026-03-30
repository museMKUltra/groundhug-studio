import {useState} from "react";
import {registerApi} from "./api";

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

    return {
        register,
        loading,
    };
};