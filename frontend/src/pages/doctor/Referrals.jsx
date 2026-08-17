import {
  useEffect,
  useState,
} from "react";

import {
  Building2,
  CheckCircle2,
} from "lucide-react";

import AppLayout from "../../components/common/AppLayout";
import Card from "../../components/common/Card";

import {
  getDoctorReferrals,
  updateReferral,
} from "../../services/doctorService";


export default function Referrals() {

  const [rows, setRows] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [updating, setUpdating] =
    useState(null);

  const [error, setError] =
    useState("");


  const load = async () => {

    try {

      const data =
        await getDoctorReferrals();

      setRows(data || []);

    } catch (err) {

      console.error(err);

      setError(
        "Unable to load referrals."
      );

    } finally {

      setLoading(false);
    }
  };


  useEffect(() => {
    load();
  }, []);


  const nextStatus = (status) => {

    if (status === "pending")
      return "accepted";

    if (status === "accepted")
      return "reached_facility";

    if (
      status ===
      "reached_facility"
    )
      return "closed";

    return null;
  };


  const buttonText = (status) => {

    if (status === "pending")
      return "Accept";

    if (status === "accepted")
      return "Mark Reached";

    if (
      status ===
      "reached_facility"
    )
      return "Close Referral";

    return "";
  };


  const handleUpdate = async (
    referral
  ) => {

    const status =
      nextStatus(referral.status);

    if (!status) return;

    try {

      setUpdating(
        referral.referral_id
      );

      await updateReferral(
        referral.referral_id,
        status
      );

      await load();

    } catch (err) {

      console.error(err);

      alert(
        "Unable to update referral."
      );

    } finally {

      setUpdating(null);
    }
  };


  const badgeClass = (status) => {

    if (status === "closed")
      return "success";

    if (
      status ===
      "reached_facility"
    )
      return "success";

    if (status === "accepted")
      return "warning";

    return "danger";
  };


  return (

    <AppLayout
      role="doctor"
      eyebrow="Closed-loop referral management"
      title="Referrals"
      description="Track referrals from creation to facility arrival and closure."
    >

      <Card title="Referral pathway">

        {loading && (
          <p>Loading referrals...</p>
        )}


        {error && (
          <div className="notice">
            {error}
          </div>
        )}


        <div className="referral-cards">

          {rows.map((referral) => (

            <div
              className="referral-card"
              key={referral.referral_id}
            >

              <div>

                <strong>
                  {referral.mother_name}
                </strong>

                <span>
                  {referral.reason}
                </span>

              </div>


              <div className="referral-flow">

                <span>

                  <Building2
                    size={14}
                  />

                  {
                    referral.facility_name ||
                    "Facility pending"
                  }

                </span>

              </div>


              <div>

                <em
                  className={
                    `badge ${badgeClass(
                      referral.status
                    )}`
                  }
                >
                  {referral.status}
                </em>

              </div>


              {nextStatus(
                referral.status
              ) && (

                <button
                  className="mini-btn"
                  disabled={
                    updating ===
                    referral.referral_id
                  }
                  onClick={() =>
                    handleUpdate(
                      referral
                    )
                  }
                >

                  <CheckCircle2
                    size={14}
                  />

                  {
                    updating ===
                    referral.referral_id
                      ? "Updating..."
                      : buttonText(
                          referral.status
                        )
                  }

                </button>

              )}

            </div>

          ))}

        </div>


        {!loading &&
          rows.length === 0 && (

            <p>
              No referrals available.
            </p>

          )}

      </Card>

    </AppLayout>
  );
}