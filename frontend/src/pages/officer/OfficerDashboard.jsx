import {
  useEffect,
  useState,
} from "react";

import {
  Activity,
  Baby,
  CheckCircle2,
  HeartPulse,
} from "lucide-react";

import AppLayout from "../../components/common/AppLayout";
import Card from "../../components/common/Card";
import StatCard from "../../components/common/StatCard";

import {
  getOfficerDashboard,
  getWardAnalytics,
} from "../../services/officerService";


export default function OfficerDashboard() {

  const [data, setData] =
    useState(null);

  const [wards, setWards] =
    useState([]);

  const [loading, setLoading] =
    useState(true);


  useEffect(() => {

    const load = async () => {

      try {

        const [
          dashboard,
          wardData,
        ] = await Promise.all([
          getOfficerDashboard(),
          getWardAnalytics(),
        ]);

        setData(dashboard);
        setWards(
          wardData?.wards || []
        );

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);
      }
    };

    load();

  }, []);


  const indicators =
    data?.indicators || {};


  const active =
    indicators.active_pregnancies || 0;

  const highRisk =
    indicators.high_risk_pregnancies || 0;

  const highRiskPercent =
    active
      ? (
          (highRisk / active)
          * 100
        ).toFixed(1)
      : "0.0";


  const sortedWards = [
    ...wards,
  ].sort(
    (a, b) =>
      (
        b.indicators
          ?.high_risk_pregnancies ||
        0
      ) -
      (
        a.indicators
          ?.high_risk_pregnancies ||
        0
      )
  );


  return (

    <AppLayout
      role="officer"
      eyebrow="Aggregate-only ward intelligence"
      title="Maternal & Child Health Overview"
      description="De-identified programme indicators from real CareConnect records."
    >

      {loading ? (

        <p>
          Loading programme data...
        </p>

      ) : (

        <>
          <section className="stat-grid four">

            <StatCard
              icon={HeartPulse}
              label="ANC completion"
              value={`${indicators.anc_completion_percent || 0}%`}
              hint="Scheduled ANC visits"
            />

            <StatCard
              icon={Activity}
              label="High-risk load"
              value={`${highRiskPercent}%`}
              hint={`${highRisk} pregnancies`}
              tone="pink"
            />

            <StatCard
              icon={CheckCircle2}
              label="Institutional delivery"
              value={`${indicators.institutional_delivery_rate_percent || 0}%`}
              hint="Recorded deliveries"
              tone="green"
            />

            <StatCard
              icon={Baby}
              label="Immunization"
              value={`${indicators.immunization_completion_percent || 0}%`}
              hint={`${indicators.newborns || 0} newborns`}
              tone="blue"
            />

          </section>


          <section className="content-grid two-one">

            <Card title="Programme status">

              <div className="indicator-list">

                <div>
                  <span>
                    Active pregnancies
                  </span>
                  <strong>
                    {active}
                  </strong>
                </div>

                <div>
                  <span>
                    Missed ANC visits
                  </span>
                  <strong>
                    {indicators.missed_anc_visits || 0}
                  </strong>
                </div>

                <div>
                  <span>
                    Open referrals
                  </span>
                  <strong>
                    {indicators.open_referrals || 0}
                  </strong>
                </div>

                <div>
                  <span>
                    Postnatal due/missed
                  </span>
                  <strong>
                    {indicators.postnatal_due_or_missed || 0}
                  </strong>
                </div>

              </div>

            </Card>


            <Card title="Highest risk load">

              <div className="ward-mini">

                {sortedWards
                  .slice(0, 3)
                  .map((ward) => {

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
                        ? (
                            high /
                            total *
                            100
                          ).toFixed(1)
                        : "0.0";

                    return (

                      <div
                        key={ward.ward_id}
                      >

                        <span>

                          <strong>
                            {ward.code}
                          </strong>

                          <small>
                            {total} pregnancies
                          </small>

                        </span>

                        <em className="badge warning">
                          {percent}%
                        </em>

                      </div>

                    );
                  })}

              </div>

            </Card>

          </section>
        </>
      )}

    </AppLayout>
  );
}