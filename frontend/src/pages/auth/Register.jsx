import {
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import Logo from "../../components/common/Logo";

import {
  getPublicWards,
  registerMother,
} from "../../services/authService";


export default function Register() {

  const navigate = useNavigate();

  const [wards, setWards] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  const [form, setForm] =
    useState({
      full_name: "",
      email: "",
      phone: "",
      password: "",
      ward_id: "",
      lmp: "",
      blood_group: "",
      preferred_language:
        "marathi",
      reminder_consent: true,
    });


  useEffect(() => {

    getPublicWards()
      .then((data) =>
        setWards(data || [])
      )
      .catch((error) =>
        console.error(
          "Ward loading failed:",
          error
        )
      );

  }, []);


  const change = (event) => {

    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };


  const submit = async (event) => {

    event.preventDefault();

    setError("");

    if (
      !form.full_name ||
      !form.email ||
      !form.password ||
      !form.ward_id ||
      !form.lmp
    ) {
      setError(
        "Please complete all required fields."
      );

      return;
    }


    if (form.password.length < 8) {

      setError(
        "Password must contain at least 8 characters."
      );

      return;
    }


    try {

      setLoading(true);

      await registerMother({
        ...form,

        ward_id:
          Number(form.ward_id),

        phone:
          form.phone || null,

        blood_group:
          form.blood_group || null,

        pregnancy_number: 1,
        parity: 0,
        previous_complications: false,
      });


      navigate(
        "/login",
        {
          replace: true,
        }
      );

    } catch (error) {

      console.error(error);

      setError(
        error?.response?.data?.detail ||
        "Unable to create account."
      );

    } finally {

      setLoading(false);
    }
  };


  return (

    <main className="centered-page">

      <form
        className="auth-card register-card"
        onSubmit={submit}
      >

        <Link
          to="/login"
          className="back-link"
        >
          <ArrowLeft size={16} />
          Back to login
        </Link>


        <Logo />


        <h2>
          Create Mother Account
        </h2>

        <p>
          Register your pregnancy and
          start your CareConnect care
          journey.
        </p>


        <label>
          Full name

          <div className="field">
            <input
              required
              name="full_name"
              value={form.full_name}
              onChange={change}
              placeholder="Full name"
            />
          </div>
        </label>


        <label>
          Email

          <div className="field">
            <input
              required
              type="email"
              name="email"
              value={form.email}
              onChange={change}
              placeholder="name@example.com"
            />
          </div>
        </label>


        <label>
          Phone

          <div className="field">
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={change}
              placeholder="+91"
            />
          </div>
        </label>


        <label>
          Password

          <div className="field">
            <input
              required
              minLength="8"
              type="password"
              name="password"
              value={form.password}
              onChange={change}
              placeholder="Minimum 8 characters"
            />
          </div>
        </label>


        <label>
          Ward

          <div className="field">

            <select
              required
              name="ward_id"
              value={form.ward_id}
              onChange={change}
            >

              <option value="">
                Select ward
              </option>

              {wards.map((ward) => (

                <option
                  key={ward.ward_id}
                  value={ward.ward_id}
                >
                  {ward.code} — {ward.name}
                </option>

              ))}

            </select>

          </div>
        </label>


        <label>
          Last Menstrual Period (LMP)

          <div className="field">
            <input
              required
              type="date"
              name="lmp"
              value={form.lmp}
              onChange={change}
            />
          </div>
        </label>


        <label>
          Blood group

          <div className="field">

            <select
              name="blood_group"
              value={form.blood_group}
              onChange={change}
            >

              <option value="">
                Select blood group
              </option>

              <option>A+</option>
              <option>A-</option>
              <option>B+</option>
              <option>B-</option>
              <option>AB+</option>
              <option>AB-</option>
              <option>O+</option>
              <option>O-</option>

            </select>

          </div>
        </label>


        <label>
          Preferred language

          <div className="field">

            <select
              name="preferred_language"
              value={
                form.preferred_language
              }
              onChange={change}
            >
              <option value="marathi">
                Marathi
              </option>

              <option value="hindi">
                Hindi
              </option>

              <option value="english">
                English
              </option>
            </select>

          </div>
        </label>


        <label>

          <input
            type="checkbox"
            name="reminder_consent"
            checked={
              form.reminder_consent
            }
            onChange={change}
          />

          Receive ANC and medicine
          reminders

        </label>


        {error && (
          <div className="notice">
            {error}
          </div>
        )}


        <button
          className="primary-btn"
          type="submit"
          disabled={loading}
        >

          {loading
            ? "Creating account..."
            : "Create Account"}

          <ArrowRight size={17} />

        </button>

      </form>

    </main>
  );
}