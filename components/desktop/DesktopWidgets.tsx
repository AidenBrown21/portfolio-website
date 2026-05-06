"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

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

const FALLBACK_LOCATION = {
  latitude: 40.4237,
  longitude: -86.9212,
  label: "West Lafayette, IN",
} as const;

type WeatherData = {
  locationLabel: string;
  temperature: string;
  condition: string;
  icon: string;
  high: string;
  low: string;
};

type OpenMeteoResponse = {
  current?: {
    temperature_2m?: number;
    weather_code?: number;
  };
  daily?: {
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
  };
};

type ReverseGeocodeResponse = {
  city?: string;
  locality?: string;
  principalSubdivision?: string;
  principalSubdivisionCode?: string;
};

const LOADING_WEATHER: WeatherData = {
  locationLabel: FALLBACK_LOCATION.label,
  temperature: "--°",
  condition: "Loading",
  icon: "…",
  high: "--°",
  low: "--°",
};

const formatTemperature = (value: number): string => `${Math.round(value)}°`;

const getStateCode = (location: ReverseGeocodeResponse): string => {
  const subdivisionCode = location.principalSubdivisionCode?.trim() ?? "";
  const codeParts = subdivisionCode.split("-");
  if (codeParts.length > 1 && codeParts[1]) return codeParts[1];
  const subdivision = location.principalSubdivision?.trim() ?? "";
  if (subdivision.length >= 2) return subdivision.slice(0, 2).toUpperCase();
  return "";
};

const formatLocationLabel = (location: ReverseGeocodeResponse, fallbackLabel: string): string => {
  const city = location.locality?.trim() || location.city?.trim() || "";
  const stateCode = getStateCode(location);
  if (city && stateCode) return `${city}, ${stateCode}`;
  if (city) return city;
  return fallbackLabel;
};

const getConditionInfo = (weatherCode: number): { condition: string; icon: string } => {
  if (weatherCode === 0) return { condition: "Clear", icon: "☀" };
  if (weatherCode === 1) return { condition: "Mostly Clear", icon: "🌤" };
  if (weatherCode === 2) return { condition: "Partly Cloudy", icon: "⛅" };
  if (weatherCode === 3) return { condition: "Overcast", icon: "☁" };
  if (weatherCode === 45 || weatherCode === 48) return { condition: "Foggy", icon: "🌫" };
  if ([51, 53, 55, 56, 57].includes(weatherCode)) return { condition: "Drizzle", icon: "🌦" };
  if ([61, 63, 65, 66, 67].includes(weatherCode)) return { condition: "Rain", icon: "🌧" };
  if ([71, 73, 75, 77].includes(weatherCode)) return { condition: "Snow", icon: "🌨" };
  if ([80, 81, 82].includes(weatherCode)) return { condition: "Rain Showers", icon: "🌦" };
  if ([85, 86].includes(weatherCode)) return { condition: "Snow Showers", icon: "🌨" };
  if (weatherCode === 95) return { condition: "Thunderstorm", icon: "⛈" };
  if ([96, 99].includes(weatherCode)) return { condition: "Severe Storm", icon: "⛈" };
  return { condition: "Unknown", icon: "☁" };
};

export default function DesktopWidgets({ currentDate, onOpenFeaturedPhoto }: DesktopWidgetsProps) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const [weather, setWeather] = useState<WeatherData>(LOADING_WEATHER);
  const [weatherError, setWeatherError] = useState(false);

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

  useEffect(() => {
    const abortController = new AbortController();

    const resolveLocationLabel = async (latitude: number, longitude: number, fallbackLabel: string) => {
      const reverseParams = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        localityLanguage: "en",
      });
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?${reverseParams.toString()}`,
        {
          method: "GET",
          signal: abortController.signal,
          cache: "no-store",
        },
      );

      if (!response.ok) return fallbackLabel;

      const location = (await response.json()) as ReverseGeocodeResponse;
      return formatLocationLabel(location, fallbackLabel);
    };

    const fetchWeather = async (latitude: number, longitude: number, locationLabel: string) => {
      const upstreamParams = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        current: "temperature_2m,weather_code",
        daily: "temperature_2m_max,temperature_2m_min",
        temperature_unit: "fahrenheit",
        timezone: "auto",
        forecast_days: "1",
      });

      const response = await fetch(`https://api.open-meteo.com/v1/forecast?${upstreamParams.toString()}`, {
        method: "GET",
        signal: abortController.signal,
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Weather request failed.");
      }

      const payload = (await response.json()) as OpenMeteoResponse;
      const temperature = payload.current?.temperature_2m;
      const weatherCode = payload.current?.weather_code;
      const high = payload.daily?.temperature_2m_max?.[0];
      const low = payload.daily?.temperature_2m_min?.[0];

      if (
        typeof temperature !== "number" ||
        typeof weatherCode !== "number" ||
        typeof high !== "number" ||
        typeof low !== "number"
      ) {
        throw new Error("Weather data incomplete.");
      }

      const { condition, icon } = getConditionInfo(weatherCode);

      setWeather({
        locationLabel,
        temperature: formatTemperature(temperature),
        condition,
        icon,
        high: formatTemperature(high),
        low: formatTemperature(low),
      });
      setWeatherError(false);
    };

    const fetchFallbackWeather = async () => {
      const label = await resolveLocationLabel(
        FALLBACK_LOCATION.latitude,
        FALLBACK_LOCATION.longitude,
        FALLBACK_LOCATION.label,
      );
      await fetchWeather(FALLBACK_LOCATION.latitude, FALLBACK_LOCATION.longitude, label);
    };

    const getBrowserCoordinates = async (): Promise<{ latitude: number; longitude: number } | null> => {
      if (!("geolocation" in navigator)) return null;

      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          () => {
            resolve(null);
          },
          {
            enableHighAccuracy: false,
            timeout: 8000,
            maximumAge: 10 * 60 * 1000,
          },
        );
      });
    };

    void (async () => {
      try {
        const browserCoords = await getBrowserCoordinates();
        if (browserCoords) {
          try {
            const label = await resolveLocationLabel(
              browserCoords.latitude,
              browserCoords.longitude,
              "Current Location",
            );
            await fetchWeather(browserCoords.latitude, browserCoords.longitude, label);
            return;
          } catch {
            // Fall back to default city weather when current-location lookup fails.
          }
        }
        await fetchFallbackWeather();
      } catch {
        if (!abortController.signal.aborted) {
          setWeatherError(true);
          setWeather({
            ...LOADING_WEATHER,
            condition: "Unavailable",
          });
        }
      }
    })();

    return () => {
      abortController.abort();
    };
  }, []);

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

        <article className="desktop-widget-card desktop-weather-card pointer-events-auto flex flex-col items-center justify-center text-center">
          <p className="text-[0.66rem] font-semibold leading-none text-white">
            {weather.locationLabel}
          </p>
          <p className="mt-1 text-[2rem] font-light leading-none text-white">
            {weather.temperature}
          </p>
          <div className="mt-1 text-white flex flex-col items-center">
            <p className="text-[1rem] leading-none">{weather.icon}</p>
            <p className="mt-1 text-[0.66rem] font-semibold leading-none">
              {weather.condition}
            </p>
            <p className="mt-0.5 text-[0.66rem] font-semibold leading-none text-white/90">
              H:{weather.high} L:{weather.low}
            </p>
            {weatherError ? (
              <p className="mt-0.5 text-[0.62rem] font-semibold leading-none text-white/80">
                Weather unavailable right now.
              </p>
            ) : null}
          </div>
        </article>
      </div>

      <button
        type="button"
        onClick={onOpenFeaturedPhoto}
        aria-label="Open Sigma Nu photo in Photos"
        className="desktop-widget-card desktop-photo-card pointer-events-auto mt-2 w-full text-left"
      >
        <div className="relative h-full w-full overflow-hidden rounded-[2rem]">
          {!photoFailed ? (
            <Image
              src="/SigmaNu.jpg"
              alt="Aiden Brown"
              fill
              unoptimized
              sizes="(max-width: 900px) 92vw, 360px"
              className="object-cover object-[center_18%]"
              onError={() => setPhotoFailed(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-black/45 text-[1.2rem] font-semibold text-white/85">
              Add /public/SigmaNu.jpg
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
