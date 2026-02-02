import React from "react";

export default function Greeting({ userName }) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="flex flex-col">
      <h2 className="text-base font-bold text-white drop-shadow-sm">
        {getGreeting()}, {userName.split(" ")[0]}
      </h2>
      <p className="text-xs text-white/70 font-medium">
        Welcome back!
      </p>
    </div>
  );
}

