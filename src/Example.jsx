import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Users,
  Search,
  Filter,
  Monitor,
  Wifi,
  Coffee,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Menu,
  LogOut,
} from "lucide-react";

// --- Mock Data ---

const ROOMS = [
  {
    id: 1,
    name: "Galaxy Conference",
    capacity: 12,
    floor: 2,
    amenities: ["TV", "Video Conf", "Whiteboard", "Wifi"],
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: 2,
    name: "Nebula Huddle",
    capacity: 4,
    floor: 2,
    amenities: ["TV", "Wifi"],
    image:
      "https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: 3,
    name: "Starlight Suite",
    capacity: 8,
    floor: 3,
    amenities: ["Whiteboard", "Wifi", "Coffee"],
    image:
      "https://images.unsplash.com/photo-1517502884422-41e157d2fc0d?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: 4,
    name: "Cosmos Corner",
    capacity: 6,
    floor: 1,
    amenities: ["Video Conf", "Wifi"],
    image:
      "https://images.unsplash.com/photo-1505409859467-3a796fd5798e?auto=format&fit=crop&q=80&w=600",
  },
];

const INITIAL_BOOKINGS = [
  {
    id: "1",
    roomId: 1,
    title: "Q4 Strategy",
    startTime: 10,
    duration: 1.5,
    user: "Alice",
  },
  {
    id: "2",
    roomId: 1,
    title: "Client Sync",
    startTime: 14,
    duration: 1,
    user: "Bob",
  },
  {
    id: "3",
    roomId: 2,
    title: "1:1 Sync",
    startTime: 11,
    duration: 0.5,
    user: "Charlie",
  },
  {
    id: "4",
    roomId: 3,
    title: "Design Review",
    startTime: 13,
    duration: 2,
    user: "David",
  },
];

const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

// --- Components ---

const formatDate = (date) => {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const formatDateForInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const AmenityIcon = ({ type }) => {
  switch (type) {
    case "TV":
      return <Monitor size={14} />;
    case "Video Conf":
      return <Monitor size={14} className="text-blue-500" />;
    case "Wifi":
      return <Wifi size={14} />;
    case "Coffee":
      return <Coffee size={14} />;
    case "Whiteboard":
      return <div className="w-3.5 h-3.5 border border-current rounded-sm" />;
    default:
      return <div className="w-3.5 h-3.5 bg-gray-400 rounded-full" />;
  }
};

const Navbar = () => (
  <nav className="bg-slate-900 text-white h-16 flex items-center justify-between px-6 shadow-md fixed w-full z-50">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
        <Users size={20} className="text-white" />
      </div>
      <span className="font-bold text-xl tracking-tight">Teamspace</span>
    </div>
    <div className="flex items-center gap-4">
      <div className="hidden md:flex items-center gap-2 text-sm text-slate-400 mr-4">
        <span>San Francisco, HQ</span>
        <MapPin size={14} />
      </div>
      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold border border-slate-600">
        JD
      </div>
    </div>
  </nav>
);

const TimelineBar = ({ bookings, onSlotClick }) => {
  return (
    <div className="relative h-12 bg-slate-50 rounded-md border border-slate-200 overflow-hidden flex">
      {HOURS.map((hour) => (
        <div
          key={hour}
          className="flex-1 border-r border-slate-200 relative group cursor-pointer hover:bg-blue-50 transition-colors"
          onClick={() => onSlotClick(hour)}
        >
          <span className="absolute bottom-1 left-1 text-[10px] text-slate-400 select-none">
            {hour}:00
          </span>
        </div>
      ))}

      {/* Render Bookings */}
      {bookings.map((booking) => {
        // Calculate position based on 9AM start
        const startOffset = booking.startTime - 9;
        const width = booking.duration;
        const leftPercent = (startOffset / (18 - 9)) * 100;
        const widthPercent = (width / (18 - 9)) * 100;

        return (
          <div
            key={booking.id}
            className="absolute top-1 bottom-1 bg-red-100 border-l-4 border-red-500 rounded-r-sm z-10 flex items-center px-2 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-not-allowed"
            style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
            title={`${booking.title} by ${booking.user}`}
          >
            <span className="text-xs font-medium text-red-900 truncate">
              {booking.title}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default function Example() {
  const [date, setDate] = useState(new Date());
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(9);
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [filters, setFilters] = useState({ minCapacity: 1, hasVideo: false });
  const [formTitle, setFormTitle] = useState("");
  const [formDuration, setFormDuration] = useState("1");

  // Date Navigation Handlers
  const handlePrevDay = () => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() - 1);
    setDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + 1);
    setDate(newDate);
  };

  const handleDateChange = (e) => {
    if (!e.target.value) return;
    const [y, m, d] = e.target.value.split("-").map(Number);
    // Create date using local time constructor to avoid UTC shifts
    setDate(new Date(y, m - 1, d));
  };

  // Filter Logic
  const filteredRooms = ROOMS.filter((room) => {
    if (room.capacity < filters.minCapacity) return false;
    if (filters.hasVideo && !room.amenities.includes("Video Conf"))
      return false;
    return true;
  });

  const handleBookClick = (room, startTime) => {
    setSelectedRoom(room);
    if (startTime) setSelectedTimeSlot(startTime);
    setIsModalOpen(true);
  };

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    if (!selectedRoom) return;

    const newBooking = {
      id: Math.random().toString(),
      roomId: selectedRoom.id,
      title: formTitle || "Team Meeting",
      startTime: selectedTimeSlot,
      duration: parseFloat(formDuration),
      user: "You",
    };

    setBookings([...bookings, newBooking]);
    setIsModalOpen(false);
    setFormTitle("");
    // Show a simplified "toast" via console or alert in a real app
    // alert("Booking Confirmed!");
  };

  const formatTime = (hour) => {
    const h = Math.floor(hour);
    const m = (hour - h) * 60;
    return `${h}:${m === 0 ? "00" : m} ${h >= 12 ? "PM" : "AM"}`;
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-900">
      <Navbar />

      <main className="pt-20 pb-10 px-4 max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
        {/* --- Sidebar Filters --- */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Filter size={18} /> Filters
            </h2>

            {/* Date Picker (Interactive) */}
            <div className="mb-6">
              <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">
                Date
              </label>
              <div className="flex items-center justify-between bg-slate-100 p-2 rounded-lg relative">
                <button
                  onClick={handlePrevDay}
                  className="p-1 hover:bg-white rounded-md transition-colors text-slate-600 hover:text-slate-900 z-10"
                >
                  <ChevronLeft size={16} />
                </button>

                <div className="relative flex-1 text-center group">
                  <span className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer">
                    {formatDate(date)}
                  </span>
                  {/* Invisible Date Input Overlay */}
                  <input
                    type="date"
                    value={formatDateForInput(date)}
                    onChange={handleDateChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  />
                </div>

                <button
                  onClick={handleNextDay}
                  className="p-1 hover:bg-white rounded-md transition-colors text-slate-600 hover:text-slate-900 z-10"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Capacity Slider */}
            <div className="mb-6">
              <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">
                Min Capacity: {filters.minCapacity}
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={filters.minCapacity}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    minCapacity: parseInt(e.target.value),
                  })
                }
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Amenities */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">
                Amenities
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.hasVideo}
                    onChange={(e) =>
                      setFilters({ ...filters, hasVideo: e.target.checked })
                    }
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Video Conference
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Whiteboard
                </label>
              </div>
            </div>
          </div>

          {/* My Upcoming Meetings (Mini) */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-semibold text-sm text-slate-800 mb-3">
              Your Schedule
            </h3>
            <div className="space-y-3">
              <div className="flex gap-3 items-start p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                <div className="w-1 bg-green-500 h-10 rounded-full"></div>
                <div>
                  <div className="text-xs font-bold text-slate-700">
                    10:00 - 11:30
                  </div>
                  <div className="text-xs text-slate-500">
                    Galaxy Conference
                  </div>
                  <div className="text-xs text-blue-600 mt-1 font-medium">
                    Check-in
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* --- Main Content --- */}
        <section className="flex-1">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Available Rooms
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Found {filteredRooms.length} spaces matching your criteria
              </p>
            </div>
            {/* Legend */}
            <div className="flex gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-slate-100 border border-slate-300 rounded-sm"></div>{" "}
                Available
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-100 border border-red-500 rounded-sm"></div>{" "}
                Booked
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row transition-all hover:shadow-md group"
              >
                {/* Room Image & Info */}
                <div className="w-full md:w-64 p-4 border-b md:border-b-0 md:border-r border-slate-100 flex gap-4 md:block flex-shrink-0">
                  <img
                    src={room.image}
                    alt={room.name}
                    className="w-20 h-20 md:w-full md:h-32 object-cover rounded-lg mb-3"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900">{room.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 mb-2">
                      <span className="flex items-center gap-1">
                        <Users size={12} /> {room.capacity}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span>Floor {room.floor}</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {room.amenities.map((a) => (
                        <div
                          key={a}
                          className="bg-slate-100 px-2 py-1 rounded text-[10px] font-medium text-slate-600 flex items-center gap-1"
                        >
                          <AmenityIcon type={a} /> {a}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Timeline Visualization */}
                <div className="flex-1 p-4 flex flex-col justify-center">
                  <div className="mb-2 flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Today's Availability
                    </span>
                    <button
                      onClick={() => handleBookClick(room)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-md font-medium shadow-sm"
                    >
                      Quick Book
                    </button>
                  </div>
                  <TimelineBar
                    bookings={bookings.filter((b) => b.roomId === room.id)}
                    onSlotClick={(start) => handleBookClick(room, start)}
                  />
                </div>
              </div>
            ))}

            {filteredRooms.length === 0 && (
              <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
                <Search className="mx-auto text-slate-300 mb-2" size={48} />
                <h3 className="text-slate-600 font-medium">No rooms found</h3>
                <p className="text-slate-400 text-sm">
                  Try adjusting your filters
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* --- Booking Modal --- */}
      {isModalOpen && selectedRoom && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900">
                  Book {selectedRoom.name}
                </h3>
                <p className="text-xs text-slate-500">{formatDate(date)}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmBooking} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Meeting Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Marketing Sync"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Start Time
                  </label>
                  <select
                    value={selectedTimeSlot}
                    onChange={(e) =>
                      setSelectedTimeSlot(parseFloat(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {HOURS.map((h) => (
                      <option key={h} value={h}>
                        {formatTime(h)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Duration
                  </label>
                  <select
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="0.5">30 min</option>
                    <option value="1">1 hour</option>
                    <option value="1.5">1.5 hours</option>
                    <option value="2">2 hours</option>
                    <option value="3">3 hours</option>
                  </select>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg text-blue-700 text-sm">
                <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
                <p>Room includes: {selectedRoom.amenities.join(", ")}</p>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm shadow-blue-200 transition-all hover:shadow-md"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
