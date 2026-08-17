import {
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";

import AppLayout from "../../components/common/AppLayout";
import Card from "../../components/common/Card";

import {
  getWardAnalytics,
} from "../../services/officerService";


export default function RiskOverview() {

  const [wards, setWards] =
    useState([]);


  useEffect(() => {

    getWardAnalytics()
      .then((data) =>
        setWards(
          data?.wards || []
        )
      )
      .catch(console.error);

  }, []);


  return (

    <AppLayout
      role="officer"
      eyebrow="Risk intelligence"
      title="High-Risk Load"
      description="Aggregate high-risk pregnancy load by ward."
    >

      <section className="risk-cards">

        {wards.map((ward) => {

          const stats =
            ward.indicators;

          const total =
            stats.active_pregnancies ||
            0;

          const high =
            stats.high_risk_pregnancies ||
            0;

          const percent =
            total
              ? high / total * 100
              : 0;

          return (

            <Card key={ward.ward_id}>

              <div className="risk-card-head">

                <AlertTriangle
                  size={20}
                />

                <em className="badge warning">
                  {high} cases
                </em>

              </div>

              <h3>
                {ward.code}
              </h3>

              <p>
                {total} active pregnancies
              </p>

              <div className="metric-track">

                <b
                  style={{
                    width:
                      `${Math.min(
                        100,
                        percent
                      )}%`,
                  }}
                />

              </div>

              <small>
                {percent.toFixed(1)}%
                {" "}high-risk load
              </small>

            </Card>

          );
        })}

      </section>


      <div className="notice top-gap">

        <ShieldCheck size={20} />

        <div>
          <strong>
            Privacy-protected view
          </strong>

          <p>
            Officer dashboards show
            aggregate data only. No
            patient names, phone numbers
            or individual records are
            exposed.
          </p>
        </div>

      </div>

    </AppLayout>
  );
}