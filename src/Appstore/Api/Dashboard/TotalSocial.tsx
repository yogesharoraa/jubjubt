import axios from "axios";
import Cookies from "js-cookie";
import { useQuery } from "@tanstack/react-query";
import type { DashboradTotalSocail } from "../../../Types/Types";

export const TotalSocial = () => {
  const baseURL =  import.meta.env.VITE_API_URL;

  return useQuery<DashboradTotalSocail, Error>({
    queryKey: ["total-social-card"],
    queryFn: async () => {
      const token = Cookies.get("token");

      if (!token) {
        throw new Error("No token found");
      }

      // Prepare form data
      const formData = new URLSearchParams();
      formData.append("social_type", "reel");

      const response = await axios.post<DashboradTotalSocail>(
        `${baseURL}/admin/total-social-card`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      return response.data;
    },
    staleTime: Infinity,
  });
};
