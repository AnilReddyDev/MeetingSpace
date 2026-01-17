
import React, { useEffect, useMemo, useState } from "react";
import FilterComp from "../components/FilterComp";
import RoomCardComp from "../components/RoomCardComp";
import UserScheduleComp from "../components/UserScheduleComp";
import { api } from "../config/api";
import { useNavigate } from "react-router-dom";

export default function Home() {
  // Amenity names aligned with backend amenity IDs (1-based index)
  // id:1 -> Projector, 2 -> WiFi, 3 -> Whiteboard, 4 -> TV, 5 -> Coffee
  const AMENITIES = ["Projector", "WiFi", "Whiteboard", "TV", "Coffee"];

  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const [fetchedListings, setFetchedListings] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [roomsById, setRoomsById] = useState({});

  // UPDATED: use selectedAmenities multi-select
  const [filters, setFilters] = useState({
    date: startOfDay,
    minCapacity: 1,
    selectedAmenities: [], // <-- NEW
  });

  const navigate = useNavigate();

  const fetchListings = async () => {
    try {
      const { data } = await api.get("/api/v1/user/rooms");
      const BookingsDataResponse = await api.get("/api/v1/bookings/bookings");
      setUserBookings(BookingsDataResponse.data);
      setFetchedListings(data);

      const map = {};
      (data || []).forEach((r) => {
        map[r.id] = r;
      });
      setRoomsById(map);

      // console.log("Data Fetched: ", data);
      // console.log("Bookings Data Fetched: ", BookingsDataResponse.data);
    } catch (error) {
      console.error("Fetch error: ", error);
    }
  };

  useEffect(() => {
    fetchListings();
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, []);

  // Helper: convert a room's amenity IDs to names using AMENITIES map above
  const getRoomAmenityNames = (room) =>
    (room?.amenities || [])
      .map((a) => {
        const idx = (a?.id ?? 0) - 1;
        return AMENITIES[idx];
      })
      .filter(Boolean);

  const filteredRooms = useMemo(() => {
    return fetchedListings.filter((room) => {
      const meetsCapacity = (room.capacity || 0) >= filters.minCapacity;

      const selected = filters.selectedAmenities || [];
      if (selected.length === 0) {
        return meetsCapacity;
      }

      const roomAmenityNames = getRoomAmenityNames(room);
      const hasAllSelected = selected.every((s) => roomAmenityNames.includes(s));

      return meetsCapacity && hasAllSelected;
    });
  }, [filters, fetchedListings]);

  return (
    <div className="min-h-screen w-full bg-hcl-blue-gradient">
      {/* push content below fixed header (h-16 ≈ 64px) */}
      <div className="pt-20" />

      {/* Two-column layout */}
      <div className="mx-auto flex w-full max-w-7xl gap-4 px-4">
        {/* ============== Left: Filters (Sticky, does NOT scroll) ============== */}
        <div className="hidden sm:block sm:w-4/12">
          <div className="sm:sticky sm:top-20">
            <div className="w-full p-0">
              <FilterComp value={filters} onChange={setFilters} />
            </div>
          </div>
        </div>

        {/* On mobile, show filters inline above results */}
        <div className="block sm:hidden w-full">
          <FilterComp value={filters} onChange={setFilters} />
        </div>

        {/* ============== Right: Results (Scrolls independently) ============== */}
        <div
          className="
            sm:w-8/12 w-full
            sm:h-[calc(100vh-6.5rem)]
            sm:overflow-y-auto hide-scrollbar
            sm:pr-2
            flex flex-col gap-4
          "
        >
          <UserScheduleComp
            userBookings={userBookings}
            roomsById={roomsById}
            onCancelled={() => fetchListings()}
            initialVisible={2}
          />

          <p className="text-sm text-gray-900 mt-2">
            Found {filteredRooms.length} space{filteredRooms.length !== 1 ? "s" : ""} matching your criteria
          </p>

          {filteredRooms.map((room) => (
            <RoomCardComp
              key={room.id}
              sample={room}
              selectedDate={filters.date}
              onBooked={fetchListings}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
