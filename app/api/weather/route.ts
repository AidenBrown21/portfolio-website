import { NextResponse } from "next/server";

const OPEN_METEO_ENDPOINT = "https://api.open-meteo.com/v1/forecast";

const clampLabel = (value: string): string => value.trim().slice(0, 80);

const asNumber = (value: string | null): number | null => {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const isValidLatitude = (value: number): boolean => value >= -90 && value <= 90;
const isValidLongitude = (value: number): boolean => value >= -180 && value <= 180;

const formatTemperature = (value: number): string => `${Math.round(value)}°`;

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = asNumber(searchParams.get("lat"));
  const lon = asNumber(searchParams.get("lon"));
  const providedLabel = searchParams.get("locationLabel");
  const locationLabel = clampLabel(providedLabel ?? "") || "Current Location";

  if (lat === null || lon === null || !isValidLatitude(lat) || !isValidLongitude(lon)) {
    return NextResponse.json({ message: "Valid lat/lon query params are required." }, { status: 400 });
  }

  const upstreamParams = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: "temperature_2m,weather_code",
    daily: "temperature_2m_max,temperature_2m_min",
    temperature_unit: "fahrenheit",
    timezone: "auto",
    forecast_days: "1",
  });

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(`${OPEN_METEO_ENDPOINT}?${upstreamParams.toString()}`, {
      headers: { accept: "application/json" },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ message: "Could not reach weather service." }, { status: 502 });
  }

  if (!upstreamResponse.ok) {
    return NextResponse.json({ message: "Weather service request failed." }, { status: 502 });
  }

  let payload: OpenMeteoResponse;
  try {
    payload = (await upstreamResponse.json()) as OpenMeteoResponse;
  } catch {
    return NextResponse.json({ message: "Invalid weather service response." }, { status: 502 });
  }

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
    return NextResponse.json({ message: "Weather service data is incomplete." }, { status: 502 });
  }

  const { condition, icon } = getConditionInfo(weatherCode);

  return NextResponse.json(
    {
      locationLabel,
      temperature: formatTemperature(temperature),
      condition,
      icon,
      high: formatTemperature(high),
      low: formatTemperature(low),
    },
    {
      headers: {
        "cache-control": "no-store",
      },
    },
  );
}
