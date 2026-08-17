import api from "./api";


export const getOfficerDashboard = async (
  wardId = null
) => {
  const response = await api.get(
    "/api/officer/dashboard",
    {
      params: wardId
        ? { ward_id: wardId }
        : {},
    }
  );

  return response.data;
};


export const getWardAnalytics = async () => {
  const response = await api.get(
    "/api/officer/wards"
  );

  return response.data;
};