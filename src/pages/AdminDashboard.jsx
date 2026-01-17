
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  RefreshCw,
  Download,
  Filter,
  Search,
  CalendarDays,
  ArrowUpDown,
  Plus,
  X,
} from "lucide-react";
import { api } from "../config/api";
import { useNavigate } from "react-router-dom";

const AMENITIES = [
  { id: 1, name: "Projector" },
  { id: 2, name: "WiFi" },
  { id: 3, name: "Whiteboard" },
  { id: 4, name: "TV" },
  { id: 5, name: "Coffee" },
];

export default function AdminDashboard() {
  const [date, setDate] = useState(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [summary, setSummary] = useState({
    // Prefer server values; fallback to 0
    date: "",
    totalRooms: 0,
    totalBookingsToday: 0,
    avgUtilization: null, // <— if server provides a top-level metric, we’ll use it
    rooms: [],
  });

  const [search, setSearch] = useState("");
  const [minCapacity, setMinCapacity] = useState(1);
  const [minUtil, setMinUtil] = useState(0);
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState("desc");

  const [showAdd, setShowAdd] = useState(false);
  const [addErr, setAddErr] = useState("");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    name: "",
    capacity: 1,
    floor: 0,
    amenityIds: [],
  });

  const abortRef = useRef(null);

  // ---------------- Fetch Dashboard (date-aware, cancelable) ----------------
  const fetchData = async (currentDate = date) => {
    setErr("");
    setLoading(true);
    try {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      // console.log("[AdminDashboard] requesting date", currentDate);

      const { data } = await api.get("/api/v1/admin/dashboard/rooms", {
        params: { date: currentDate, _: Date.now() },
        headers: { "Cache-Control": "no-cache" },
        signal: controller.signal,
      });

      // Defensive parsing: log raw data
      // console.log("[AdminDashboard] fetched", data);

      setSummary({
        date: data?.date ?? currentDate,
        totalRooms: data?.totalRooms ?? 0,
        totalBookingsToday: data?.totalBookingsToday ?? 0,
        avgUtilization: data?.avgUtilization ?? null, // <— use server metric if provided
        rooms: Array.isArray(data?.rooms) ? data.rooms : [],
      });
    } catch (e) {
      if (e?.name === "CanceledError" || e?.message === "canceled") {
        // ignore
      } else {
        console.error("Admin dashboard fetch error:", e);
        setErr(
          e?.response?.data?.message ||
            e?.response?.data?.error ||
            "Failed to load admin dashboard."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      const token = localStorage.getItem("token");
      if(!token){
          navigate("/")
        }
        (async () => {
              try {
                const res = await api.get("/api/v1/user/me");
                const {data} = res;
                if(data.roles[0].toUpperCase() != "ADMIN"){
                    navigate("/")
                }
              } catch (e) {
                navigate("/")
              } 
            })();
     fetchData(date);
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  // ---------------- CSV Export ----------------
  const exportCSV = () => {
    const headers = [
      "Room ID",
      "Name",
      "Capacity",
      "Confirmed",
      "Cancelled",
      "Total",
      "Utilization(%)",
    ];
    const rows = (summary.rooms || []).map((r) => [
      r.roomId,
      safe(r.name),
      r.capacity,
      r.confirmedBookings,
      r.cancelledBookings,
      r.totalBookings,
      r.utilizationPercentage,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map(csvEscape).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rooms-dashboard-${summary.date || date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---------------- Average Utilization (fallback computation) ----------------
  // If the server does NOT send avgUtilization, we compute a CAPACITY-WEIGHTED average:
  //   sum(util% * capacity) / sum(capacity)
  // Weighted gives a more realistic KPI than a simple mean.
  const computedAvgUtilization = useMemo(() => {
    const rooms = summary.rooms || [];
    const denom = rooms.reduce((acc, r) => acc + (r.capacity || 0), 0);
    if (!denom) return 0;
    const numer = rooms.reduce(
      (acc, r) => acc + ((r.utilizationPercentage || 0) * (r.capacity || 0)),
      0
    );
    return Math.round((numer / denom) * 10) / 10;
  }, [summary.rooms]);

  const avgUtilToShow =
    typeof summary.avgUtilization === "number"
      ? summary.avgUtilization
      : computedAvgUtilization;

  // ---------------- Filter & Sort table ----------------
  const filteredSortedRooms = useMemo(() => {
    const s = (search || "").toLowerCase().trim();
    let arr = (summary.rooms || []).filter((r) => {
      const matchesSearch = !s || (r.name || "").toLowerCase().includes(s);
      const meetsCapacity = (r.capacity || 0) >= minCapacity;
      const meetsUtil = (r.utilizationPercentage || 0) >= minUtil;
      return matchesSearch && meetsCapacity && meetsUtil;
    });

    arr.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const getVal = (obj) => {
        switch (sortBy) {
          case "capacity":
            return obj.capacity || 0;
          case "confirmedBookings":
            return obj.confirmedBookings || 0;
          case "cancelledBookings":
            return obj.cancelledBookings || 0;
          case "totalBookings":
            return obj.totalBookings || 0;
          case "utilizationPercentage":
            return obj.utilizationPercentage || 0;
          case "name":
          default:
            return (obj.name || "").toLowerCase();
        }
      };
      const va = getVal(a);
      const vb = getVal(b);
      if (typeof va === "string" && typeof vb === "string") {
        return va.localeCompare(vb) * dir;
      }
      return (va - vb) * dir;
    });

    return arr;
  }, [summary.rooms, search, minCapacity, minUtil, sortBy, sortDir]);

  const toggleSort = (key) => {
    if (sortBy !== key) {
      setSortBy(key);
      setSortDir("desc");
      return;
    }
    setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  // ---------------- Add Room ----------------
  const toggleAmenityInForm = (id) => {
    setForm((prev) => {
      const set = new Set(prev.amenityIds);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return { ...prev, amenityIds: Array.from(set) };
    });
  };

  const resetForm = () => {
    setForm({ name: "", capacity: 1, floor: 0, amenityIds: [] });
    setAddErr("");
  };

  const submitNewRoom = async () => {
    setAddErr("");
    if (!form.name.trim()) {
      setAddErr("Room name is required.");
      return;
    }
    if (form.capacity <= 0) {
      setAddErr("Capacity must be greater than 0.");
      return;
    }
    if (form.floor < 0) {
      setAddErr("Floor cannot be negative.");
      return;
    }

    try {
      setAdding(true);
      await api.post("/api/v1/admin/rooms", {
        name: form.name.trim(),
        capacity: Number(form.capacity),
        floor: Number(form.floor),
        amenityIds: form.amenityIds.map(Number),
      });
      setShowAdd(false);
      resetForm();
      // After adding a room, re-fetch for the same date
      fetchData(summary.date || date);
    } catch (e) {
      console.error("Add room error:", e);
      setAddErr(
        e?.response?.data?.message ||
          e?.response?.data?.error ||
          "Failed to add room. Please try again."
      );
    } finally {
      setAdding(false);
    }
  };

  const isLoading = loading;

  return (
    <div className="min-h-screen w-full bg-hcl-gradient text-black">
      <div className="pt-20" />

      <div className="mx-auto w-full max-w-7xl px-4 flex flex-col gap-6">
        {/* Title + Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 size={22} />
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* DATE PICKER controls the fetch query */}
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-3 py-2">
              <CalendarDays size={16} className="text-slate-200" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent outline-none text-sm text-white [color-scheme:dark]"
              />
            </div>

            <button
              onClick={() => fetchData(date)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white text-slate-900 text-sm font-semibold hover:bg-slate-200 transition"
              title="Refresh"
            >
              <RefreshCw size={16} /> Refresh
            </button>

            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/30 text-white hover:bg-white/10 text-sm"
              title="Export CSV"
              disabled={isLoading || (summary.rooms || []).length === 0}
            >
              <Download size={16} /> Export CSV
            </button>

            <button
              onClick={() => {
                resetForm();
                setShowAdd(true);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-400 transition"
              title="Add Room"
            >
              <Plus size={16} /> Add Room
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <GlassCard>
            <p className="text-sm text-slate-300">Date (Selected)</p>
            <h2 className="text-2xl font-bold">{summary.date || date}</h2>
          </GlassCard>

          <GlassCard>
            {isLoading ? <SkeletonLine /> : (
              <>
                <p className="text-sm text-slate-300">Total Rooms</p>
                <h2 className="text-2xl font-bold">{summary.totalRooms}</h2>
              </>
            )}
          </GlassCard>

          <GlassCard>
            {isLoading ? <SkeletonLine /> : (
              <>
                <p className="text-sm text-slate-300">Bookings on {summary.date || date}</p>
                <h2 className="text-2xl font-bold">{summary.totalBookingsToday}</h2>
              </>
            )}
          </GlassCard>

          <GlassCard className="sm:col-span-3">
            {isLoading ? <SkeletonLine /> : (
              <>
                <p className="text-sm text-slate-300">Average Utilization</p>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">{avgUtilToShow}%</h2>
                  <UtilBadge value={avgUtilToShow} />
                </div>
                <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-2 bg-blue-400"
                    style={{ width: `${Math.min(avgUtilToShow, 100)}%` }}
                  />
                </div>
              </>
            )}
          </GlassCard>
        </div>

        {/* Filters row */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 flex flex-col sm:flex-row gap-3 items-center">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 w-full sm:w-auto sm:flex-1">
            <Search size={16} className="text-slate-200" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search room..."
              className="bg-transparent outline-none text-sm text-white placeholder:text-slate-400 w-full"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto sm:flex-1">
            <Filter size={16} className="text-slate-200" />
            <div className="w-full">
              <label className="text-[11px] text-slate-300">Min Capacity: {minCapacity}</label>
              <input
                type="range"
                min="1"
                max="100"
                value={minCapacity}
                onChange={(e) => setMinCapacity(parseInt(e.target.value, 10))}
                className="w-full accent-blue-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto sm:flex-1">
            <Filter size={16} className="text-slate-200" />
            <div className="w-full">
              <label className="text-[11px] text-slate-300">Min Utilization: {minUtil}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={minUtil}
                onChange={(e) => setMinUtil(parseInt(e.target.value, 10))}
                className="w-full accent-blue-400"
              />
            </div>
          </div>
        </div>

        {/* Rooms table */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-white/5">
                <tr className="text-left text-sm text-slate-200">
                  <Th label="Room" sortKey="name" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} />
                  <Th label="Capacity" sortKey="capacity" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} right />
                  <Th label="Confirmed" sortKey="confirmedBookings" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} right />
                  <Th label="Cancelled" sortKey="cancelledBookings" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} right />
                  <Th label="Total" sortKey="totalBookings" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} right />
                  <Th label="Utilization" sortKey="utilizationPercentage" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} />
                </tr>
              </thead>

              <tbody className="divide-y divide-white/10">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <Td><SkeletonLine /></Td>
                      <Td right><SkeletonLine short /></Td>
                      <Td right><SkeletonLine short /></Td>
                      <Td right><SkeletonLine short /></Td>
                      <Td right><SkeletonLine short /></Td>
                      <Td>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-2 bg-slate-300 w-1/2 animate-pulse" />
                        </div>
                      </Td>
                    </tr>
                  ))
                ) : filteredSortedRooms.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-300">
                      No rooms match the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredSortedRooms.map((r) => (
                    <tr key={r.roomId} className="text-sm">
                      <Td>
                        <div className="flex flex-col">
                          <span className="font-medium text-white">{r.name}</span>
                          <span className="text-[11px] text-slate-400">ID: {r.roomId}</span>
                        </div>
                      </Td>
                      <Td right>{r.capacity}</Td>
                      <Td right>{r.confirmedBookings}</Td>
                      <Td right>{r.cancelledBookings}</Td>
                      <Td right>{r.totalBookings}</Td>
                      <Td>
                        <div className="flex items-center gap-3">
                          <div className="w-36 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-2 rounded-full ${utilColor(r.utilizationPercentage)}`}
                              style={{ width: `${Math.min(r.utilizationPercentage, 100)}%` }}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold">{r.utilizationPercentage}%</span>
                            <UtilBadge value={r.utilizationPercentage} />
                          </div>
                        </div>
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {err && (
          <div className="text-sm text-red-200 bg-red-900/30 border border-red-700/40 rounded-lg px-4 py-3">
            {err}
          </div>
        )}
      </div>

      {/* Add Room Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAdd(false)} />
          <div className="relative z-10 w-11/12 max-w-lg bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Add New Room</h3>
              <button className="p-1 rounded bg-white/10 hover:bg-white/20" onClick={() => setShowAdd(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-xs text-slate-300">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="mt-1 w-full rounded-md bg-white/20 border border-white/30 px-3 py-2 text-white placeholder:text-slate-300 outline-none"
                  placeholder="e.g., Galaxy Conference"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300">Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={form.capacity}
                    onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                    className="mt-1 w-full rounded-md bg-white/20 border border-white/30 px-3 py-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300">Floor</label>
                  <input
                    type="number"
                    min="0"
                    value={form.floor}
                    onChange={(e) => setForm((f) => ({ ...f, floor: e.target.value }))}
                    className="mt-1 w-full rounded-md bg-white/20 border border-white/30 px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300">Amenities</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {AMENITIES.map((a) => {
                    const checked = form.amenityIds.includes(a.id);
                    return (
                      <label key={a.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleAmenityInForm(a.id)}
                        />
                        {a.name}
                      </label>
                    );
                  })}
                </div>
              </div>

              {addErr && (
                <div className="text-xs text-red-200 bg-red-900/30 border border-red-700/40 rounded px-3 py-2">
                  {addErr}
                </div>
              )}

              <div className="mt-2 flex items-center justify-end gap-2">
                <button
                  className="px-3 py-1.5 rounded-md border border-white/30 hover:bg-white/10 text-sm"
                  onClick={resetForm}
                  disabled={adding}
                >
                  Reset
                </button>
                <button
                  className="px-4 py-1.5 rounded-md bg-white text-slate-900 font-semibold text-sm disabled:opacity-60"
                  onClick={submitNewRoom}
                  disabled={adding}
                >
                  {adding ? "Saving..." : "Save Room"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------- UI Helpers ----------------- */

function GlassCard({ children, className = "" }) {
  return (
    <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 ${className}`}>
      {children}
    </div>
  );
}

function SkeletonLine({ short = false }) {
  return (
    <div className={`h-4 rounded ${short ? "w-16" : "w-36"} bg-white/20 animate-pulse`} />
  );
}

function Th({ label, sortKey, sortBy, sortDir, onSort, right = false }) {
  const active = sortBy === sortKey;
  return (
    <th scope="col" className={`px-4 py-3 font-medium ${right ? "text-right" : "text-left"}`}>
      <button
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1 ${active ? "text-white" : "text-slate-300"} hover:text-white`}
        title="Sort"
      >
        {label} <ArrowUpDown size={14} />
        {active && <span className="text-[10px] opacity-70">{sortDir}</span>}
      </button>
    </th>
  );
}

function Td({ children, right = false }) {
  return (
    <td className={`px-4 py-3 ${right ? "text-right" : "text-left"} text-slate-200`}>
      {children}
    </td>
  );
}

function UtilBadge({ value }) {
  const cls = utilBadgeColor(value);
  return <span className={`text-[10px] px-2 py-0.5 rounded ${cls}`}>{badgeLabel(value)}</span>;
}

function utilColor(v = 0) {
  if (v >= 70) return "bg-green-400";
  if (v >= 30) return "bg-yellow-400";
  return "bg-red-400";
}
function utilBadgeColor(v = 0) {
  if (v >= 70) return "bg-green-100/20 text-green-200 border border-green-300/30";
  if (v >= 30) return "bg-yellow-100/20 text-yellow-200 border border-yellow-300/30";
  return "bg-red-100/20 text-red-200 border border-red-300/30";
}
function badgeLabel(v = 0) {
  if (v >= 70) return "High";
  if (v >= 30) return "Medium";
  return "Low";
}
function safe(s) {
  return (s ?? "").replace(/\s+/g, " ").trim();
}
function csvEscape(val) {
  if (val == null) return "";
  const s = String(val);
  if (s.includes(",") || s.includes("\n") || s.includes('"')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}
