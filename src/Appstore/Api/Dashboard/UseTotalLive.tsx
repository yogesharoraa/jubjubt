import axios from "axios";
import Cookies from "js-cookie";
import { useQuery } from "@tanstack/react-query";
import type { DashboradLive } from "../../../Types/Types";

export const UseTotalLive = () => {
  const baseURL =  import.meta.env.VITE_API_URL;

  return useQuery<DashboradLive, Error>({
    queryKey: ["total-live-card"],
    queryFn: async () => {
      const token = Cookies.get("token");

      if (!token) throw new Error("No token found");

      const response = await axios.post<DashboradLive>(
        `${baseURL}/admin/total-live-card`,
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
