export const motherProfile = {
  name: "Priya Deshmukh",
  week: 28,
  trimester: "Third trimester",
  edd: "23 August 2026",
  risk: "Moderate",
  bloodGroup: "B+",
  facility: "Urban Primary Health Centre - Ward 12",
  phone: "+91 98XXXXXX12",
};

export const ancVisits = [
  { id: 1, title: "Registration & ANC-1", date: "12 Mar 2026", status: "completed", notes: "Initial assessment completed" },
  { id: 2, title: "ANC-2", date: "09 Apr 2026", status: "completed", notes: "Vitals stable" },
  { id: 3, title: "ANC-3", date: "07 May 2026", status: "completed", notes: "Hb monitoring advised" },
  { id: 4, title: "ANC-4", date: "28 May 2026", status: "upcoming", notes: "Routine ANC follow-up" },
  { id: 5, title: "ANC-5", date: "18 Jun 2026", status: "scheduled", notes: "Planned follow-up" },
  { id: 6, title: "ANC-6", date: "09 Jul 2026", status: "scheduled", notes: "Planned follow-up" },
  { id: 7, title: "ANC-7", date: "30 Jul 2026", status: "scheduled", notes: "Planned follow-up" },
  { id: 8, title: "ANC-8", date: "13 Aug 2026", status: "scheduled", notes: "Planned follow-up" },
];

export const medicines = [
  { id: 1, name: "Iron + Folic Acid", instruction: "After breakfast", time: "10:30 AM", done: true },
  { id: 2, name: "Calcium", instruction: "After lunch", time: "2:00 PM", done: false },
  { id: 3, name: "Doctor-prescribed supplement", instruction: "After dinner", time: "8:30 PM", done: false },
];

export const meals = [
  { id: 1, name: "Breakfast", time: "8:00 AM", items: "Poha + fruit + milk", done: true },
  { id: 2, name: "Lunch", time: "1:00 PM", items: "Dal + rice + vegetables + curd", done: false },
  { id: 3, name: "Evening snack", time: "5:00 PM", items: "Fruit + roasted chana", done: false },
  { id: 4, name: "Dinner", time: "8:00 PM", items: "Roti + dal + seasonal vegetables", done: false },
];

export const fieldPatients = [
  { id: "CC-1001", name: "Priya Deshmukh", week: 28, anc: "ANC-4", due: "Today 10:00 AM", risk: "High", reason: "High BP + low Hb", ward: "12" },
  { id: "CC-1002", name: "Sneha Patil", week: 32, anc: "ANC-6", due: "Today 11:30 AM", risk: "High", reason: "Gestational diabetes flag", ward: "12" },
  { id: "CC-1003", name: "Kavita More", week: 24, anc: "ANC-4", due: "Today 2:00 PM", risk: "Moderate", reason: "Previous complication", ward: "12" },
  { id: "CC-1004", name: "Aarti Jadhav", week: 36, anc: "ANC-8", due: "Missed yesterday", risk: "High", reason: "Severe anaemia flag", ward: "12" },
  { id: "CC-1005", name: "Meena Rathod", week: 30, anc: "ANC-5", due: "Tomorrow", risk: "Low", reason: "Routine follow-up", ward: "12" },
];

export const doctorPatients = [
  { id: "CC-1001", name: "Priya Deshmukh", week: 28, risk: "High", score: 89, reason: "High BP + low Hb", facility: "UPHC Ward 12" },
  { id: "CC-1002", name: "Sneha Patil", week: 32, risk: "High", score: 84, reason: "Gestational diabetes flag", facility: "UPHC Ward 12" },
  { id: "CC-1003", name: "Kavita More", week: 24, risk: "Moderate", score: 67, reason: "Previous complication", facility: "Health Post 3" },
  { id: "CC-1004", name: "Aarti Jadhav", week: 36, risk: "High", score: 86, reason: "Severe anaemia flag", facility: "UPHC Ward 8" },
  { id: "CC-1005", name: "Meena Rathod", week: 30, risk: "Low", score: 28, reason: "Routine follow-up", facility: "Health Post 2" },
];

export const reports = [
  { id: 1, patient: "Priya Deshmukh", type: "CBC Report", date: "Today", status: "Pending review" },
  { id: 2, patient: "Sneha Patil", type: "Blood Sugar", date: "Today", status: "Pending review" },
  { id: 3, patient: "Kavita More", type: "Ultrasound", date: "Yesterday", status: "Reviewed" },
  { id: 4, patient: "Aarti Jadhav", type: "CBC Report", date: "Yesterday", status: "Flagged" },
];

export const reminders = [
  { id: 1, patient: "Priya Deshmukh", channel: "WhatsApp", language: "Marathi", type: "ANC visit", status: "Delivered" },
  { id: 2, patient: "Sneha Patil", channel: "SMS", language: "Hindi", type: "Medicine", status: "Delivered" },
  { id: 3, patient: "Aarti Jadhav", channel: "Call", language: "Marathi", type: "Missed ANC", status: "Follow-up" },
];

export const wardIndicators = [
  { label: "Early pregnancy registration", value: 86 },
  { label: "ANC coverage", value: 91 },
  { label: "4+ ANC contacts", value: 82 },
  { label: "High-risk follow-up", value: 90 },
  { label: "Institutional delivery", value: 96 },
  { label: "PNC within 48 hours", value: 84 },
  { label: "Full immunization", value: 88 },
  { label: "Low-birth-weight follow-up", value: 79 },
];

export const wardRows = [
  { ward: "Ward 12", pregnancies: 326, highRisk: 46, anc: 93, delivery: 97, immunization: 91 },
  { ward: "Ward 8", pregnancies: 281, highRisk: 33, anc: 89, delivery: 95, immunization: 86 },
  { ward: "Ward 5", pregnancies: 244, highRisk: 21, anc: 92, delivery: 96, immunization: 88 },
  { ward: "Ward 3", pregnancies: 218, highRisk: 28, anc: 87, delivery: 94, immunization: 84 },
];
