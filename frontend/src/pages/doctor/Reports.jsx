import {
  useEffect,
  useState,
} from "react";

import {
  BrainCircuit,
  CheckCircle2,
  FileText,
} from "lucide-react";

import AppLayout from "../../components/common/AppLayout";
import Card from "../../components/common/Card";

import {
  getDoctorReports,
  markReportReviewed,
} from "../../services/doctorService";


export default function Reports() {

  const [reports, setReports] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [reviewing, setReviewing] =
    useState(null);

  const [error, setError] =
    useState("");


  const load = async () => {

    try {

      const data =
        await getDoctorReports();

      setReports(data || []);

    } catch (err) {

      console.error(err);

      setError(
        "Unable to load reports."
      );

    } finally {

      setLoading(false);
    }
  };


  useEffect(() => {
    load();
  }, []);


  const review = async (
    reportId
  ) => {

    try {

      setReviewing(reportId);

      await markReportReviewed(
        reportId
      );

      await load();

    } catch (err) {

      console.error(err);

      alert(
        "Unable to mark report reviewed."
      );

    } finally {

      setReviewing(null);
    }
  };


  const urgencyClass = (
    urgency
  ) => {

    const value =
      urgency?.toLowerCase();

    if (
      value === "high" ||
      value === "urgent"
    )
      return "danger";

    if (
      value === "medium" ||
      value === "moderate"
    )
      return "warning";

    return "success";
  };


  return (

    <AppLayout
      role="doctor"
      eyebrow="AI-assisted report review"
      title="Medical Reports"
      description="Review AI-generated summaries and clinical findings."
    >

      {loading && (
        <p>Loading reports...</p>
      )}


      {error && (
        <div className="notice">
          {error}
        </div>
      )}


      <div className="risk-cards">

        {reports.map((report) => (

          <Card
            key={report.report_id}
          >

            <div className="risk-card-head">

              <FileText size={20} />

              <em
                className={
                  `badge ${urgencyClass(
                    report.urgency
                  )}`
                }
              >
                {
                  report.urgency ||
                  "unassessed"
                }
              </em>

            </div>


            <h3>
              {report.mother_name}
            </h3>


            <p>
              {report.filename}
            </p>


            <div className="risk-reason">

              <span>
                AI Summary
              </span>

              <strong>
                {
                  report.summary ||
                  "No AI summary available."
                }
              </strong>

            </div>


            {report.findings && (

              <div className="split-note">

                <BrainCircuit
                  size={17}
                />

                <span>
                  {report.findings}
                </span>

              </div>

            )}


            {report.precautions && (

              <p>
                <strong>
                  Guidance:
                </strong>{" "}
                {report.precautions}
              </p>

            )}


            {report.doctor_review_required ? (

              <button
                className="primary-small full"
                disabled={
                  reviewing ===
                  report.report_id
                }
                onClick={() =>
                  review(
                    report.report_id
                  )
                }
              >

                <CheckCircle2
                  size={15}
                />

                {
                  reviewing ===
                  report.report_id
                    ? "Updating..."
                    : "Mark Reviewed"
                }

              </button>

            ) : (

              <div className="split-note">

                <CheckCircle2
                  size={17}
                />

                <span>
                  Reviewed by doctor
                </span>

              </div>

            )}

          </Card>

        ))}

      </div>


      {!loading &&
        reports.length === 0 && (

          <Card>
            <p>
              No reports uploaded yet.
            </p>
          </Card>

        )}

    </AppLayout>
  );
}