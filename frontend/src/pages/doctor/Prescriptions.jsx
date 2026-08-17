import {
  useEffect,
  useState,
} from "react";

import {
  Pill,
  Plus,
} from "lucide-react";

import AppLayout from "../../components/common/AppLayout";
import Card from "../../components/common/Card";

import {
  createPrescription,
  getDoctorPatients,
  getPrescriptions,
} from "../../services/doctorService";


export default function Prescriptions() {
  const [patients, setPatients] = useState([]);
  const [selectedMother, setSelectedMother] = useState("");
  const [history, setHistory] = useState([]);

  const [medicineName, setMedicineName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [timing, setTiming] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");


  useEffect(() => {
    const loadPatients = async () => {
      try {
        const data = await getDoctorPatients();

        setPatients(
          data?.patients || []
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, []);


  const loadHistory = async (motherId) => {
    if (!motherId) {
      setHistory([]);
      return;
    }

    try {
      const data = await getPrescriptions(
        motherId
      );

      setHistory(data || []);
    } catch (error) {
      console.error(error);
      setHistory([]);
    }
  };


  const handleMotherChange = async (event) => {
    const value = event.target.value;

    setSelectedMother(value);

    await loadHistory(value);
  };


  const selectedPatient =
    patients.find(
      (patient) =>
        String(patient.mother_id) ===
        String(selectedMother)
    );


  const submitPrescription = async (event) => {
    event.preventDefault();

    setMessage("");

    if (
      !selectedMother ||
      !medicineName.trim() ||
      !dosage.trim() ||
      !frequency.trim()
    ) {
      setMessage(
        "Select patient and complete medicine details."
      );

      return;
    }

    try {
      setSaving(true);

      await createPrescription({
        mother_id: Number(
          selectedMother
        ),

        pregnancy_id:
          selectedPatient?.pregnancy_id ||
          null,

        notes:
          notes.trim() || null,

        medicines: [
          {
            medicine_name:
              medicineName.trim(),

            dosage:
              dosage.trim(),

            frequency:
              frequency.trim(),

            timing_instructions:
              timing.trim() || null,

            start_date: null,
            end_date: null,
          },
        ],
      });

      setMedicineName("");
      setDosage("");
      setFrequency("");
      setTiming("");
      setNotes("");

      setMessage(
        "Prescription saved successfully."
      );

      await loadHistory(
        selectedMother
      );

    } catch (error) {
      console.error(error);

      setMessage(
        error?.response?.data?.detail ||
        "Unable to create prescription."
      );

    } finally {
      setSaving(false);
    }
  };


  return (
    <AppLayout
      role="doctor"
      eyebrow="Clinical prescription"
      title="Prescriptions"
      description="Create and review doctor-entered prescriptions."
    >

      <section className="content-grid two-one">

        <Card title="Create prescription">

          <form
            onSubmit={
              submitPrescription
            }
          >

            <div className="input-box">
              <label>
                Patient
              </label>

              <select
                value={
                  selectedMother
                }
                onChange={
                  handleMotherChange
                }
                disabled={
                  loading
                }
              >

                <option value="">
                  Select patient
                </option>

                {patients.map(
                  (patient) => (

                    <option
                      key={
                        patient.mother_id
                      }
                      value={
                        patient.mother_id
                      }
                    >
                      {
                        patient.mother_name
                      }
                      {" — "}
                      Week {
                        patient.week
                      }
                      {" — "}
                      {
                        patient.risk_level
                      }
                    </option>

                  )
                )}

              </select>
            </div>


            <div className="input-box">
              <label>
                Medicine
              </label>

              <input
                value={
                  medicineName
                }
                onChange={(event) =>
                  setMedicineName(
                    event.target.value
                  )
                }
                placeholder="Example: Iron tablet"
              />
            </div>


            <div className="input-box">
              <label>
                Dosage
              </label>

              <input
                value={
                  dosage
                }
                onChange={(event) =>
                  setDosage(
                    event.target.value
                  )
                }
                placeholder="Example: 1 tablet"
              />
            </div>


            <div className="input-box">
              <label>
                Frequency
              </label>

              <input
                value={
                  frequency
                }
                onChange={(event) =>
                  setFrequency(
                    event.target.value
                  )
                }
                placeholder="Example: Once daily"
              />
            </div>


            <div className="input-box">
              <label>
                Timing instructions
              </label>

              <input
                value={
                  timing
                }
                onChange={(event) =>
                  setTiming(
                    event.target.value
                  )
                }
                placeholder="Example: After dinner"
              />
            </div>


            <div className="input-box">
              <label>
                Doctor notes
              </label>

              <textarea
                value={
                  notes
                }
                onChange={(event) =>
                  setNotes(
                    event.target.value
                  )
                }
                placeholder="Optional clinical notes"
                rows="3"
              />
            </div>


            {message && (
              <div className="notice">
                {message}
              </div>
            )}


            <button
              className="primary-small full"
              type="submit"
              disabled={
                saving
              }
            >
              <Plus size={16} />

              {
                saving
                  ? "Saving..."
                  : "Create Prescription"
              }
            </button>

          </form>

        </Card>


        <Card title="Patient">

          {!selectedPatient ? (

            <p>
              Select a patient to view
              prescription history.
            </p>

          ) : (

            <div>

              <h3>
                {
                  selectedPatient
                    .mother_name
                }
              </h3>

              <p>
                Week{" "}
                {
                  selectedPatient.week
                }
              </p>

              <p>
                Ward{" "}
                {
                  selectedPatient.ward_id
                }
              </p>

              <p>
                Risk:{" "}
                <strong>
                  {
                    selectedPatient
                      .risk_level
                  }
                </strong>
              </p>

            </div>

          )}

        </Card>

      </section>


      <Card title="Prescription history">

        {!selectedMother && (
          <p>
            Select a patient first.
          </p>
        )}


        {selectedMother &&
          history.length === 0 && (

            <p>
              No prescriptions recorded.
            </p>

          )}


        <div className="list">

          {history.map(
            (prescription) => (

              <div
                className="list-row"
                key={
                  prescription
                    .prescription_id
                }
              >

                <Pill size={18} />

                <div>

                  <strong>
                    Prescription #
                    {
                      prescription
                        .prescription_id
                    }
                  </strong>

                  <span>
                    {
                      prescription
                        .medicines
                        ?.map(
                          (medicine) =>
                            `${medicine.medicine_name} — ${medicine.dosage}`
                        )
                        .join(", ")
                    }
                  </span>

                  {prescription.notes && (
                    <span>
                      {
                        prescription.notes
                      }
                    </span>
                  )}

                </div>

                <em className="badge success">
                  {
                    prescription.status
                  }
                </em>

              </div>

            )
          )}

        </div>

      </Card>

    </AppLayout>
  );
}