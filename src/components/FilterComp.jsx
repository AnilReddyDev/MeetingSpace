
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Funnel, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { formatDate } from "../data";

/**
 * Controlled filter component.
 * Parent (Home) owns the state. This component only renders UI and emits updates.
 *
 * Props:
 *  - value: {
 *      date: Date,
 *      minCapacity: number,
 *      selectedAmenities: string[], // <-- updated
 *    }
 *  - onChange: (nextValue) => void
 */
export default function FilterComp({ value, onChange }) {
  // Central list used by the checkboxes
  const AMENITIES = ["Projector", "WiFi", "Whiteboard", "TV", "Coffee"];

  // ---- Config: allow up to 30 days ahead ----
  const MAX_FORWARD_DAYS = 30;

  // ---- Date helpers ----
  const startOfDayLocal = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  };
  const clampToAllowed = (d) => {
    const today = startOfDayLocal(new Date());
    const maxDate = startOfDayLocal(addDays(today, MAX_FORWARD_DAYS));
    const ds = startOfDayLocal(d);
    if (ds < today) return today;
    if (ds > maxDate) return maxDate;
    return ds;
  };
  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  // Compute `today` and `maxDate` once per render (local)
  const today = startOfDayLocal(new Date());
  const maxDate = startOfDayLocal(addDays(today, MAX_FORWARD_DAYS));

  // ---- Local UI state only for the calendar popover ----
  const [showCalendar, setShowCalendar] = useState(false);
  const [viewMonth, setViewMonth] = useState(
    () => new Date(value.date.getFullYear(), value.date.getMonth(), 1)
  );
  const calendarRef = useRef(null);

  // Keep calendar month aligned when parent date changes
  useEffect(() => {
    setViewMonth(new Date(value.date.getFullYear(), value.date.getMonth(), 1));
  }, [value.date]);

  // Close the calendar when clicking outside
  useEffect(() => {
    if (!showCalendar) return;
    const handleClickOutside = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCalendar]);

  // Build label for calendar header (Month YYYY)
  const monthLabel = useMemo(() => {
    return new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(viewMonth);
  }, [viewMonth]);

  // Build a 6x7 calendar grid for the current `viewMonth`
  const daysGrid = useMemo(() => {
    const firstOfMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
    const startDay = firstOfMonth.getDay(); // 0..6 (Sun..Sat)
    const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
    const prevMonthLastDate = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 0).getDate();

    const cells = [];
    // leading (previous month)
    for (let i = 0; i < startDay; i++) {
      const dayNum = prevMonthLastDate - startDay + 1 + i;
      const d = new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, dayNum);
      cells.push({ date: d, currentMonth: false });
    }
    // current month
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), i);
      cells.push({ date: d, currentMonth: true });
    }
    // trailing (next month) to fill 42 cells
    while (cells.length < 42) {
      const last = cells[cells.length - 1].date;
      const next = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1);
      cells.push({ date: next, currentMonth: next.getMonth() === viewMonth.getMonth() });
    }
    return cells;
  }, [viewMonth]);

  // Month navigation availability
  const canGoPrevMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 0) >= today;
  const canGoNextMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1) <= maxDate;

  // Arrow (day stepper) enable/disable
  const canDecrement = startOfDayLocal(value.date) > today;
  const canIncrement = startOfDayLocal(value.date) < maxDate;

  // Emit updates to parent
  const update = (partial) => onChange({ ...value, ...partial });

  // Toggle amenity in selectedAmenities
  const toggleAmenity = (amenityName) => {
    const curr = new Set(value.selectedAmenities || []);
    if (curr.has(amenityName)) curr.delete(amenityName);
    else curr.add(amenityName);
    update({ selectedAmenities: Array.from(curr) });
  };

  return (
    <div className="w-full sm:w-9/12 h-auto p-5 flex flex-col gap-4 bg-slate-100/25 rounded-md">
      <h1 className="flex items-center text-blacks gap-2 text-base font-semibold">
        <Funnel size={17} /> Filter
      </h1>

      {/* Date row */}
      <div className="flex flex-col gap-1 relative">
        <h1 className="text-xs font-light text-black">Date</h1>
        <div className="bg-gray-300/20 rounded-md flex items-center justify-between w-full h-10 text-black px-2">
          <button
            type="button"
            aria-label="Previous day"
            disabled={!canDecrement}
            onClick={() => {
              if (!canDecrement) return;
              const nextDate = clampToAllowed(
                new Date(value.date.getFullYear(), value.date.getMonth(), value.date.getDate() - 1)
              );
              update({ date: nextDate });
              setViewMonth(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
            }}
            className={`p-1 rounded hover:bg-black/5 ${!canDecrement ? "opacity-40 cursor-not-allowed hover:bg-transparent" : ""}`}
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            onClick={() => setShowCalendar((s) => !s)}
            className="flex items-center gap-2 text-sm font-medium text-black"
            aria-haspopup="dialog"
            aria-expanded={showCalendar}
          >
            <CalendarDays size={16} className="opacity-70" />
            {formatDate ? formatDate(value.date) : value.date.toDateString()}
          </button>

          <button
            type="button"
            aria-label="Next day"
            disabled={!canIncrement}
            onClick={() => {
              if (!canIncrement) return;
              const nextDate = clampToAllowed(
                new Date(value.date.getFullYear(), value.date.getMonth(), value.date.getDate() + 1)
              );
              update({ date: nextDate });
              setViewMonth(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
            }}
            className={`p-1 rounded hover:bg-black/5 ${!canIncrement ? "opacity-40 cursor-not-allowed hover:bg-transparent" : ""}`}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Calendar popover */}
        {showCalendar && (
          <div
            ref={calendarRef}
            className="absolute top-[72px] sm:top-[64px] z-20 w-80 bg-white shadow-lg rounded-md border border-slate-200 p-3"
            role="dialog"
            aria-label="Select date"
          >
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={() => canGoPrevMonth && setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
                className={`p-1 rounded hover:bg-black/5 ${!canGoPrevMonth ? "opacity-40 cursor-not-allowed hover:bg-transparent" : ""}`}
                aria-label="Previous month"
                disabled={!canGoPrevMonth}
              >
                <ChevronLeft size={18} />
              </button>
              <div className="text-sm font-semibold">{monthLabel}</div>
              <button
                type="button"
                onClick={() => canGoNextMonth && setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
                className={`p-1 rounded hover:bg-black/5 ${!canGoNextMonth ? "opacity-40 cursor-not-allowed hover:bg-transparent" : ""}`}
                aria-label="Next month"
                disabled={!canGoNextMonth}
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="grid grid-cols-7 text-[11px] text-slate-500 mb-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="text-center py-1">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {daysGrid.map(({ date, currentMonth }, idx) => {
                const dStart = startOfDayLocal(date);
                const isDisabled = dStart < today || dStart > maxDate;
                const selected = isSameDay(dStart, startOfDayLocal(value.date));

                return (
                  <button
                    key={`${date.toISOString()}-${idx}`}
                    type="button"
                    onClick={() => {
                      if (isDisabled) return;
                      update({ date: dStart });
                      setViewMonth(new Date(dStart.getFullYear(), dStart.getMonth(), 1));
                      setShowCalendar(false);
                    }}
                    disabled={isDisabled}
                    aria-disabled={isDisabled}
                    className={[
                      "h-8 rounded flex items-center justify-center text-xs transition-colors",
                      currentMonth ? "text-slate-900" : "text-slate-400",
                      isDisabled ? "opacity-40 cursor-not-allowed" : "hover:bg-slate-100",
                      selected ? "bg-blue-600 text-white font-semibold hover:bg-blue-600" : "",
                    ].join(" ")}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Min Capacity slider (controlled) */}
      <div>
        <label className="text-xs font-medium text-black uppercase mb-2 block">
          Min Capacity: {value.minCapacity}
        </label>
        <input
          type="range"
          min="1"
          max="20"
          value={value.minCapacity}
          onChange={(e) => onChange({ ...value, minCapacity: parseInt(e.target.value, 10) })}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>

      {/* Amenities (controlled checkboxes) */}
      <div className="flex flex-col gap-3">
        <h1 className="text-xs font-medium text-black uppercase mb-2 block">Amenities</h1>
        <ol className="flex flex-col gap-2">
          {AMENITIES.map((amenity) => {
            const checked = (value.selectedAmenities || []).includes(amenity);
            const id = `amenity-${amenity.toLowerCase()}`;
            return (
              <li key={amenity} className="flex items-center text-xs font-extralight gap-2 text-slate-900">
                <input
                  id={id}
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleAmenity(amenity)}
                />
                <label htmlFor={id} className="cursor-pointer">
                  {amenity}
                </label>
              </li>
            );
          })}
        </ol>
        {(value.selectedAmenities?.length ?? 0) > 0 && (
          <button
            type="button"
            onClick={() => update({ selectedAmenities: [] })}
            className="self-start text-[11px] text-blue-700 hover:underline"
          >
            Clear amenities
          </button>
        )}
      </div>
    </div>
  );
}
``
