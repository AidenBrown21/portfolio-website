"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

interface DesktopWidgetsProps {
  currentDate: Date;
  onOpenFeaturedPhoto: () => void;
}

const WEEKDAY_HEADERS = ["S", "M", "T", "W", "T", "F", "S"] as const;
const MONTH_LABELS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
] as const;

const STATIC_WEATHER = {
  location: "West Lafayette",
  temperature: "60°",
  condition: "Cloudy",
  high: "62°",
  low: "40°",
} as const;

export default function DesktopWidgets({ currentDate, onOpenFeaturedPhoto }: DesktopWidgetsProps) {
  const [photoFailed, setPhotoFailed] = useState(false);

  const calendar = useMemo(() => {
    const year = currentDate.getFullYear();
    const monthIndex = currentDate.getMonth();
    const today = currentDate.getDate();
    const firstDayIndex = new Date(year, monthIndex, 1).getDay();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const totalCells = Math.ceil((firstDayIndex + daysInMonth) / 7) * 7;

    const cells = Array.from({ length: totalCells }, (_, index) => {
      const dayNumber = index - firstDayIndex + 1;
      return dayNumber > 0 && dayNumber <= daysInMonth ? dayNumber : null;
    });

    return {
      today,
      monthLabel: MONTH_LABELS[monthIndex],
      cells,
    };
  }, [currentDate]);

  return (
    <section className="pointer-events-none absolute left-5 top-16 z-[6] w-[min(92vw,360px)]">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <article className="desktop-widget-card desktop-calendar-card pointer-events-auto">
          <p className="mb-1 text-[0.72rem] font-bold tracking-wide text-[#ff4d4f]">
            {calendar.monthLabel}
          </p>
          <div className="grid grid-cols-7 gap-y-0.5 text-[0.66rem] font-semibold text-white/80">
            {WEEKDAY_HEADERS.map((day) => (
              <span key={day} className="text-center">
                {day}
              </span>
            ))}
            {calendar.cells.map((day, index) => {
              const isToday = day === calendar.today;
              return (
                <span key={`${day ?? "blank"}-${index}`} className="flex justify-center">
                  {day ? (
                    <span
                      className={`desktop-calendar-day ${isToday ? "desktop-calendar-day-today" : ""}`}
                    >
                      {day}
                    </span>
                  ) : (
                    <span className="desktop-calendar-day opacity-0">0</span>
                  )}
                </span>
              );
            })}
          </div>
        </article>

        <article className="desktop-widget-card desktop-weather-card pointer-events-auto">
          <p className="text-[0.66rem] font-semibold leading-none text-white">
            {STATIC_WEATHER.location}
          </p>
          <p className="mt-1 text-[2rem] font-light leading-none text-white">
            {STATIC_WEATHER.temperature}
          </p>
          <div className="mt-1 text-white">
            <p className="text-[1rem] leading-none">☁</p>
            <p className="mt-1 text-[0.66rem] font-semibold leading-none">
              {STATIC_WEATHER.condition}
            </p>
            <p className="mt-0.5 text-[0.66rem] font-semibold leading-none text-white/90">
              H:{STATIC_WEATHER.high} L:{STATIC_WEATHER.low}
            </p>
          </div>
        </article>
      </div>

      <button
        type="button"
        onClick={onOpenFeaturedPhoto}
        aria-label="Open Aiden Brown photo in Photos"
        className="desktop-widget-card desktop-photo-card pointer-events-auto mt-2 w-full text-left"
      >
        <div className="relative h-full w-full overflow-hidden rounded-[2rem]">
          {!photoFailed ? (
            <Image
              src="/Aiden Brown.jpg"
              alt="Aiden Brown"
              fill
              unoptimized
              sizes="(max-width: 900px) 92vw, 360px"
              className="object-cover object-[center_18%]"
              onError={() => setPhotoFailed(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-black/45 text-[1.2rem] font-semibold text-white/85">
              Add /public/Aiden Brown.jpg
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
          <div className="absolute bottom-2.5 left-2.5 text-white">
            <p className="text-[0.82rem] font-bold leading-none sm:text-[1.3rem]">Aiden Brown</p>
            <p className="mt-0.5 text-[0.58rem] font-semibold uppercase tracking-wide text-white/85 sm:text-[0.8rem]">
              Photo
            </p>
          </div>
        </div>
      </button>
    </section>
  );
}
