import {
  Search,
  UserPlus,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import AppLayout from "../../components/common/AppLayout";
import Card from "../../components/common/Card";

import {
  getPregnancies,
} from "../../services/fieldWorkerService";


function riskClass(value) {
  const risk =
    (value || "").toLowerCase();

  if (risk === "high") {
    return "danger";
  }

  if (risk === "moderate") {
    return "warning";
  }

  return "success";
}


export default function Patients() {
  const [query, setQuery] =
    useState("");

  const [patients, setPatients] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {
    async function loadPatients() {
      try {
        setLoading(true);

        const result =
          await getPregnancies();

        setPatients(
          result.patients || []
        );

      } catch (err) {
        console.error(err);

        setError(
          err?.response?.data?.detail ||
          "Unable to load pregnancy registry."
        );

      } finally {
        setLoading(false);
      }
    }

    loadPatients();
  }, []);


  const filtered =
    patients.filter((patient) => {

      const text =
        query.toLowerCase();

      return (
        patient.mother_name
          ?.toLowerCase()
          .includes(text) ||

        String(
          patient.mother_id
        ).includes(text) ||

        patient.phone
          ?.toLowerCase()
          .includes(text)
      );
    });


  return (
    <AppLayout
      role="field_worker"
      eyebrow="Beneficiary registry"
      title="Pregnancy Registry"
      description="Registered pregnancies from the CareConnect database."
    >

      <Card
        title="Registered beneficiaries"
        action={`${patients.length} active`}
      >

        <div className="toolbar">

          <div className="search-input">

            <Search size={16} />

            <input
              placeholder="Search by name, ID or phone"
              value={query}
              onChange={(event) =>
                setQuery(
                  event.target.value
                )
              }
            />

          </div>


          <button className="primary-small">

            <UserPlus size={16} />

            Register pregnancy

          </button>

        </div>


        {error && (
          <p>{error}</p>
        )}


        {loading ? (

          <p>
            Loading pregnancy registry...
          </p>

        ) : (

          <div className="table-wrap">

            <table>

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Week</th>
                  <th>Ward</th>
                  <th>Risk</th>
                  <th>EDD</th>
                </tr>
              </thead>


              <tbody>

                {filtered.map(
                  (patient) => (

                    <tr
                      key={
                        patient.pregnancy_id
                      }
                    >

                      <td>
                        CC-{patient.mother_id}
                      </td>


                      <td>

                        <strong>
                          {
                            patient.mother_name
                          }
                        </strong>

                        <span>
                          {patient.phone}
                        </span>

                      </td>


                      <td>
                        {
                          patient.pregnancy_week
                        }{" "}
                        weeks
                      </td>


                      <td>
                        Ward{" "}
                        {patient.ward_id}
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
                        {patient.edd}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </Card>

    </AppLayout>
  );
}