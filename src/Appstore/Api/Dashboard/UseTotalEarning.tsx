import axios from "axios";
import Cookies from "js-cookie";
import { useQuery } from "@tanstack/react-query";
import type { DashboradEarning } from "../../../Types/Types";

export const UseTotalEarning = () => {
  const baseURL = import.meta.env.VITE_API_URL;

  return useQuery<DashboradEarning, Error>({
    queryKey: ["total-income-card"],
    queryFn: async () => {
      const token = Cookies.get("token");

      if (!token) throw new Error("No token found");

      const response = await axios.post<DashboradEarning>(
        `${baseURL}/admin/total-income-card`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    },
    staleTime: Infinity,
  });
};
