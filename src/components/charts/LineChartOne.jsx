import React from "react";

export default function LineChartOne() {
  const options = {
    legend: {
      show: false,
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#465FFF", "#9CB9FF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "line",
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: "straight",
      width: [2, 2],
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    markers: {
      size: 0,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      x: {
        format: "dd MMM yyyy",
      },
    },
    xaxis: {
      type: "category",
      categories: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          colors: ["#6B7280"],
        },
      },
      title: {
        text: "",
        style: {
          fontSize: "0px",
        },
      },
    },
  };

  const series = [
    {
      name: "Sales",
      data: [180, 190, 170, 160, 175, 165, 170, 205, 230, 210, 240, 235],
    },
    {
      name: "Revenue",
      data: [40, 30, 50, 40, 55, 40, 70, 100, 110, 120, 150, 140],
    },
  ];

  // Simple line chart using SVG
  const maxValue = Math.max(...series[0].data, ...series[1].data);
  const width = 1000;
  const height = 310;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  
  const getX = (index) => padding + (index / (series[0].data.length - 1)) * chartWidth;
  const getY = (value) => padding + chartHeight - (value / maxValue) * chartHeight;
  
  const createPath = (data) => {
    return data.map((value, index) => {
      const x = getX(index);
      const y = getY(value);
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ');
  };
  
  const createAreaPath = (data) => {
    const path = createPath(data);
    const lastX = getX(data.length - 1);
    const lastY = getY(0);
    const firstX = getX(0);
    const firstY = getY(0);
    return `${path} L ${lastX} ${lastY} L ${firstX} ${firstY} Z`;
  };
  
  return (
    <div className="max-w-full overflow-x-auto custom-scrollbar">
      <div className="min-w-[1000px]">
        <svg width={width} height={height} className="w-full">
          {/* Area for Sales */}
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#465FFF" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#465FFF" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#9CB9FF" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#9CB9FF" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={createAreaPath(series[0].data)}
            fill="url(#gradient1)"
          />
          <path
            d={createAreaPath(series[1].data)}
            fill="url(#gradient2)"
          />
          {/* Lines */}
          <path
            d={createPath(series[0].data)}
            fill="none"
            stroke="#465FFF"
            strokeWidth="2"
          />
          <path
            d={createPath(series[1].data)}
            fill="none"
            stroke="#9CB9FF"
            strokeWidth="2"
          />
          {/* X-axis labels */}
          {options.xaxis.categories.map((label, index) => {
            const x = getX(index);
            return (
              <text
                key={index}
                x={x}
                y={height - 10}
                textAnchor="middle"
                className="text-xs fill-gray-500 dark:fill-gray-400"
              >
                {label}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
