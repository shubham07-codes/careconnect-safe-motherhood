import {
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  BrainCircuit,
  ClipboardCheck,
} from "lucide-react";

import AppLayout from "../../components/common/AppLayout";
import Card from "../../components/common/Card";

import {
  getHighRiskPatients,
} from "../../services/doctorService";


export default function HighRiskCases() {

  const [patients, setPatients] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {

    const load = async () => {

      try {

        const data =
          await getHighRiskPatients();

        setPatients(
          data?.patients || []
        );

      } catch (err) {

        console.error(err);

        setError(
          "Unable to load high-risk cases."
        );

      } finally {

        setLoading(false);
      }
    };

    load();

  }, []);


  return (

    <AppLayout
      role="doctor"
      eyebrow="Hybrid risk stratification"
      title="High-Risk Cases"
      description="Patients identified for priority clinical review."
    >

      {loading && (
        <p>Loading high-risk cases...</p>
      )}


      {error && (
        <div className="notice">
          {error}
        </div>
      )}


      {!loading &&
        !error &&
        patients.length === 0 && (

          <Card>
            <p>
              No high-risk pregnancies
              currently detected.
            </p>
          </Card>

        )}


      <div className="risk-cards doctor-risk">

        {patients.map((patient) => (

          <Card
            key={patient.pregnancy_id}
          >

            <div className="risk-card-head">

              <AlertTriangle
                size={20}
              />

              <em className="badge danger">
                HIGH RISK
              </em>

            </div>


            <h3>
              {patient.mother_name}
            </h3>


            <p>
              {patient.week} weeks
              {" • "}
              Ward {patient.ward_id}
            </p>


            <div className="risk-reason">

              <span>
                Clinical context
              </span>

              <strong>
                {
                  patient.previous_complications
                    ? "Previous pregnancy complications recorded"
                    : "Risk factors detected by CareConnect risk engine"
                }
              </strong>

            </div>


            <div className="split-note">

              <BrainCircuit
                size={17}
              />

              <span>
                Hybrid risk engine
              </span>

            </div>


            <button
              className="primary-small full"
            >

              <ClipboardCheck
                size={15}
              />

              Review case

            </button>

          </Card>
        ))}

      </div>


      <div className="notice top-gap">

        <BrainCircuit size={20} />

        <div>

          <strong>
            Clinical guardrail
          </strong>

          <p>
            CareConnect prioritizes
            cases for review. Final
            diagnosis and treatment
            remain with qualified
            healthcare professionals.
          </p>

        </div>

      </div>

    </AppLayout>
  );
}