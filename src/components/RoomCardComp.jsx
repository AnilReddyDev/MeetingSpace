
// src/components/RoomCardComp.jsx
import React, { useMemo, useState } from "react";
import { Monitor, Wifi, Coffee, Users, Projector } from "lucide-react";
import { HOURS, IMAGE_URLS } from "../data";
import { api } from "../config/api";

// Business hours: start inclusive, end exclusive
const MIN_HOUR = 9;   // earliest start
const MAX_HOUR = 18;  // latest end (exclusive) → allows 17–18, but not 18–19

// Produce "YYYY-MM-DDTHH:mm:ss.SSS" (local, no timezone), perfect for LocalDateTime
const toLocalISOString = (d) => {
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const HH = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  const SSS = String(d.getMilliseconds()).padStart(3, "0");
  return `${yyyy}-${MM}-${dd}T${HH}:${mm}:${ss}.${SSS}`;
};

/**
 * Props:
 *  - sample: room object { id, name, capacity, floor, amenities, bookings[] }
 *  - selectedDate: Date | string (preferred)
 *  - onBooked(): void (optional) -> parent can refetch after success
 *
 * Notes:
 *  - End hour is EXCLUSIVE. Example: 9–11 means 9–10 and 10–11 are booked.
 *  - We add 18 as an END choice only (not a start slot), so 17–18 is bookable.
 */
export default function RoomCardComp({
  sample,
  selectedDate,
  onBooked,
}) {
  const amenities = ["Projector", "WiFi", "Whiteboard", "TV", "Coffee"];

  const AmenityIcon = ({ type }) => {
    switch (type) {
      case "TV":
        return <Monitor size={14} />;
      case "Projector":
        return <Projector size={14} />;
      case "WiFi":
        return <Wifi size={14} />;
      case "Coffee":
        return <Coffee size={14} />;
      case "Whiteboard":
        return <div className="w-3.5 h-3.5 border border-current rounded-sm" />;
      default:
        return <div className="w-3.5 h-3.5 bg-gray-400 rounded-full" />;
    }
  };

  // ---- Date selection ----
  const toDate = (d) => (d instanceof Date ? d : new Date(d));
  const baseDate = selectedDate ?? new Date();
  const dayRef = useMemo(() => {
    const d = toDate(baseDate);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  }, [baseDate]);

  // ---- Compute booked hours for that date ----
  // bookedHours contains slot starts (e.g., 9, 10, ..., 17) that are already taken.
  const bookedHours = useMemo(() => {
    const set = new Set();
    const bookings = sample?.bookings || [];
    if (!bookings.length) return set;

    const dayStart = new Date(dayRef); // 00:00 selected day (local)
    const dayEnd = new Date(dayRef);
    dayEnd.setHours(24, 0, 0, 0); // next day 00:00

    bookings.forEach((b) => {
      if (b.status !== "CONFIRMED") return;

      const start = toDate(b.startTime);
      const end = toDate(b.endTime);

      const overlapsDay = start < dayEnd && end > dayStart;
      if (!overlapsDay) return;

      HOURS.forEach((hour) => {
        const slotStart = new Date(dayRef);
        slotStart.setHours(hour, 0, 0, 0);
        const slotEnd = new Date(dayRef);
        slotEnd.setHours(hour + 1, 0, 0, 0);
        if (slotStart < end && slotEnd > start) {
          set.add(hour);
        }
      });
    });

    return set;
  }, [sample?.bookings, dayRef]);

  const lastHour = HOURS[HOURS.length - 1];
  const firstHour = HOURS[0];

  // ---------------- BOOKING MODAL STATE ----------------
  const [isOpen, setIsOpen] = useState(false);
  const [startHour, setStartHour] = useState(null); // number | null
  const [endHour, setEndHour] = useState(null);     // number | null (exclusive)
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetModal = () => {
    setStartHour(null);
    setEndHour(null);
    setErrorMsg("");
  };

  const isRangeAvailable = (start, endExclusive) => {
    for (let h = start; h < endExclusive; h++) {
      if (bookedHours.has(h)) return false;
    }
    return true;
  };

  const onHourPick = (hour) => {
    setErrorMsg("");

    // PHASE 1: Picking start
    if (startHour === null) {
      // start must be within [9,17]
      if (hour < MIN_HOUR || hour >= MAX_HOUR) return;
      if (bookedHours.has(hour)) return;
      setStartHour(hour);
      setEndHour(null);
      return;
    }

    // PHASE 2: Picking end (exclusive)
    if (hour <= startHour) {
      // If user clicks a previous hour, treat as resetting start (if valid)
      if (hour >= MIN_HOUR && hour < MAX_HOUR && !bookedHours.has(hour)) {
        setStartHour(hour);
        setEndHour(null);
      }
      return;
    }
    if (hour > MAX_HOUR) return; // end cannot exceed 18
    if (!isRangeAvailable(startHour, hour)) {
      setErrorMsg("Selected range crosses a booked slot. Try a different range.");
      return;
    }
    setEndHour(hour);
  };

  const isSelected = (h) => {
    if (startHour === null) return false;
    if (endHour === null) return h === startHour;
    return h >= startHour && h < endHour; // end exclusive
  };

  // -------- END choices: allow 18 as end boundary (NOT as a start slot) --------
  const END_CHOICES = useMemo(() => {
    // HOURS likely [9..17]. Include 18 for end selection.
    return Array.from(new Set([...HOURS, MAX_HOUR])).sort((a, b) => a - b);
  }, []);

  // Confirm booking
  const handleConfirmBooking = async () => {
    setErrorMsg("");

    if (startHour === null || endHour === null) {
      setErrorMsg("Please select a start and end time.");
      return;
    }
    if (endHour <= startHour) {
      setErrorMsg("End time must be after start time.");
      return;
    }
    if (startHour < MIN_HOUR || endHour > MAX_HOUR) {
      setErrorMsg(`Please choose a range within ${MIN_HOUR}:00–${MAX_HOUR}:00.`);
      return;
    }
    if (!isRangeAvailable(startHour, endHour)) {
      setErrorMsg("Selected range crosses a booked slot. Choose a free range.");
      return;
    }

    const startDt = new Date(dayRef);
    startDt.setHours(startHour, 0, 0, 0);
    const endDt = new Date(dayRef);
    endDt.setHours(endHour, 0, 0, 0);

    const payload = {
      roomId: sample.id,
      startTime: toLocalISOString(startDt), // local ISO, no Z
      endTime: toLocalISOString(endDt),
    };

    try {
      setIsSubmitting(true);
      await api.post("/api/v1/bookings", payload); // plural
      setIsOpen(false);
      resetModal();
      if (typeof onBooked === "function") onBooked();
    } catch (err) {
      console.error("Booking error:", err, payload);
      setErrorMsg(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Booking failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`w-full sm:w-10/12 p-4 flex flex-col gap-3 bg-slate-100/35 rounded-md`}>
      {/* Top Section */}
      <div className="top-con w-full flex">
        <img
          src={IMAGE_URLS[Math.floor(Math.random() * IMAGE_URLS.length)]}
          alt="room"
          className="w-1/4 h-3/4 rounded-md object-cover"
        />

        <div className="px-4 flex flex-col gap-2 text-sm font-thin w-3/4">
          <h1 className="text-base font-semibold">{sample?.name}</h1>
          <div className="flex gap-3">
            <h1 className="flex gap-1 items-center">
              <Users size={18} /> {sample?.capacity}
            </h1>
            <h1>Floor : {sample?.floor}</h1>
          </div>

          <ol className="flex gap-2 flex-wrap">
            {sample?.amenities?.map((amen, index) => {
              const label = amenities[amen.id - 1] ?? "Amenity";
              return (
                <li
                  key={index}
                  className="flex gap-1 bg-slate-300/40 rounded-md px-2 py-1 text-sm items-center"
                >
                  <AmenityIcon type={label} /> {label}
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <div className="h-[1px] w-full bg-slate-200/65 rounded-md" />

      {/* Availability: for the chosen day */}
      <div className="bottom-con w-full flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="uppercase text-xs font-semibold text-gray-900/80">
            Availability on {dayRef.toLocaleDateString()}
          </h1>
          <button
            className="px-3 py-1.5 rounded-md bg-white text-slate-900 text-sm font-semibold hover:bg-slate-200 transition"
            onClick={() => {
              resetModal();
              setIsOpen(true);
            }}
          >
            Book
          </button>
        </div>

        {/* Availability bar (shows slot starts 9..17 only) */}
        <div className="rounded-md bg-gray-300/50 grid grid-cols-10 w-full h-10 overflow-hidden">
          {HOURS.map((hour) => {
            const isBooked = bookedHours.has(hour);
            return (
              <div
                key={hour}
                className={`relative flex-1 border-r border-slate-200 group cursor-pointer transition-colors
                  ${hour === lastHour && "border-none"}
                  ${hour === firstHour && "hover:rounded-l-md"}
                  ${hour === lastHour && "hover:rounded-r-md"}
                  ${isBooked ? "bg-red-100/70" : "hover:bg-blue-200/80"}
                `}
                title={isBooked ? "Booked" : "Available"}
              >
                {/* Time label */}
                <span className="absolute bottom-1 left-1 text-[10px] text-slate-600 select-none">
                  {hour}:00
                </span>

                {/* Red badge overlay when booked */}
                {isBooked && (
                  <span className="absolute top-1 right-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-500 text-white">
                    Booked
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ----------------- BOOKING MODAL ----------------- */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          {/* modal */}
          <div className="relative z-10 w-11/12 max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Book “{sample?.name}”</h3>
              <button
                className="text-sm px-2 py-1 rounded-md bg-white/10 hover:bg-white/20"
                onClick={() => setIsOpen(false)}
              >
                Close
              </button>
            </div>
            <p className="text-slate-200 text-sm mb-2">
              Pick a time range on <strong>{dayRef.toLocaleDateString()}</strong>
            </p>

            {/* Hour grid for selection:
                - START selection uses HOURS (9..17)
                - END selection uses END_CHOICES (9..18), where 18 is a boundary only */}
            <div className="rounded-md bg-gray-300/30 grid grid-cols-5 gap-2 p-2">
              {(startHour === null ? HOURS : END_CHOICES).map((hour) => {
                const isBoundary18 = hour === MAX_HOUR; // 18 is not a slot start, only an end boundary

                // Booked check: don't treat 18 as booked
                const booked = !isBoundary18 && bookedHours.has(hour);

                // Disable rules:
                // - Picking start: allow [9..17] only and not booked
                // - Picking end: allow (start..18] only, not booked (except 18), and must not cross booked slots
                let disabled = false;
                if (startHour === null) {
                  // Start selection
                  disabled = booked || hour < MIN_HOUR || hour >= MAX_HOUR; // 18 can't be a start
                } else {
                  // End selection (exclusive)
                  const crosses =
                    hour > startHour ? !isRangeAvailable(startHour, hour) : false;

                  disabled =
                    (booked && !isBoundary18) || // ignore booked for 18 boundary
                    hour <= startHour ||
                    hour > MAX_HOUR || // end cannot exceed 18
                    crosses;
                }

                const selected = !disabled && isSelected(hour);

                return (
                  <button
                    key={hour}
                    disabled={disabled}
                    onClick={() => onHourPick(hour)}
                    className={`h-8 text-xs rounded-md border
                      ${disabled ? "bg-gray-200/60 border-gray-300 text-gray-500 cursor-not-allowed" : ""}
                      ${!disabled && selected ? "bg-blue-200/80 border-blue-300 text-slate-900" : ""}
                      ${!disabled && !selected ? "bg-white/20 border-white/30 hover:bg-white/30" : ""}
                    `}
                    title={
                      disabled
                        ? "Not available"
                        : startHour === null
                        ? `Select start ${hour}:00`
                        : `Select end ${hour}:00`
                    }
                  >
                    {hour}:00
                  </button>
                );
              })}
            </div>

            {/* Helper and error */}
            <div className="mt-3 text-xs text-slate-200">
              {startHour !== null && endHour === null && (
                <p>
                  Now choose an <strong>end</strong> time after {startHour}:00 (up to 18:00).
                </p>
              )}
              {startHour !== null && endHour !== null && (
                <p>
                  Selected: <strong>{startHour}:00</strong> to <strong>{endHour}:00</strong>
                </p>
              )}
              {errorMsg && <p className="text-red-300 mt-1">{errorMsg}</p>}
            </div>

            {/* Actions */}
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                className="px-3 py-1.5 rounded-md border border-white/30 hover:bg-white/10 text-sm"
                onClick={resetModal}
                disabled={isSubmitting}
              >
                Reset
              </button>
              <button
                className="px-4 py-1.5 rounded-md bg-white text-slate-900 font-semibold text-sm disabled:opacity-60"
                onClick={handleConfirmBooking}
                disabled={isSubmitting || startHour === null || endHour === null}
              >
                {isSubmitting ? "Booking..." : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
``
