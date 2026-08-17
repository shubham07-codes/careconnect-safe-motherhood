import {
  AlertTriangle,
  CalendarCheck,
  Clock3,
  HeartPulse,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import AppLayout from "../../components/common/AppLayout";
import Card from "../../components/common/Card";
import StatCard from "../../components/common/StatCard";

import {
  getDueToday,
  getHighRiskCases,
  getMissedVisits,
  getPriorityQueue,
} from "../../services/fieldWorkerService";


function riskClass(risk) {
  const value =
    (risk || "").toLowerCase();

  if (value === "high") {
    return "danger";
  }

  if (value === "moderate") {
    return "warning";
  }

  return "success";
}


export default function FieldWorkerDashboard() {
  const navigate = useNavigate();

  const [due, setDue] =
    useState({
      total_due: 0,
      patients: [],
    });

  const [highRisk, setHighRisk] =
    useState({
      total: 0,
      patients: [],
    });

  const [missed, setMissed] =
    useState({
      total_missed: 0,
      patients: [],
    });

  const [priority, setPriority] =
    useState({
      total: 0,
      patients: [],
    });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const results =
          await Promise.allSettled([
            getDueToday(),
            getHighRiskCases(),
            getMissedVisits(),
            getPriorityQueue(),
          ]);

        if (
          results[0].status === "fulfilled"
        ) {
          setDue(results[0].value);
        }

        if (
          results[1].status === "fulfilled"
        ) {
          setHighRisk(results[1].value);
        }

        if (
          results[2].status === "fulfilled"
        ) {
          setMissed(results[2].value);
        }

        if (
          results[3].status === "fulfilled"
        ) {
          setPriority(results[3].value);
        }

        if (
          results.every(
            (item) =>
              item.status === "rejected"
          )
        ) {
          throw results[0].reason;
        }

      } catch (err) {
        console.error(err);

        setError(
          err?.response?.data?.detail ||
          "Unable to load field worker data."
        );

      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);


  return (
    <AppLayout
      role="field_worker"
      eyebrow="ANM / ASHA workspace"
      title="Today's Field Plan"
      description="Prioritised ANC due-list, high-risk follow-ups and missed visits."
    >

      {error && (
        <div
          style={{
            padding: "12px 16px",
            marginBottom: "16px",
            borderRadius: "12px",
            background: "#fff1f1",
            color: "#983b3b",
          }}
        >
          {error}
        </div>
      )}


      <section className="stat-grid four">

        <StatCard
          icon={CalendarCheck}
          label="ANC due today"
          value={String(
            due.total_due || 0
          )}
          hint="Today's pending visits"
        />

        <StatCard
          icon={AlertTriangle}
          label="High-risk"
          value={String(
            highRisk.total || 0
          )}
          hint="Priority pregnancies"
          tone="pink"
        />

        <StatCard
          icon={Clock3}
          label="Missed visits"
          value={String(
            missed.total_missed || 0
          )}
          hint="Follow-up needed"
          tone="orange"
        />

        <StatCard
          icon={HeartPulse}
          label="Priority queue"
          value={String(
            priority.total || 0
          )}
          hint="Care Priority Engine"
          tone="green"
        />

      </section>


      <section className="content-grid two-one">

        <Card
          title="AI Care Priority Queue"
          action="Highest priority first"
        >

          {loading ? (
            <p>Loading priority cases...</p>
          ) : priority.patients?.length === 0 ? (
            <p>
              No overdue priority cases.
            </p>
          ) : (

            <div className="table-wrap">

              <table>

                <thead>
                  <tr>
                    <th>Beneficiary</th>
                    <th>Due</th>
                    <th>Risk</th>
                    <th>Priority</th>
                    <th></th>
                  </tr>
                </thead>


                <tbody>

                  {priority.patients
                    ?.slice(0, 6)
                    .map((patient) => (

                      <tr
                        key={
                          patient.anc_visit_id
                        }
                      >

                        <td>
                          <strong>
                            {
                              patient.mother_name
                            }
                          </strong>

                          <span>
                            ID:{" "}
                            {
                              patient.mother_id
                            }
                          </span>
                        </td>


                        <td>
                          {
                            patient.scheduled_date
                          }
                        </td>


                        <td>
                          <em
                            className={`badge ${riskClass(
                              patient.risk_level
                            )}`}
                          >
                            {
                              patient.risk_level ||
                              "Unassessed"
                            }
                          </em>
                        </td>


                        <td>
                          <strong>
                            {
                              patient.priority_score
                            }
                          </strong>

                          <span>
                            {
                              patient.priority_level
                            }
                          </span>
                        </td>


                        <td>
                          <button
                            className="mini-btn"
                            onClick={() =>
                              navigate(
                                "/field-worker/follow-ups"
                              )
                            }
                          >
                            Follow up
                          </button>
                        </td>

                      </tr>

                    ))}

                </tbody>

              </table>

            </div>
          )}

        </Card>


        <Card title="Priority actions">

          <div className="action-list">

            <button
              onClick={() =>
                navigate(
                  "/field-worker/patients"
                )
              }
            >
              <strong>
                Pregnancy Registry
              </strong>

              <span>
                View registered mothers
              </span>
            </button>


            <button
              onClick={() =>
                navigate(
                  "/field-worker/anc-due"
                )
              }
            >
              <strong>
                Record ANC visit
              </strong>

              <span>
                Vitals + ANC completion
              </span>
            </button>


            <button
              onClick={() =>
                navigate(
                  "/field-worker/high-risk"
                )
              }
            >
              <strong>
                High-risk cases
              </strong>

              <span>
                Review priority mothers
              </span>
            </button>


            <button
              onClick={() =>
                navigate(
                  "/field-worker/missed-visits"
                )
              }
            >
              <strong>
                Missed visits
              </strong>

              <span>
                Start follow-up workflow
              </span>
            </button>

          </div>

        </Card>

      </section>

    </AppLayout>
  );
}