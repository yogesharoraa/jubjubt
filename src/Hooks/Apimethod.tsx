import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const Apimethod = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [data, setData] = useState<any>(null);


  const makeRequest = async (
    url: string,
    bodyData: any = {},
    contentType = "application/json",
    method: "POST" | "PUT" | "GET" = "POST"
  ) => {
    const token = Cookies.get("token");

    try {
      setLoading(true);
      setError(null);

      const headers = {
        "Content-Type": contentType,
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const apiUrl = import.meta.env.VITE_API_URL;


      let response;
      if (method === "POST") {
        response = await axios.post(`${apiUrl}${url}`, bodyData, { headers });
      } else if (method === "PUT") {
        response = await axios.put(`${apiUrl}${url}`, bodyData, { headers });
      } else if (method === "GET") {
        response = await axios.get(`${apiUrl}${url}`, { headers });
      }

      setData(response?.data);
      return response?.data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, data, makeRequest };
};

export default Apimethod;
