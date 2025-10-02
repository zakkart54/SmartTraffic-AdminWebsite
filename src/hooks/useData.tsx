import { api } from "../lib/queryClient";
import { API_URL } from "../lib/config"
import { useAuth } from "./useAuth";

export const useData = () => {
  const { accessToken } = useAuth();

  const getDataDetail = async (dataId:any) => {
    const response = await api.get<any>(`${API_URL}/data/detail/${dataId}`,
      { headers: { Authorization: accessToken } }
    );
    return response;
  };

  return { getDataDetail };
  
};
