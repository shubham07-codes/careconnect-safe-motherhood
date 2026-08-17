import { FileImage, FileText, UploadCloud } from "lucide-react";
import { useState } from "react";
import AppLayout from "../../components/common/AppLayout";
import Card from "../../components/common/Card";

export default function MyReports() {
  const [docs, setDocs] = useState([
    { type: "CBC Report", name: "cbc_may.pdf", status: "Doctor review pending" },
    { type: "Prescription", name: "prescription_may.jpg", status: "Uploaded" },
  ]);

  const addFile = (type, file) => {
    if (!file) return;
    setDocs([{ type, name: file.name, status: "New upload" }, ...docs]);
  };

  return (
    <AppLayout role="mother" eyebrow="Medical records" title="Reports & Prescriptions" description="Upload report photos/PDFs and prescription images for the care team.">
      <section className="content-grid two">
        <Card title="Upload new document">
          <div className="drop-grid">
            <label className="drop-zone">
              <UploadCloud size={27}/>
              <strong>Medical / Lab Report</strong>
              <span>Photo or PDF</span>
              <input type="file" accept="image/*,.pdf" onChange={(e) => addFile("Medical Report", e.target.files?.[0])}/>
            </label>
            <label className="drop-zone pink">
              <FileImage size={27}/>
              <strong>Medicine Prescription</strong>
              <span>Photo or PDF</span>
              <input type="file" accept="image/*,.pdf" onChange={(e) => addFile("Prescription", e.target.files?.[0])}/>
            </label>
          </div>
        </Card>

        <Card title="Recent documents">
          <div className="list">
            {docs.map((d, i) => (
              <div className="list-row" key={`${d.name}-${i}`}>
                <FileText size={17}/>
                <div><strong>{d.type}</strong><span>{d.name}</span></div>
                <em className="badge info">{d.status}</em>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </AppLayout>
  );
}
