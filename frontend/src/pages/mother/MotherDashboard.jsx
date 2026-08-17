import {
  Bell,
  Bot,
  CalendarDays,
  FileText,
  HeartPulse,
  Pill,
  Sparkles,
  Upload,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import AppLayout from "../../components/common/AppLayout";
import Card from "../../components/common/Card";
import StatCard from "../../components/common/StatCard";

import { useAuth } from "../../context/AuthContext";

import {
  getMotherAlerts,
  getMotherDashboard,
  getMotherMedicines,
  getMotherReports,
} from "../../services/motherService";

import "./MotherDashboard.css";


function formatDate(value) {
  if (!value) {
    return "Not scheduled";
  }

  return new Date(
    `${value}T00:00:00`
  ).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}


function formatRisk(value) {
  if (!value) {
    return "Unassessed";
  }

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}


export default function MotherDashboard() {
  const { user } = useAuth();

  const navigate = useNavigate();

  const [dashboard, setDashboard] =
    useState(null);

  const [medicines, setMedicines] =
    useState([]);

  const [reports, setReports] =
    useState([]);

  const [alerts, setAlerts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const results =
          await Promise.allSettled([
            getMotherDashboard(),
            getMotherMedicines(),
            getMotherReports(),
            getMotherAlerts(),
          ]);

        if (
          results[0].status ===
          "fulfilled"
        ) {
          setDashboard(
            results[0].value
          );
        } else {
          throw results[0].reason;
        }

        if (
          results[1].status ===
          "fulfilled"
        ) {
          setMedicines(
            results[1].value
          );
        }

        if (
          results[2].status ===
          "fulfilled"
        ) {
          setReports(
            results[2].value
          );
        }

        if (
          results[3].status ===
          "fulfilled"
        ) {
          setAlerts(
            results[3].value
          );
        }

      } catch (err) {
        console.error(err);

        setError(
          err?.response?.data?.detail ||
          "Unable to load your CareConnect dashboard."
        );

      } finally {
        setLoading(false);
      }
    }

    loadDashboard();

  }, []);


  if (loading) {
    return (
      <AppLayout
        role="mother"
        eyebrow="Mother workspace"
        title="CareConnect"
        description="Loading your pregnancy care plan..."
      >
        <div
          style={{
            padding: "40px",
            textAlign: "center",
          }}
        >
          Loading your care dashboard...
        </div>
      </AppLayout>
    );
  }


  const pregnancy =
    dashboard?.pregnancy;

  const nextANC =
    dashboard?.next_anc;

  const motherName =
    dashboard?.mother_name ||
    user?.full_name ||
    "Mother";

  const riskLevel =
    pregnancy?.risk_level ||
    "unassessed";

  const doctorReviewReports =
    reports.filter(
      (report) =>
        report.doctor_review_required
    ).length;

  const unreadAlerts =
    alerts.filter(
      (alert) =>
        !alert.is_read
    ).length;


  return (
    <AppLayout
      role="mother"
      eyebrow="Mother workspace"
      title={`Good day, ${motherName} 👋`}
      description="Your pregnancy care plan, reminders and follow-ups in one place."
    >

      {error && (
        <div
          style={{
            padding: "12px 16px",
            marginBottom: "16px",
            borderRadius: "12px",
            background: "#fff1f1",
            color: "#9b3a3a",
          }}
        >
          {error}
        </div>
      )}


      {/* REAL PREGNANCY SUMMARY */}

      {pregnancy ? (

        <section className="mother-summary glass">

          <div className="week-ring">
            <strong>
              {pregnancy.week}
            </strong>

            <span>
              weeks
            </span>
          </div>


          <div>
            <small>
              Pregnancy status
            </small>

            <h2>
              {pregnancy.status === "active"
                ? "Active Pregnancy"
                : pregnancy.status}
            </h2>

            <p>
              Expected delivery:{" "}
              {formatDate(
                pregnancy.edd
              )}
            </p>
          </div>


          <div className="risk-box">

            <small>
              Current CareConnect risk
            </small>

            <strong>
              {formatRisk(
                riskLevel
              )}{" "}
              risk
            </strong>

            <span>
              Decision-support assessment
            </span>

          </div>


          <button
            className="danger-outline"
            onClick={() =>
              navigate(
                "/mother/ai-care"
              )
            }
          >
            Check symptoms
          </button>

        </section>

      ) : (

        <section className="mother-summary glass">
          <div>
            <h2>
              Pregnancy record unavailable
            </h2>

            <p>
              Please contact your ASHA/ANM
              to register an active pregnancy.
            </p>
          </div>
        </section>

      )}


      {/* REAL STATISTICS */}

      <section className="stat-grid three">

        <StatCard
          icon={CalendarDays}
          label="Next ANC"
          value={
            nextANC
              ? formatDate(
                  nextANC.scheduled_date
                )
              : "Not scheduled"
          }
          hint={
            nextANC
              ? `ANC Visit ${nextANC.visit_number}`
              : "Contact your health worker"
          }
        />


        <StatCard
          icon={HeartPulse}
          label="Risk level"
          value={formatRisk(
            riskLevel
          )}
          hint="Latest CareConnect assessment"
          tone="blue"
        />


        <StatCard
          icon={FileText}
          label="Reports"
          value={String(
            reports.length
          )}
          hint={
            doctorReviewReports
              ? `${doctorReviewReports} awaiting doctor review`
              : "No pending doctor review"
          }
          tone="pink"
        />

      </section>


      {/* AI CARE */}

      <section className="ai-care-banner">

        <div className="ai-care-left">

          <div className="ai-care-icon">
            <Sparkles size={25} />
          </div>


          <div className="ai-care-copy">

            <small>
              <Bot size={14} />
              CARECONNECT AI
            </small>

            <h2>
              Your personal pregnancy
              care assistant
            </h2>

            <p>
              Ask questions, understand
              reports, check symptoms,
              prepare for doctor visits
              and receive smart alerts
              using your CareConnect
              health record.
            </p>


            <div className="ai-care-features">
              <span>💬 Ask AI</span>
              <span>🩺 Symptom Check</span>
              <span>📄 Report Analysis</span>
              <span>🧑‍⚕️ Doctor Prep</span>
              <span>🔔 Smart Alerts</span>
              <span>💊 Medicines</span>
            </div>

          </div>

        </div>


        <button
          className="ai-care-open"
          onClick={() =>
            navigate(
              "/mother/ai-care"
            )
          }
        >
          <Sparkles size={18} />
          Open AI Care
        </button>

      </section>


      {/* REAL CARE DATA */}

      <section className="content-grid three">

        <Card title="Active medicines">

          {medicines.length === 0 ? (

            <p>
              No active prescription
              available.
            </p>

          ) : (

            <div className="list">

              {medicines
                .slice(0, 4)
                .map((medicine) => (

                  <div
                    className="list-row"
                    key={
                      medicine.item_id
                    }
                  >

                    <Pill size={17} />

                    <div>

                      <strong>
                        {
                          medicine.medicine_name
                        }
                      </strong>

                      <span>
                        {
                          medicine.dosage
                        }{" "}
                        •{" "}
                        {
                          medicine.frequency
                        }
                      </span>

                    </div>

                  </div>

                ))}

            </div>

          )}

        </Card>


        <Card title="Care alerts">

          {alerts.length === 0 ? (

            <p>
              No active care alerts.
            </p>

          ) : (

            <div className="list">

              {alerts
                .slice(0, 4)
                .map((alert) => (

                  <div
                    className="list-row"
                    key={alert.id}
                  >

                    <Bell size={17} />

                    <div>

                      <strong>
                        {alert.title}
                      </strong>

                      <span>
                        {alert.message}
                      </span>

                    </div>

                    {!alert.is_read && (
                      <em className="badge warning">
                        New
                      </em>
                    )}

                  </div>

                ))}

            </div>

          )}

          {unreadAlerts > 0 && (
            <small>
              {unreadAlerts} unread care
              alert(s)
            </small>
          )}

        </Card>


        <Card
          title="Medical documents"
          action={`${reports.length} reports`}
        >

          <div className="upload-quick">

            <button
              onClick={() =>
                navigate(
                  "/mother/ai-care"
                )
              }
            >
              <Upload size={18} />

              <span>
                <strong>
                  Analyze report
                </strong>

                <small>
                  Upload PDF
                </small>
              </span>
            </button>


            <button
              onClick={() =>
                navigate(
                  "/mother/reports"
                )
              }
            >
              <FileText size={18} />

              <span>
                <strong>
                  View reports
                </strong>

                <small>
                  Medical history
                </small>
              </span>
            </button>

          </div>

        </Card>


        <Card
          title="Continuum of care"
          className="span-three"
        >

          <div className="care-steps">

            {[
              [
                "1",
                "Registered",
                "Done",
              ],
              [
                "2",
                "ANC visits",
                pregnancy
                  ? "Active"
                  : "Pending",
              ],
              [
                "3",
                "Delivery",
                "Upcoming",
              ],
              [
                "4",
                "Postnatal care",
                "Later",
              ],
              [
                "5",
                "Newborn",
                "Later",
              ],
              [
                "6",
                "Immunization",
                "Later",
              ],
            ].map(
              ([n, title, status], index) => (

                <div
                  className={
                    index < 2
                      ? "done-step"
                      : ""
                  }
                  key={title}
                >

                  <b>{n}</b>

                  <strong>
                    {title}
                  </strong>

                  <span>
                    {status}
                  </span>

                </div>

              )
            )}

          </div>

        </Card>

      </section>

    </AppLayout>
  );
}