import api from "./api";


export const getDoctorDashboard = async () => {
  const response = await api.get(
    "/api/doctor/dashboard"
  );

  return response.data;
};


export const getDoctorPatients = async (
  params = {}
) => {
  const response = await api.get(
    "/api/doctor/patients",
    {
      params,
    }
  );

  return response.data;
};


export const getHighRiskPatients = async () => {
  const response = await api.get(
    "/api/doctor/patients",
    {
      params: {
        risk_level: "high",
      },
    }
  );

  return response.data;
};


export const getDoctorReports = async () => {
  const response = await api.get(
    "/api/doctor/reports"
  );

  return response.data;
};


export const markReportReviewed = async (
  reportId
) => {
  const response = await api.patch(
    `/api/doctor/reports/${reportId}/review`
  );

  return response.data;
};


export const getDoctorReferrals = async (
  statusFilter
) => {

  const response = await api.get(
    "/api/doctor/referrals",
    {
      params: statusFilter
        ? {
            status_filter:
              statusFilter,
          }
        : {},
    }
  );

  return response.data;
};


export const updateReferral = async (
  referralId,
  status
) => {

  const response = await api.patch(
    `/api/doctor/referrals/${referralId}`,
    {
      status,
    }
  );

  return response.data;
};


export const createPrescription = async (
  payload
) => {

  const response = await api.post(
    "/api/doctor/prescriptions",
    payload
  );

  return response.data;
};


export const getPrescriptions = async (
  motherId
) => {

  const response = await api.get(
    "/api/doctor/prescriptions",
    {
      params: {
        mother_id: motherId,
      },
    }
  );

  return response.data;
};