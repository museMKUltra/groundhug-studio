import {useState} from "react";
import {registerApi} from "./api";

export const useUsers = () => {
    const [loading, setLoading] = useState(false);

    const register = async (name: string, email: string, password: string) => {
        setLoading(true);
        try {
            await registerApi({name, email, password});
        } finally {
            setLoading(false);
        }
    };

    return {
        register,
        loading,
    };
};