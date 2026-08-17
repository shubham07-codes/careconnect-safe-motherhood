import {
  useEffect,
  useState,
} from "react";

import AppLayout from "../../components/common/AppLayout";
import Card from "../../components/common/Card";

import {
  getOfficerDashboard,
} from "../../services/officerService";


export default function MCHIndicators() {

  const [stats, setStats] =
    useState(null);


  useEffect(() => {

    getOfficerDashboard()
      .then((data) =>
        setStats(
          data?.indicators || {}
        )
      )
      .catch(console.error);

  }, []);


  if (!stats) {
    return (
      <AppLayout
        role="officer"
        title="MCH Indicators"
      >
        Loading indicators...
      </AppLayout>
    );
  }


  const indicators = [
    [
      "ANC Completion",
      stats.anc_completion_percent,
    ],
    [
      "Institutional Delivery",
      stats.institutional_delivery_rate_percent,
    ],
    [
      "Immunization Completion",
      stats.immunization_completion_percent,
    ],
  ];


  return (

    <AppLayout
      role="officer"
      eyebrow="Programme indicators"
      title="MCH Indicators"
      description="Live maternal and child health programme indicators."
    >

      <div className="indicator-card-grid">

        {indicators.map(
          ([label, value]) => (

            <Card key={label}>

              <span className="metric-label">
                {label}
              </span>

              <strong className="metric-big">
                {value || 0}%
              </strong>

              <div className="metric-track">
                <b
                  style={{
                    width:
                      `${Math.min(
                        100,
                        value || 0
                      )}%`,
                  }}
                />
              </div>

            </Card>

          )
        )}

        <Card>
          <span className="metric-label">
            Registered Mothers
          </span>

          <strong className="metric-big">
            {stats.registered_mothers}
          </strong>
        </Card>

        <Card>
          <span className="metric-label">
            High-Risk Pregnancies
          </span>

          <strong className="metric-big">
            {stats.high_risk_pregnancies}
          </strong>
        </Card>

        <Card>
          <span className="metric-label">
            Open Referrals
          </span>

          <strong className="metric-big">
            {stats.open_referrals}
          </strong>
        </Card>

      </div>

    </AppLayout>
  );
}