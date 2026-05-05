import React from "react";

export default function Greeting({ userName }) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  return (
    <div className="flex flex-col">
      <h2 className="text-base font-bold text-gray-900">
        {getGreeting()}, {userName.split(" ")[0]}
      </h2>
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
        Chào mừng bạn trở lại!
      </p>
    </div>
  );
}

