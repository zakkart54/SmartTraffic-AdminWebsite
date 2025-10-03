import { api, useApiMutation } from "../lib/queryClient";
import { API_URL } from "../lib/config"
import { useAuth } from "./useAuth";

export const useReport = () => {
  const { accessToken } = useAuth();

  const getAllReport = async (limit?: number, offset?: number) => {
    const params = new URLSearchParams();
    if (limit !== undefined) params.append("limit", limit.toString());
    if (offset !== undefined) params.append("offset", offset.toString());
    const response = await api.get<any>(`${API_URL}/report/?${params.toString()}`,
      { headers: { Authorization: accessToken } }
    );
    return response;
  };

  const getAllUnqualifiedReport = async (limit?: number, offset?: number) => {
    const params = new URLSearchParams();
    if (limit !== undefined) params.append("limit", limit.toString());
    if (offset !== undefined) params.append("offset", offset.toString());
    const response = await api.get<any>(`${API_URL}/report/notQualified?${params.toString()}`,
      { headers: { Authorization: accessToken } }
    );
    return response;
  };

  const getAllValidReport = async (limit?: number, offset?: number) => {
    const params = new URLSearchParams();
    if (limit !== undefined) params.append("limit", limit.toString());
    if (offset !== undefined) params.append("offset", offset.toString());
    const response = await api.get<any>(`${API_URL}/report/valid?${params.toString()}`,
      { headers: { Authorization: accessToken } }
    );
    return response;
  };

  const getAllNeededValidationReport = async (limit?: number, offset?: number) => {
    const params = new URLSearchParams();
    if (limit !== undefined) params.append("limit", limit.toString());
    if (offset !== undefined) params.append("offset", offset.toString());
    const response = await api.get<any>(`${API_URL}/report/neededValidation?${params.toString()}`,
      { headers: { Authorization: accessToken } }
    );
    return response;
  };

  const getAllInvalidReport = async (limit?: number, offset?: number) => {
    const params = new URLSearchParams();
    if (limit !== undefined) params.append("limit", limit.toString());
    if (offset !== undefined) params.append("offset", offset.toString());
    const response = await api.get<any>(`${API_URL}/report/invalid?${params.toString()}`,
      { headers: { Authorization: accessToken } }
    );
    return response;
  };

  const getReportDetail = async (reportId:any) => {
    const response = await api.get<any>(`${API_URL}/report/detail/${reportId}`,
      { headers: { Authorization: accessToken } }
    );
    return response;
  };

  const manualVerify = useApiMutation<any, any>(
    "POST",
    `${API_URL}/report/manualVerify`,
    {
      mutationFn: async (data:any) => {
        return api.post<any>(`${API_URL}/report/manualVerify`, data, {
          headers: { Authorization: accessToken },
        });
      },
    }
  );

  return { getAllUnqualifiedReport, getReportDetail, manualVerify, getAllReport, getAllValidReport, getAllNeededValidationReport, getAllInvalidReport};
};
