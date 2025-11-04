import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosConfig"; // ✅ Correct path
import { setToken } from "../../utils/auth"; // ✅ Fix this line

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const res = await axiosInstance.post("/auth/login", {
        email,
        password,
      });

      console.log("Login response:", res.data);

      if (res.data?.token) {
        // console.log("🔹 Login success, token:", res.data.token);
        setToken(res.data.token);
        console.log("Token saved, navigating to dashboard...");
        navigate("/", { replace: true });
      } else {
        alert(res.data?.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card shadow-sm" style={{ width: "380px" }}>
        <div className="card-body p-4">
          <h4 className="text-center mb-3 fw-bold">Sign In</h4>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email address</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="text-center mt-3">
            <small className="text-muted">
              Don't have an account?{" "}
              <Link to="/register" className="text-decoration-none">
                Register here
              </Link>
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}