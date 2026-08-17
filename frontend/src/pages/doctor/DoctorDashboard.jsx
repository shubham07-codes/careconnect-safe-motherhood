import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ClipboardList,
  FileText,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import AppLayout from "../../components/common/AppLayout";
import Card from "../../components/common/Card";
import StatCard from "../../components/common/StatCard";

import {
  getDoctorDashboard,
} from "../../services/doctorService";


export default function DoctorDashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    const load = async () => {
      try {
        const result = await getDoctorDashboard();
        setData(result);
      } catch (err) {
        console.error(err);
        setError("Unable to load doctor dashboard.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);


  const formatDate = (value) => {
    if (!value) return "—";

    return new Date(value).toLocaleDateString(
      "en-IN"
    );
  };


  const stats = data?.stats || {};
  const patients = data?.high_risk_queue || [];
  const reports = data?.reports_pending || [];


  return (
    <AppLayout
      role="doctor"
      eyebrow="Clinical workspace"
      title="High-Risk Pregnancy Review"
      description="Real-time maternal care, reports and referral monitoring."
    >

      {loading && (
        <div className="notice">
          Loading clinical data...
        </div>
      )}

      {error && (
        <div className="notice">
          {error}
        </div>
      )}

      {!loading && (
        <>
          <section className="stat-grid four">

            <StatCard
              icon={Users}
              label="Active patients"
              value={stats.active_patients ?? 0}
              hint="Active pregnancies"
            />

            <StatCard
              icon={AlertTriangle}
              label="High-risk"
              value={stats.high_risk ?? 0}
              hint="Priority review"
              tone="pink"
            />

            <StatCard
              icon={ClipboardList}
              label="Open referrals"
              value={stats.pending_referrals ?? 0}
              hint="Needs follow-up"
              tone="blue"
            />

            <StatCard
              icon={FileText}
              label="Reports pending"
              value={stats.reports_pending ?? 0}
              hint="Doctor review"
              tone="orange"
            />

          </section>


          <section className="content-grid two-one">

            <Card title="High-risk priority queue">

              <div className="table-wrap">

                <table>

                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Week</th>
                      <th>Ward</th>
                      <th>Risk</th>
                      <th>EDD</th>
                      <th></th>
                    </tr>
                  </thead>

                  <tbody>

                    {patients.length === 0 && (
                      <tr>
                        <td colSpan="6">
                          No high-risk patients.
                        </td>
                      </tr>
                    )}

                    {patients.map((patient) => (
                      <tr key={patient.pregnancy_id}>

                        <td>
                          <strong>
                            {patient.mother_name}
                          </strong>

                          <span>
                            ID #{patient.mother_id}
                          </span>
                        </td>

                        <td>
                          {patient.week}
                        </td>

                        <td>
                          Ward {patient.ward_id}
                        </td>

                        <td>
                          <em className="badge danger">
                            {patient.risk_level}
                          </em>
                        </td>

                        <td>
                          {formatDate(patient.edd)}
                        </td>

                        <td>
                          <button
                            className="mini-btn"
                            onClick={() =>
                              navigate(
                                "/doctor/high-risk"
                              )
                            }
                          >
                            Review
                          </button>
                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>

            </Card>


            <Card title="Reports pending">

              <div className="list">

                {reports.length === 0 && (
                  <p>No reports pending.</p>
                )}

                {reports.map((report) => (
                  <div
                    className="list-row"
                    key={report.report_id}
                  >

                    <FileText size={17} />

                    <div>
                      <strong>
                        {report.mother_name}
                      </strong>

                      <span>
                        {report.filename}
                      </span>
                    </div>

                    <button
                      className="mini-btn"
                      onClick={() =>
                        navigate(
                          "/doctor/reports"
                        )
                      }
                    >
                      Review
                    </button>

                  </div>
                ))}

              </div>

            </Card>

          </section>
        </>
      )}

    </AppLayout>
  );
}