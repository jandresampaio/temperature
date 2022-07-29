import { TemperatureMap, TemperatureModel } from "./types/temperature";

export const SERVER_WS_URL = "ws://localhost:8999";
export const FIVE_MINS_MS = 5 * 60 * 10000;

const COLOR_BY_ID: { [id: number]: string } = {
  1: "#bf7d07",
  2: "#5796ce",
  3: "grey",
  4: "blue",
};

export const getSensorColor = (id: number) => {
  return COLOR_BY_ID[id] ?? getRandomColor();
};

export const getRandomColor = () => {
  const colors = ["#ff0000", "#00ff00", "#0000ff"];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const mapTemperaturesToDictionary = (
  temperatures: TemperatureModel[]
) => {
  return temperatures.reduce<TemperatureMap>((acc, cur) => {
    if (!acc[cur.id]) acc[cur.id] = [];
    acc[cur.id].push(cur);
    return acc;
  }, {});
};
