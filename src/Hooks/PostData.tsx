import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";


const useApiPost = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const postData = async (url: string, bodyData: any, contentType = "application/json") => {
    const token = Cookies.get("token");

    try {
      setLoading(true);
      setError(null);

      const headers = {
        "Content-Type": contentType,
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const apiUrl = import.meta.env.VITE_API_URL;


      const response = await axios.post(`${apiUrl}${url}`, bodyData, { headers });
      
      setData(response.data);
      return response.data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, data, postData };
}; 


/*
const useApiPost = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<any>(null);
  const [data, setData]     = useState<any>(null);

  const postData = async (url: string, bodyData?: any, contentType?: string) => {
    const token = Cookies.get("token");
    const apiUrl = import.meta.env.VITE_API_URL;

    try {
      setLoading(true);
      setError(null);

      const isForm = typeof FormData !== "undefined" && bodyData instanceof FormData;

      const headers: AxiosRequestHeaders = {
        ...(token && { Authorization: `Bearer ${token}` }),
        // Only set Content-Type when NOT sending FormData
        ...(!isForm && { "Content-Type": contentType || "application/json" }),
      };

      const response = await axios.post(
        `${apiUrl}${url}`,
        // If not FormData, send JSON string. If FormData, pass as-is.
        isForm ? bodyData : (bodyData ?? {}),
        {
          headers,
          withCredentials: true, // keep if server uses cookies
        }
      );

      setData(response.data);
      return response.data;
    } catch (err: any) {
      setError(err);
      return err?.response?.data || { success: false, message: err?.message || "Network error" };
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, data, postData };
};
*/

export default useApiPost;

