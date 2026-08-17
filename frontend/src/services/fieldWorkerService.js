import api from "./api";


export async function getDueToday() {
  const response = await api.get(
    "/api/field-worker/anc/due-list"
  );

  return response.data;
}


export async function getMissedVisits() {
  const response = await api.get(
    "/api/field-worker/anc/missed"
  );

  return response.data;
}


export async function getHighRiskCases() {
  const response = await api.get(
    "/api/field-worker/anc/high-risk"
  );

  return response.data;
}


export async function getPriorityQueue() {
  const response = await api.get(
    "/api/field-worker/anc/priority-queue"
  );

  return response.data;
}


export async function getFieldWorkerAlerts() {
  const response = await api.get(
    "/api/field-worker/alerts"
  );

  return response.data;
}


export async function getPregnancies() {
  const response = await api.get(
    "/api/field-worker/pregnancies"
  );

  return response.data;
}