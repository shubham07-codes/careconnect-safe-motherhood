import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/common/ProtectedRoute";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import RoleSelection from "./pages/auth/RoleSelection";

import MotherDashboard from "./pages/mother/MotherDashboard";
import MyPregnancy from "./pages/mother/MyPregnancy";
import ANCCalendar from "./pages/mother/ANCCalendar";
import Medicines from "./pages/mother/Medicines";
import Nutrition from "./pages/mother/Nutrition";
import MyReports from "./pages/mother/MyReports";
import Newborn from "./pages/mother/Newborn";
import Reminders from "./pages/mother/Reminders";

import FieldWorkerDashboard from "./pages/field_worker/FieldWorkerDashboard";
import FieldPatients from "./pages/field_worker/Patients";
import ANCDueList from "./pages/field_worker/ANCDueList";
import FieldHighRisk from "./pages/field_worker/HighRiskCases";
import MissedVisits from "./pages/field_worker/MissedVisits";
import FollowUps from "./pages/field_worker/FollowUps";
import FieldReferrals from "./pages/field_worker/Referrals";

import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorPatients from "./pages/doctor/Patients";
import DoctorHighRisk from "./pages/doctor/HighRiskCases";
import DoctorReports from "./pages/doctor/Reports";
import DoctorAppointments from "./pages/doctor/Appointments";
import DoctorReferrals from "./pages/doctor/Referrals";
import DoctorPrescriptions from "./pages/doctor/Prescriptions";
import PostnatalCases from "./pages/doctor/PostnatalCases";

import OfficerDashboard from "./pages/officer/OfficerDashboard";
import MCHIndicators from "./pages/officer/MCHIndicators";
import WardAnalytics from "./pages/officer/WardAnalytics";
import RiskOverview from "./pages/officer/RiskOverview";
import ImmunizationOverview from "./pages/officer/ImmunizationOverview";
import AICare from "./pages/mother/AICare";

const guard = (role, element) => <ProtectedRoute role={role}>{element}</ProtectedRoute>;

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/select-role" element={<ProtectedRoute><RoleSelection /></ProtectedRoute>} />

      <Route path="/mother" element={guard("mother", <MotherDashboard />)} />
      <Route path="/mother/pregnancy" element={guard("mother", <MyPregnancy />)} />
      <Route path="/mother/anc-calendar" element={guard("mother", <ANCCalendar />)} />
      <Route path="/mother/medicines" element={guard("mother", <Medicines />)} />
      <Route path="/mother/nutrition" element={guard("mother", <Nutrition />)} />
      <Route path="/mother/reports" element={guard("mother", <MyReports />)} />
      <Route path="/mother/newborn" element={guard("mother", <Newborn />)} />
      <Route path="/mother/reminders" element={guard("mother", <Reminders />)} />
      <Route path="/mother/ai-care" element={guard("mother", <AICare />)} />

      <Route path="/field-worker" element={guard("field_worker", <FieldWorkerDashboard />)} />
      <Route path="/field-worker/patients" element={guard("field_worker", <FieldPatients />)} />
      <Route path="/field-worker/anc-due" element={guard("field_worker", <ANCDueList />)} />
      <Route path="/field-worker/high-risk" element={guard("field_worker", <FieldHighRisk />)} />
      <Route path="/field-worker/missed-visits" element={guard("field_worker", <MissedVisits />)} />
      <Route path="/field-worker/follow-ups" element={guard("field_worker", <FollowUps />)} />
      <Route path="/field-worker/referrals" element={guard("field_worker", <FieldReferrals />)} />

      <Route path="/doctor" element={guard("doctor", <DoctorDashboard />)} />
      <Route path="/doctor/patients" element={guard("doctor", <DoctorPatients />)} />
      <Route path="/doctor/high-risk" element={guard("doctor", <DoctorHighRisk />)} />
      <Route path="/doctor/reports" element={guard("doctor", <DoctorReports />)} />
      <Route path="/doctor/appointments" element={guard("doctor", <DoctorAppointments />)} />
      <Route path="/doctor/referrals" element={guard("doctor", <DoctorReferrals />)} />
      <Route path="/doctor/postnatal" element={guard("doctor", <PostnatalCases />)} />
      <Route path="/doctor/prescriptions" element={guard("doctor", <DoctorPrescriptions />)} />

      <Route path="/officer" element={guard("officer", <OfficerDashboard />)} />
      <Route path="/officer/indicators" element={guard("officer", <MCHIndicators />)} />
      <Route path="/officer/wards" element={guard("officer", <WardAnalytics />)} />
      <Route path="/officer/risk" element={guard("officer", <RiskOverview />)} />
      <Route path="/officer/immunization" element={guard("officer", <ImmunizationOverview />)} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
