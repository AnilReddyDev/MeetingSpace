
// src/pages/VerifyEmail.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ShieldCheck, AlertCircle } from "lucide-react";
import axios from "axios";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("idle"); // 'idle' | 'loading' | 'success' | 'error'
  const [message, setMessage] = useState("");

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing from the URL.");
      return;
    }

    const verify = async () => {
      try {
        setStatus("loading");

        const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
        const response = await axios.get(
          `${base}/api/v1/auth/verify`,
          { params: { token } } // lets axios encode the token safely
        );

        // Your sample shows success payload at response.data.data.message
        const apiMessage = response?.status || response?.data?.status;
        // console.log("response :",response)
        // console.log("status code :",apiMessage)
        if (response?.status == 200) {
          setStatus("success");
          setMessage("Your account has been successfully verified.");
        } else {
          // If backend returns 200 but with unexpected payload
          setStatus("error");
          setMessage(apiMessage || "Something went wrong during verification.");
        }
      } catch (error) {
        
        setStatus("error");
        setMessage("Error Catched : ",apiMsg);
      }
    };

    verify();
  }, [token]);

  const Card = ({ children }) => (
    <div className="max-w-lg mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center">
      {children}
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-6 py-28">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-10">Email Verification</h1>

        {status === "loading" && (
          <Card>
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-full border-4 border-white/30 border-t-white animate-spin" />
            </div>
            <p className="text-slate-300">Verifying your email…</p>
          </Card>
        )}

        {status === "success" && (
          <Card>
            <div className="flex justify-center mb-4">
              {/* <div className="h-14 w-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <ShieldCheck size={28} className="text-emerald-300" />
              </div> */}
            </div>
            <h2 className="text-xl font-semibold mb-2">Verification Status:</h2>
            <p className="text-slate-300 mb-6">{message}</p>
            <button
              onClick={() => navigate("/signin")}
              className="px-6 py-3 rounded-xl bg-white text-slate-900 font-semibold hover:bg-slate-200 transition"
            >
              Continue to Sign In
            </button>
          </Card>
        )}

        {status === "error" && (
          <Card>
            <div className="flex justify-center mb-4">
              {/* <div className="h-14 w-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <AlertCircle size={28} className="text-red-300" />
              </div> */}
            </div>
            <h2 className="text-xl font-semibold mb-2">Verification Status:</h2>
            <p className="text-slate-300 mb-6">{message || "Invalid or expired token."}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate("/signin")}
                className="px-6 py-3 rounded-xl bg-white text-slate-900 font-semibold hover:bg-slate-200 transition"
              >
                Go to Sign In
              </button>
              {/* Optional: Resend link if you add it later */}
              {/* <button
                onClick={() => navigate("/resend-verification")}
                className="px-6 py-3 rounded-xl border border-white/30 text-white hover:bg-white/10 transition"
              >
                Resend Email
              </button> */}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
