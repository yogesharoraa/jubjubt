import axios from 'axios';
import Cookies from 'js-cookie';
import { useQuery } from '@tanstack/react-query';

export interface DashboradLogintype {
  status: boolean;
  data: {
    email_count: number;
    phone_count: number;
    social_count: number;
  };
  message: string;
  toast: boolean;
}

export const UseLogintype = () => {
  const baseURL =  import.meta.env.VITE_API_URL;

  return useQuery<DashboradLogintype, Error>({
    queryKey: ['login-type-card'],
    queryFn: async () => {
      const token = Cookies.get('token');
      if (!token) throw new Error('No token found');

      const response = await axios.post<DashboradLogintype>(
        `${baseURL}/admin/login-type-card`,
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
