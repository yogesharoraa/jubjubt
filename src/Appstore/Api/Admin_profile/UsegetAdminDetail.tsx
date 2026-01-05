import axios from "axios";
import Cookies from "js-cookie";
import { useQuery } from "@tanstack/react-query";
import type { AdminDetail } from "../../../Types/Types";

export const UsegetAdminDetail = () => {
  const baseURL =  import.meta.env.VITE_API_URL;

  return useQuery<AdminDetail, Error>({
    queryKey: ["admin_detail"],
    queryFn: async () => {
      const token = Cookies.get("token");

      if (!token) {
        throw new Error("No token found");
      }

      const response = await axios.post<AdminDetail>(
        `${baseURL}/admin/update-profile`,
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
