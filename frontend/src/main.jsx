import {
  StrictMode,
  useState,
} from "react";

import {
  createRoot,
} from "react-dom/client";

import {
  BrowserRouter,
  useNavigate,
} from "react-router-dom";

import App from "./App.jsx";
import "./index.css";

import {
  AuthProvider,
} from "./context/AuthContext.jsx";

import VideoIntro from "./components/common/VideoIntro.jsx";


function CareConnectStartup() {
  const navigate = useNavigate();

  const [showIntro, setShowIntro] =
    useState(true);


  const finishIntro = () => {

    setShowIntro(false);

    navigate(
      "/login",
      {
        replace: true,
      }
    );
  };


  if (showIntro) {
    return (
      <VideoIntro
        onFinish={finishIntro}
      />
    );
  }


  return <App />;
}


createRoot(
  document.getElementById("root")
).render(

  <StrictMode>

    <BrowserRouter>

      <AuthProvider>

        <CareConnectStartup />

      </AuthProvider>

    </BrowserRouter>

  </StrictMode>
);