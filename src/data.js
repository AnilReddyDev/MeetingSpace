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
    image:"https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600",
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




const formatDate = (date) => {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

const formatDateForInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// const AmenityIcon = ({ type }) => {
//   switch (type) {
//     case "TV":
//       return <Monitor size={14} />;
//     case "Video Conf":
//       return <Monitor size={14} className="text-blue-500" />;
//     case "Wifi":
//       return <Wifi size={14} />;
//     case "Coffee":
//       return <Coffee size={14} />;
//     case "Whiteboard":
//       return <div className="w-3.5 h-3.5 border border-current rounded-sm" />;
//     default:
//       return <div className="w-3.5 h-3.5 bg-gray-400 rounded-full" />;
//   }
// };


const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18]; // 18 is end boundary (exclusive)

const IMAGE_URLS = [
  "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1600508774634-4e11d34730e2?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=600",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=600"
];


export { formatDate, formatDateForInput , ROOMS, INITIAL_BOOKINGS, HOURS, IMAGE_URLS}
