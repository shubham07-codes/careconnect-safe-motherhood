import {
  useEffect,
  useState,
} from "react";

import {
  Baby,
  Syringe,
} from "lucide-react";

import AppLayout from "../../components/common/AppLayout";
import Card from "../../components/common/Card";

import {
  getWardAnalytics,
} from "../../services/officerService";


export default function ImmunizationOverview() {

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
      eyebrow="Newborn programme tracking"
      title="Immunization Overview"
      description="Aggregate newborn immunization coverage by ward."
    >

      <Card title="Ward immunization coverage">

        <div className="ward-immunization">

          {wards.map((ward) => {

            const stats =
              ward.indicators;

            const value =
              stats.immunization_completion_percent ||
              0;

            return (

              <div key={ward.ward_id}>

                <div>

                  <Baby size={17} />

                  <span>
                    <strong>
                      {ward.code}
                    </strong>

                    <small>
                      {stats.newborns}
                      {" "}newborns
                    </small>
                  </span>

                </div>


                <div className="metric-track">

                  <b
                    style={{
                      width:
                        `${value}%`,
                    }}
                  />

                </div>


                <strong>
                  <Syringe size={14} />
                  {value}%
                </strong>

              </div>

            );
          })}

        </div>

      </Card>

    </AppLayout>
  );
}