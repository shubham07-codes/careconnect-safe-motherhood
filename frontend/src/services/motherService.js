import api from "./api";


export async function getMotherDashboard() {
  const response = await api.get(
    "/api/mother/dashboard"
  );

  return response.data;
}


export async function getMotherReports() {
  const response = await api.get(
    "/api/mother/reports"
  );

  return response.data;
}


export async function getMotherMedicines() {
  const response = await api.get(
    "/api/mother/medicines"
  );

  return response.data;
}


export async function getMotherAlerts() {
  const response = await api.get(
    "/api/mother/alerts"
  );

  return response.data;
}