import api from "./api";

// ---------------- AI CHAT ----------------

export async function askCareConnectAI(question) {
  const response = await api.post(
    "/api/mother/ai-care/ask",
    { question }
  );

  return response.data;
}

export async function getAIChatHistory() {
  const response = await api.get(
    "/api/mother/ai-care/history"
  );

  return response.data;
}


// ---------------- SYMPTOMS ----------------

export async function checkSymptoms(symptoms, notes = "") {
  const response = await api.post(
    "/api/mother/symptoms/triage",
    {
      symptoms,
      notes,
    }
  );

  return response.data;
}


// ---------------- REPORTS ----------------

export async function uploadMedicalReport(file) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post(
    "/api/mother/reports/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}


// ---------------- DOCTOR PREP ----------------

export async function generateDoctorPrep(
  extraConcern = ""
) {
  const response = await api.post(
    "/api/mother/doctor-prep/generate",
    {
      extra_concern:
        extraConcern.trim() || null,
    }
  );

  return response.data;
}


// ---------------- ALERTS ----------------

export async function getSmartAlerts() {
  const response = await api.get(
    "/api/mother/alerts"
  );

  return response.data;
}

export async function generateSmartAlerts() {
  const response = await api.post(
    "/api/mother/alerts/generate"
  );

  return response.data;
}


// ---------------- MEDICINES ----------------

export async function getMyMedicines() {
  const response = await api.get(
    "/api/mother/medicines"
  );

  return response.data;
}

export async function explainMedicine(itemId) {
  const response = await api.post(
    `/api/mother/medicines/${itemId}/explain`
  );

  return response.data;
}