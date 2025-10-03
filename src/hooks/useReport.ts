import { api, useApiMutation } from "../lib/queryClient";
import { API_URL } from "../lib/config"
import { useAuth } from "./useAuth";

export const useReport = () => {
  const { accessToken } = useAuth();

  const getAllReport = async () => {
    console.log("Fetching all reports with access token:", accessToken);
    const response = await api.get<any>(`${API_URL}/report/`,
      { headers: { Authorization: accessToken } }
    );
    return response;
  };

  const getAllUnqualifiedReport = async () => {
    const response = await api.get<any>(`${API_URL}/report/notQualified`,
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

  return { getAllUnqualifiedReport, getReportDetail, manualVerify, getAllReport };
};
