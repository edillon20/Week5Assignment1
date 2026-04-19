import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../auth/AuthContext";

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleGoogleSuccess = (credentialResponse) => {
    const token = credentialResponse?.credential;
    const profile = parseJwt(token);

    if (!profile) {
      setError("Google login failed.");
      return;
    }

    login({
      name: profile.name,
      email: profile.email,
      picture: profile.picture,
    });

    navigate("/movies", { replace: true });
  };

  const handleGoogleError = () => {
    setError("Google login was unsuccessful.");
  };

  return (
    <div className="card">
      <h2>Login</h2>
      <p>Please sign in to access the application.</p>

      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        useOneTap={false}
      />

      {error && <p className="checkout-error">{error}</p>}
    </div>
  );
}

export default Login;