
import React, { useMemo, useState } from "react";
import { api } from "../config/api";

/**
 * Props:
 * - userBookings: Array<Booking>
 * - roomsById?: Record<number, { id: number; name: string }>
 * - onCancelled?: (bookingId: number) => void
 * - initialVisible?: number  // default 2
 */
export default function UserScheduleComp({
  userBookings = [],
  roomsById = {},
  onCancelled,
  initialVisible = 2,
}) {
  const [submittingId, setSubmittingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [expanded, setExpanded] = useState(false); // controls show more/less

  const toDate = (s) => (s instanceof Date ? s : new Date(s));

  // e.g., "Fri, Jan 16, 2026"
  const formatDate = (dateStr) => {
    const d = toDate(dateStr);
    const opts = { weekday: "short", month: "short", day: "2-digit", year: "numeric" };
    return d.toLocaleDateString(undefined, opts);
  };

  // e.g., "10:00 - 11:30"
  const formatTimeRange = (startStr, endStr) => {
    const s = toDate(startStr);
    const e = toDate(endStr);
    const opts = { hour: "2-digit", minute: "2-digit", hour12: false };
    return `${s.toLocaleTimeString([], opts)} - ${e.toLocaleTimeString([], opts)}`;
  };

  const getRoomName = (booking) => {
    if (booking?.room?.name) return booking.room.name;
    const rid = booking?.room?.id ?? booking?.roomId;
    if (rid && roomsById[rid]?.name) return roomsById[rid].name;
    return `Room #${rid ?? "—"}`;
  };

  const isToday = (d) => {
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  };

  const canCancel = (booking) => {
    if (booking.status !== "CONFIRMED") return false;
    const start = toDate(booking.startTime);
    const now = new Date();
    return start > now; // allow only before start
  };

  const canCheckIn = (booking) => {
    if (booking.status !== "CONFIRMED") return false;
    const start = toDate(booking.startTime);
    const end = toDate(booking.endTime);
    const now = new Date();
    return now >= start && now <= end && isToday(start);
  };

  // Sort by start time ascending for consistent view

const sortedBookings = useMemo(() => {
  const statusRank = {
    CONFIRMED: 0,
    COMPLETED: 2,
    CANCELLED: 3,
  };
  const now = new Date();

  const toDate = (s) => (s instanceof Date ? s : new Date(s));

  const rank = (b) => {
    const start = toDate(b.startTime);
    const base = statusRank[b.status] ?? 99;

    // For CONFIRMED: upcoming gets highest priority (0), past gets 1
    if (b.status === "CONFIRMED") {
      return start >= now ? 0 : 1;
    }
    return base;
  };

  return [...userBookings].sort((a, b) => {
    const ra = rank(a);
    const rb = rank(b);
    if (ra !== rb) return ra - rb;

    // within group: nearest upcoming first (ascending)
    const sa = toDate(a.startTime).getTime();
    const sb = toDate(b.startTime).getTime();
    return sa - sb;
  });
}, [userBookings]);


  // Slicing logic for show more/less
  const visibleCount = expanded ? sortedBookings.length : initialVisible;
  const visibleItems = sortedBookings.slice(0, visibleCount);
  const hiddenCount = Math.max(0, sortedBookings.length - visibleCount);

  // --- Actions ---
  const handleCancel = async (bookingId) => {
    setErrorMsg("");
    if (!bookingId) return;
    const confirmed = window.confirm("Cancel this booking?");
    if (!confirmed) return;

    try {
      setSubmittingId(bookingId);
      await api.post(`/api/v1/bookings/${bookingId}/cancel`);
      if (typeof onCancelled === "function") onCancelled(bookingId);
    } catch (err) {
      console.error("Cancel error:", err);
      setErrorMsg(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to cancel booking. Please try again."
      );
    } finally {
      setSubmittingId(null);
    }
  };

  const handleCheckIn = (booking) => {
    // Wire to your real flow
    alert(
      `Checked in for ${getRoomName(booking)} (${booking.reference ?? booking.id})`
    );
  };

  return (
    <div className="w-full mt-5 sm:mt-0 sm:w-10/12 p-4 flex flex-col gap-3 bg-slate-100/35 rounded-md">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold">Your Schedule</h1>
        {sortedBookings.length > initialVisible && !expanded && (
          <span className="text-[11px] text-slate-600">
            +{sortedBookings.length - initialVisible} more
          </span>
        )}
      </div>

      {errorMsg && (
        <div className="text-xs text-red-700 bg-red-100 border border-red-200 rounded px-3 py-2">
          {errorMsg}
        </div>
      )}

      {visibleItems.length === 0 ? (
        <p className="text-sm text-slate-700">No upcoming bookings.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {visibleItems.map((b) => {
            const dateLabel = formatDate(b.startTime);
            const timeLabel = formatTimeRange(b.startTime, b.endTime);
            const roomName = getRoomName(b);
            const isCancelable = canCancel(b);
            const isCheckinEnabled = canCheckIn(b);

            return (
              <div
                key={b.id}
                className={`text-xs border-l-4 px-4 py-2 rounded bg-white/60 ${
                  b.status === "CONFIRMED" ? "border-green-500" : "border-gray-400"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col">
                    {/* Date + Time in one clear line */}
                    <h2 className="font-semibold">
                      {dateLabel} • {timeLabel}
                    </h2>
                    <p className="text-gray-800">{roomName}</p>

                    {/* Status & Ref */}
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className={`inline-block text-[10px] px-2 py-0.5 rounded ${
                          b.status === "CONFIRMED"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {b.status}
                      </span>
                      {b.reference && (
                        <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                          {b.reference}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    {/* <button
                      className="text-blue-600 font-semibold disabled:opacity-40"
                      onClick={() => handleCheckIn(b)}
                      disabled={!isCheckinEnabled}
                      title={
                        isCheckinEnabled
                          ? "Check-in"
                          : "Check-in available only during booked time"
                      }
                    >
                      Check-in
                    </button> */}

                    <button
                      className="text-red-600 font-semibold disabled:opacity-40"
                      onClick={() => handleCancel(b.id)}
                      disabled={!isCancelable || submittingId === b.id}
                      title={
                        isCancelable
                          ? "Cancel booking"
                          : "Cannot cancel (already started or cancelled)"
                      }
                    >
                      {submittingId === b.id ? "Cancelling..." : "Cancel"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Toggle Button */}
          {sortedBookings.length > initialVisible && (
            <div className="flex justify-center pt-2">
              <button
                className="px-3 py-1.5 rounded-md bg-white text-slate-900 text-sm font-semibold hover:bg-slate-200 transition"
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? "Show less" : "Show more"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
