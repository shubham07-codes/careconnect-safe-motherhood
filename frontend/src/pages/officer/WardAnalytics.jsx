import {
  useEffect,
  useState,
} from "react";

import AppLayout from "../../components/common/AppLayout";
import Card from "../../components/common/Card";

import {
  getWardAnalytics,
} from "../../services/officerService";


export default function WardAnalytics() {

  const [wards, setWards] =
    useState([]);

  const [loading, setLoading] =
    useState(true);


  useEffect(() => {

    getWardAnalytics()
      .then((data) =>
        setWards(
          data?.wards || []
        )
      )
      .catch(console.error)
      .finally(() =>
        setLoading(false)
      );

  }, []);


  return (

    <AppLayout
      role="officer"
      eyebrow="Ward comparison"
      title="Ward Analytics"
      description="Aggregate and de-identified ward-level monitoring."
    >

      <Card title="Ward comparison">

        {loading ? (
          <p>Loading wards...</p>
        ) : (

          <div className="table-wrap">

            <table>

              <thead>
                <tr>
                  <th>Ward</th>
                  <th>Pregnancies</th>
                  <th>High Risk</th>
                  <th>ANC</th>
                  <th>Delivery</th>
                  <th>Immunization</th>
                </tr>
              </thead>

              <tbody>

                {wards.map((ward) => {

                  const stats =
                    ward.indicators;

                  return (

                    <tr
                      key={ward.ward_id}
                    >

                      <td>
                        <strong>
                          {ward.code}
                        </strong>
                        <span>
                          {ward.name}
                        </span>
                      </td>

                      <td>
                        {stats.active_pregnancies}
                      </td>

                      <td>
                        {stats.high_risk_pregnancies}
                      </td>

                      <td>
                        {stats.anc_completion_percent}%
                      </td>

                      <td>
                        {stats.institutional_delivery_rate_percent}%
                      </td>

                      <td>
                        {stats.immunization_completion_percent}%
                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>
        )}

      </Card>

    </AppLayout>
  );
}