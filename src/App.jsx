import React from "react";
import FilterComp from "./components/FilterComp";
import RoomCardComp from "./components/RoomCardComp";
import HeaderComp from "./components/HeaderComp";

export default function App() {
  return (
    <div className="h-screen w-full  gap-4 bg-hcl-blue-gradient flex flex-col">
      <HeaderComp />
      <div className="flex items-start justify-center">
        <div className="left-con bg-gray-700 pr-3 flex justify-end w-1/4">
          <FilterComp />
        </div>
        <div className="right-con bg-gray-400 pl-2 w-3/4">
          <RoomCardComp />
        </div>
      </div>
    </div>
  );
}
