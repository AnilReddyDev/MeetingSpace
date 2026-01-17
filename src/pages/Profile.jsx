import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, User2, Mail, BadgeCheck, LayoutGrid, ShieldCheck, ShieldAlert } from "lucide-react";
import { api } from "../config/api";

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }

    (async () => {
      try {
        const res = await api.get("/api/v1/user/me");
        const { data } = res;
        setProfile(data);
        // console.log(data)
      } catch (e) {
        setErr(e.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const isAdmin = (profile?.roles[0] || "").toUpperCase() === "ADMIN";

  return (
    <div className="min-h-screen w-full bg-hcl-blue-gradient text-white px-6 py-28">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Shield className="text-slate-100" />
          <h1 className="text-3xl font-bold">Your Profile</h1>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-40 bg-white/20 rounded" />
              <div className="h-5 w-72 bg-white/10 rounded" />
              <div className="h-5 w-56 bg-white/10 rounded" />
              <div className="h-10 w-44 bg-white/20 rounded mt-6" />
            </div>
          ) : err ? (
            <div className="text-red-300">{err}</div>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <User2 />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    {profile?.username || "Unnamed User"}
                  </h2>
                  <p className="text-slate-100 text-sm flex justify-center items-center gap-2">
                    Account verified {profile?.verified ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                  </p>
                </div>
              </div>

              <div className="border-t border-white/10 my-5" />

              <div className="grid sm:grid-cols-2 gap-4 text-white">
                <InfoRow
                  icon={<Mail color="white" size={18} />}
                  label={<span className=" text-white">Email</span>}
                  className="text-slate-800"
                  value={profile?.email}
                />
                <InfoRow icon={<BadgeCheck size={18} color="white" />} className="text-white" label={<span className=" text-white">Role</span>} value={profile?.roles[0]} />
              </div>

              <div className="mt-8 flex gap-3">
                {/* Explore button (primary CTA) */}
                {isAdmin && (
                  <button
                    onClick={() => navigate("/admin/dashboard")}
                    className="px-5 py-3 rounded-xl border border-white/30 text-white hover:bg-white/10 transition flex items-center gap-2"
                  >
                    <LayoutGrid size={18} />
                    Admin Dashboard
                  </button>
                )}
                <button
                  onClick={() => navigate("/")}
                  className="px-5 py-3 rounded-xl bg-white text-slate-900 font-semibold hover:bg-slate-200 transition"
                >
                  Explore Spaces
                </button>

                {/* Admin Dashboard (conditional) */}

                <button
                  onClick={() => {
                    console.log
                    localStorage.removeItem("token");
                    navigate("/")
                  }}
                  className="px-5 py-3 rounded-xl bg-white text-slate-900 font-semibold hover:bg-slate-200 transition"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="text-slate-400 text-sm flex items-center gap-2 mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-white">{value || "—"}</div>
    </div>
  );
}
