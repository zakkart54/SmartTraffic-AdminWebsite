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

  const getAllData = async (limit?: number, offset?: number) => {
    const params = new URLSearchParams();
    if (limit !== undefined) params.append("limit", limit.toString());
    if (offset !== undefined) params.append("offset", offset.toString());
    const response = await api.get<any>(`${API_URL}/data/?${params.toString()}`, {
      headers: { Authorization: accessToken }
    });
    return response;
  };

  const getAllImgData = async (limit?: number, offset?: number) => {
    const params = new URLSearchParams();
    if (limit !== undefined) params.append("limit", limit.toString());
    if (offset !== undefined) params.append("offset", offset.toString());
    const response = await api.get<any>(`${API_URL}/data/img?${params.toString()}`, {
      headers: { Authorization: accessToken }
    });
    return response;
  };

  const getAllTextData = async (limit?: number, offset?: number) => {
    const params = new URLSearchParams();
    if (limit !== undefined) params.append("limit", limit.toString());
    if (offset !== undefined) params.append("offset", offset.toString());
    const response = await api.get<any>(`${API_URL}/data/text?${params.toString()}`, {
      headers: { Authorization: accessToken }
    });
    return response;
  };

  const putTrainValTest = async (data:any) => {
    const response = await api.put<any>(`${API_URL}/data/trainValTest`,
      data,
      { headers: { Authorization: accessToken } }
    );
    return response;
  };

  return { getDataDetail, getAllData, getAllImgData, getAllTextData, putTrainValTest };
};
