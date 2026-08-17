import {
  useEffect,
  useState,
} from "react";

import {
  Search,
} from "lucide-react";

import AppLayout from "../../components/common/AppLayout";
import Card from "../../components/common/Card";

import {
  getDoctorPatients,
} from "../../services/doctorService";


export default function Patients() {

  const [patients, setPatients] =
    useState([]);

  const [q, setQ] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {

    const load = async () => {

      try {

        const data =
          await getDoctorPatients();

        setPatients(
          data?.patients || []
        );

      } catch (err) {

        console.error(err);

        setError(
          "Unable to load patients."
        );

      } finally {

        setLoading(false);
      }
    };

    load();

  }, []);


  const query =
    q.trim().toLowerCase();


  const rows =
    patients.filter((patient) => {

      if (!query) return true;

      return (
        patient.mother_name
          ?.toLowerCase()
          .includes(query) ||

        String(
          patient.mother_id
        ).includes(query) ||

        patient.phone
          ?.toLowerCase()
          .includes(query)
      );
    });


  const riskClass = (risk) => {

    const value =
      risk?.toLowerCase();

    if (value === "high")
      return "danger";

    if (
      value === "moderate" ||
      value === "medium"
    )
      return "warning";

    return "success";
  };


  const formatDate = (value) => {

    if (!value)
      return "—";

    return new Date(
      value
    ).toLocaleDateString(
      "en-IN"
    );
  };


  return (

    <AppLayout
      role="doctor"
      eyebrow="Patient registry"
      title="Patients"
      description="Active pregnancies from the CareConnect registry."
    >

      <Card title="Active patients">

        <div className="toolbar">

          <div className="search-input">

            <Search size={16} />

            <input
              value={q}
              onChange={(event) =>
                setQ(
                  event.target.value
                )
              }
              placeholder="Search name, ID or phone"
            />

          </div>

        </div>


        {loading && (
          <p>Loading patients...</p>
        )}


        {error && (
          <div className="notice">
            {error}
          </div>
        )}


        {!loading && !error && (

          <div className="table-wrap">

            <table>

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Patient</th>
                  <th>Week</th>
                  <th>Ward</th>
                  <th>EDD</th>
                  <th>Risk</th>
                </tr>
              </thead>


              <tbody>

                {rows.length === 0 && (

                  <tr>
                    <td colSpan="6">
                      No patients found.
                    </td>
                  </tr>

                )}


                {rows.map((patient) => (

                  <tr
                    key={
                      patient.pregnancy_id
                    }
                  >

                    <td>
                      #{patient.mother_id}
                    </td>


                    <td>

                      <strong>
                        {patient.mother_name}
                      </strong>

                      <span>
                        {patient.phone || "No phone"}
                      </span>

                    </td>


                    <td>
                      {patient.week}
                    </td>


                    <td>
                      Ward {patient.ward_id}
                    </td>


                    <td>
                      {formatDate(
                        patient.edd
                      )}
                    </td>


                    <td>

                      <em
                        className={
                          `badge ${riskClass(
                            patient.risk_level
                          )}`
                        }
                      >
                        {
                          patient.risk_level
                        }
                      </em>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </Card>

    </AppLayout>
  );
}