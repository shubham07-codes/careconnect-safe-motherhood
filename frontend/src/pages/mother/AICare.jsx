import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Activity,
  ArrowLeft,
  Bell,
  Bot,
  FileText,
  HeartPulse,
  LoaderCircle,
  MessageCircle,
  Pill,
  Send,
  Sparkles,
  Stethoscope,
  Upload,
} from "lucide-react";

import {
  askCareConnectAI,
  checkSymptoms,
  uploadMedicalReport,
  generateDoctorPrep,
  generateSmartAlerts,
  getSmartAlerts,
  getMyMedicines,
  explainMedicine,
} from "../../services/aiCareService";

import "./AICare.css";


export default function AICare() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] =
    useState("chat");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // CHAT
  const [question, setQuestion] =
    useState("");

  const [messages, setMessages] =
    useState([
      {
        role: "assistant",
        text:
          "Hello! I’m CareConnect AI. You can ask me about your pregnancy record, upcoming ANC visit, reports, symptoms or care plan.",
      },
    ]);

  // SYMPTOM
  const [symptoms, setSymptoms] =
    useState("");

  const [symptomResult, setSymptomResult] =
    useState(null);

  // REPORT
  const [reportFile, setReportFile] =
    useState(null);

  const [reportResult, setReportResult] =
    useState(null);

  // DOCTOR PREP
  const [concern, setConcern] =
    useState("");

  const [doctorPrep, setDoctorPrep] =
    useState(null);

  // ALERT
  const [alerts, setAlerts] =
    useState([]);

  // MEDICINE
  const [medicines, setMedicines] =
    useState([]);

  const [medicineExplanation, setMedicineExplanation] =
    useState(null);


  const run = async (callback) => {
    try {
      setLoading(true);
      setError("");

      await callback();
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };


  // ---------------------------------
  // AI CHAT
  // ---------------------------------

  const handleAskAI = async (event) => {
    event.preventDefault();

    const cleanQuestion =
      question.trim();

    if (!cleanQuestion) return;

    setMessages((old) => [
      ...old,
      {
        role: "user",
        text: cleanQuestion,
      },
    ]);

    setQuestion("");

    await run(async () => {
      const result =
        await askCareConnectAI(
          cleanQuestion
        );

      setMessages((old) => [
        ...old,
        {
          role: "assistant",
          text: result.answer,
          urgent: result.urgent,
          source: result.source,
        },
      ]);
    });
  };


  // ---------------------------------
  // SYMPTOMS
  // ---------------------------------

  const handleSymptoms = async () => {
    const items = symptoms
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (!items.length) {
      setError(
        "Enter at least one symptom."
      );
      return;
    }

    await run(async () => {
      const result =
        await checkSymptoms(items);

      setSymptomResult(
        result.triage
      );
    });
  };


  // ---------------------------------
  // REPORT
  // ---------------------------------

  const handleReportUpload = async () => {
    if (!reportFile) {
      setError(
        "Please select a PDF report."
      );

      return;
    }

    await run(async () => {
      const result =
        await uploadMedicalReport(
          reportFile
        );

      setReportResult(
        result.analysis
      );
    });
  };


  // ---------------------------------
  // DOCTOR PREP
  // ---------------------------------

  const handleDoctorPrep = async () => {
    await run(async () => {
      const result =
        await generateDoctorPrep(
          concern
        );

      setDoctorPrep(result);
    });
  };


  // ---------------------------------
  // ALERTS
  // ---------------------------------

  const loadAlerts = async () => {
    await run(async () => {
      await generateSmartAlerts();

      const data =
        await getSmartAlerts();

      setAlerts(data);
    });
  };


  // ---------------------------------
  // MEDICINES
  // ---------------------------------

  const loadMedicines = async () => {
    await run(async () => {
      const data =
        await getMyMedicines();

      setMedicines(data);
    });
  };


  const handleExplainMedicine =
    async (itemId) => {

      await run(async () => {
        const result =
          await explainMedicine(
            itemId
          );

        setMedicineExplanation(
          result
        );
      });
    };


  useEffect(() => {
    if (activeTab === "alerts") {
      loadAlerts();
    }

    if (activeTab === "medicines") {
      loadMedicines();
    }
  }, [activeTab]);


  const tabs = [
    {
      id: "chat",
      label: "Ask AI",
      icon: MessageCircle,
    },
    {
      id: "symptoms",
      label: "Symptoms",
      icon: HeartPulse,
    },
    {
      id: "reports",
      label: "Reports",
      icon: FileText,
    },
    {
      id: "doctor",
      label: "Doctor Prep",
      icon: Stethoscope,
    },
    {
      id: "alerts",
      label: "Alerts",
      icon: Bell,
    },
    {
      id: "medicines",
      label: "Medicines",
      icon: Pill,
    },
  ];


  return (
    <div className="ai-page">

      <div className="ai-topbar">

        <button
          className="back-button"
          onClick={() =>
            navigate("/mother")
          }
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>

        <div className="ai-brand">

          <div className="ai-logo">
            <Sparkles size={22} />
          </div>

          <div>
            <h1>CareConnect AI</h1>
            <p>
              Personalized pregnancy
              care assistant
            </p>
          </div>

        </div>

        <div className="ai-status">
          <span />
          Care System Active
        </div>

      </div>


      <div className="ai-container">

        <section className="ai-hero">

          <div>

            <span className="hero-badge">
              <Bot size={15} />
              AI CARE
            </span>

            <h2>
              Your pregnancy care,
              understood.
            </h2>

            <p>
              CareConnect combines your
              pregnancy history, ANC,
              symptoms, reports and care
              schedule to help you prepare
              for safer maternal care.
            </p>

          </div>

          <div className="hero-icon">
            <Activity size={38} />
          </div>

        </section>


        <div className="ai-tabs">

          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                className={
                  activeTab === tab.id
                    ? "tab active"
                    : "tab"
                }
                onClick={() => {
                  setActiveTab(tab.id);
                  setError("");
                }}
              >
                <Icon size={17} />
                {tab.label}
              </button>
            );
          })}

        </div>


        {error && (
          <div className="ai-error">
            {error}
          </div>
        )}


        {loading && (
          <div className="loading-box">
            <LoaderCircle
              className="spinner"
              size={22}
            />
            Processing...
          </div>
        )}


        {/* CHAT */}

        {activeTab === "chat" && (

          <section className="content-card chat-section">

            <div className="section-heading">
              <MessageCircle size={22} />

              <div>
                <h3>
                  Ask CareConnect AI
                </h3>

                <p>
                  Ask about your pregnancy,
                  next visit, reports or
                  general care.
                </p>
              </div>
            </div>


            <div className="chat-window">

              {messages.map(
                (message, index) => (

                  <div
                    key={index}
                    className={
                      message.role === "user"
                        ? "message user-message"
                        : message.urgent
                        ? "message ai-message urgent-message"
                        : "message ai-message"
                    }
                  >

                    {message.role ===
                      "assistant" && (
                      <Bot size={18} />
                    )}

                    <div>
                      {message.text}

                      {message.source && (
                        <small>
                          Source:{" "}
                          {message.source}
                        </small>
                      )}
                    </div>

                  </div>
                )
              )}

            </div>


            <form
              className="chat-input"
              onSubmit={handleAskAI}
            >

              <input
                value={question}
                onChange={(event) =>
                  setQuestion(
                    event.target.value
                  )
                }
                placeholder="Ask CareConnect AI..."
              />

              <button type="submit">
                <Send size={18} />
              </button>

            </form>

          </section>
        )}


        {/* SYMPTOM */}

        {activeTab === "symptoms" && (

          <section className="content-card">

            <div className="section-heading">
              <HeartPulse size={22} />

              <div>
                <h3>
                  Smart Symptom Checker
                </h3>

                <p>
                  Enter symptoms separated
                  by commas.
                </p>
              </div>
            </div>

            <textarea
              className="ai-textarea"
              value={symptoms}
              onChange={(event) =>
                setSymptoms(
                  event.target.value
                )
              }
              placeholder="Example: headache, nausea, dizziness"
            />

            <button
              className="primary-button"
              onClick={handleSymptoms}
            >
              <Activity size={18} />
              Check Symptoms
            </button>


            {symptomResult && (

              <div
                className={`result-box ${symptomResult.level}`}
              >

                <strong>
                  Triage:{" "}
                  {symptomResult.level?.toUpperCase()}
                </strong>

                <p>
                  {
                    symptomResult.explanation
                  }
                </p>

                {symptomResult.precautions
                  ?.map(
                    (
                      precaution,
                      index
                    ) => (
                      <div
                        key={index}
                        className="result-item"
                      >
                        • {precaution}
                      </div>
                    )
                  )}

              </div>
            )}

          </section>
        )}


        {/* REPORTS */}

        {activeTab === "reports" && (

          <section className="content-card">

            <div className="section-heading">
              <FileText size={22} />

              <div>
                <h3>
                  AI Report Analyzer
                </h3>

                <p>
                  Upload a pregnancy-related
                  PDF report.
                </p>
              </div>
            </div>


            <label className="upload-area">

              <Upload size={28} />

              <strong>
                Select Medical Report
              </strong>

              <span>
                PDF files supported
              </span>

              <input
                type="file"
                accept=".pdf"
                onChange={(event) =>
                  setReportFile(
                    event.target.files?.[0]
                  )
                }
              />

            </label>


            {reportFile && (
              <p className="selected-file">
                Selected:{" "}
                {reportFile.name}
              </p>
            )}


            <button
              className="primary-button"
              onClick={handleReportUpload}
            >
              <Sparkles size={18} />
              Analyze Report
            </button>


            {reportResult && (

              <div className="result-box">

                <strong>
                  AI Summary
                </strong>

                <p>
                  {reportResult.summary}
                </p>

                <h4>
                  Important Findings
                </h4>

                {reportResult.findings
                  ?.map(
                    (item, index) => (
                      <div
                        key={index}
                        className="result-item"
                      >
                        • {item}
                      </div>
                    )
                  )}

                <h4>
                  Precautions
                </h4>

                {reportResult.precautions
                  ?.map(
                    (item, index) => (
                      <div
                        key={index}
                        className="result-item"
                      >
                        • {item}
                      </div>
                    )
                  )}

              </div>
            )}

          </section>
        )}


        {/* DOCTOR PREP */}

        {activeTab === "doctor" && (

          <section className="content-card">

            <div className="section-heading">
              <Stethoscope size={22} />

              <div>
                <h3>
                  Prepare for Doctor Visit
                </h3>

                <p>
                  CareConnect prepares
                  personalized questions
                  and a visit checklist.
                </p>
              </div>
            </div>


            <textarea
              className="ai-textarea"
              value={concern}
              onChange={(event) =>
                setConcern(
                  event.target.value
                )
              }
              placeholder="Any extra concern you want to discuss? (optional)"
            />


            <button
              className="primary-button"
              onClick={
                handleDoctorPrep
              }
            >
              <Sparkles size={18} />
              Prepare My Visit
            </button>


            {doctorPrep && (

              <div className="prep-grid">

                <ResultList
                  title="Questions to Ask"
                  items={
                    doctorPrep.questions
                  }
                />

                <ResultList
                  title="Documents to Carry"
                  items={
                    doctorPrep.documents
                  }
                />

                <ResultList
                  title="Important Concerns"
                  items={
                    doctorPrep.concerns
                  }
                />

                <ResultList
                  title="Visit Checklist"
                  items={
                    doctorPrep.checklist
                  }
                />

              </div>
            )}

          </section>
        )}


        {/* ALERTS */}

        {activeTab === "alerts" && (

          <section className="content-card">

            <div className="section-heading">
              <Bell size={22} />

              <div>
                <h3>
                  Smart Care Alerts
                </h3>

                <p>
                  CareConnect automatically
                  identifies important
                  follow-up needs.
                </p>
              </div>
            </div>


            {!alerts.length && !loading && (
              <div className="empty-state">
                No active care alerts.
              </div>
            )}


            <div className="alert-list">

              {alerts.map(
                (alert) => (

                  <div
                    key={alert.id}
                    className={`alert-card ${alert.severity}`}
                  >

                    <Bell size={18} />

                    <div>
                      <strong>
                        {alert.title}
                      </strong>

                      <p>
                        {alert.message}
                      </p>

                      <small>
                        {
                          alert.action_text
                        }
                      </small>
                    </div>

                  </div>
                )
              )}

            </div>

          </section>
        )}


        {/* MEDICINES */}

        {activeTab === "medicines" && (

          <section className="content-card">

            <div className="section-heading">
              <Pill size={22} />

              <div>
                <h3>
                  My Medicines
                </h3>

                <p>
                  View and understand
                  medicines prescribed by
                  your doctor.
                </p>
              </div>
            </div>


            {!medicines.length &&
              !loading && (
                <div className="empty-state">
                  No active prescription.
                </div>
              )}


            <div className="medicine-grid">

              {medicines.map(
                (medicine) => (

                  <div
                    className="medicine-card"
                    key={
                      medicine.item_id
                    }
                  >

                    <Pill size={21} />

                    <h4>
                      {
                        medicine.medicine_name
                      }
                    </h4>

                    <p>
                      {medicine.dosage}
                    </p>

                    <small>
                      {
                        medicine.frequency
                      }
                    </small>

                    <button
                      onClick={() =>
                        handleExplainMedicine(
                          medicine.item_id
                        )
                      }
                    >
                      Explain with AI
                    </button>

                  </div>
                )
              )}

            </div>


            {medicineExplanation && (

              <div className="result-box">

                <strong>
                  Medicine Guidance
                </strong>

                <p>
                  {
                    medicineExplanation.explanation
                  }
                </p>

                <p>
                  {
                    medicineExplanation.instructions
                  }
                </p>

                <small>
                  {
                    medicineExplanation.disclaimer
                  }
                </small>

              </div>
            )}

          </section>
        )}


        <div className="medical-disclaimer">
          CareConnect provides AI-assisted
          decision support and educational
          guidance. It does not replace
          professional medical care.
        </div>

      </div>

    </div>
  );
}


function ResultList({
  title,
  items = [],
}) {
  return (
    <div className="prep-card">

      <h4>{title}</h4>

      {items.map(
        (item, index) => (
          <div
            key={index}
            className="result-item"
          >
            • {item}
          </div>
        )
      )}

    </div>
  );
}