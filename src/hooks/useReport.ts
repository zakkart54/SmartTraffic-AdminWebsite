import { api } from "../lib/queryClient";
import { API_URL } from "../lib/config"
import { useAuth } from "./useAuth";

export const useReport = () => {
  const { accessToken } = useAuth();
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
    console.log(response);
    return response;
  };

  return { getAllUnqualifiedReport, getReportDetail };
  
};
