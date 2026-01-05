import axios from "axios";
import Cookies from "js-cookie";
import { useQuery } from "@tanstack/react-query";
import type { DashboradTotalUser } from "../../../Types/Types";

export const UsegetUserTotal = () => {
  const baseURL = import.meta.env.VITE_API_URL;

  return useQuery<DashboradTotalUser, Error>({
    queryKey: ["get-total-users"],
    queryFn: async () => {
      const token = Cookies.get("token");

      if (!token) throw new Error("No token found");

      const response = await axios.post<DashboradTotalUser>(
        `${baseURL}/admin/total-user-card`,
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
