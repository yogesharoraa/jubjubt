import axios from "axios";
import Cookies from "js-cookie";
import { useQuery } from "@tanstack/react-query";
import type { GiftCategory } from "../../../Types/Types";

export const UsegetGiftCategoryValues = () => {
  const baseURL =  import.meta.env.VITE_API_URL;

  return useQuery<GiftCategory, Error>({
    queryKey: ["get-gift-category"],
    queryFn: async () => {
      const token = Cookies.get("token");

      if (!token) {
        throw new Error("No token found");
      }

      const response = await axios.post<GiftCategory>(
        `${baseURL}/gift/get-gift-category`,
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
