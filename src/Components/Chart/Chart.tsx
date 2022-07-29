import React, { useCallback, useEffect, useRef, useState } from "react";
import { FIVE_MINS_MS, getSensorColor, SERVER_WS_URL } from "../../utils";
import { ToastContainer, toast } from "react-toastify";
import { TemperatureMap, TemperatureModel } from "../../types/temperature";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Sensors from "../Sensor/Sensors";
import "./Chart.css";

const Chart = () => {
  const allTemperatures = useRef<TemperatureModel[]>([]);
  const latestUpdates = useRef<TemperatureModel[]>([]);
  const connected = useRef<boolean>(false);
  const [updatedTemperatures, setTemperatures] = useState<TemperatureMap>({});

  useEffect(() => {
    const ws = new WebSocket(SERVER_WS_URL);

    ws.onopen = function (event) {
      connected.current = true;
      connected.current && toast.success("Connected");
    };

    ws.onmessage = function (event) {
      try {
        const data = JSON.parse(event.data) as TemperatureModel[];
        latestUpdates.current = data;
        console.log("onMessage: ", data);

        const getTemperaturesBySensor = () => {
          const currentTime = new Date().getTime();
          const lastValidEntryInMs = currentTime - FIVE_MINS_MS;
          const latestFiveMinutesTemperatures = [
            ...allTemperatures.current,
            ...data,
          ].filter(
            ({ temperature, timestamp }) =>
              temperature <= 100 && timestamp >= lastValidEntryInMs
          );
          return latestFiveMinutesTemperatures;
        };
        allTemperatures.current = getTemperaturesBySensor();
        const temperaturesBySensor =
          allTemperatures.current.reduce<TemperatureMap>((acc, cur) => {
            if (!acc[cur.id]) acc[cur.id] = [];
            acc[cur.id].push(cur);
            return acc;
          }, {});
        setTemperatures(temperaturesBySensor);
      } catch (err) {
        toast.error("Could not fetch latest data");
      }
    };

    ws.onclose = function (event) {
      connected.current && toast.error("Disconnected");
      connected.current = false;
    };

    return () => ws.close();
  }, []);

  const renderTimeAxis = useCallback((value: "auto" | number) => {
    if (value === "auto") return value;
    return new Date(value).toLocaleTimeString();
  }, []);

  return (
    <div className="Chart-container">
      <Sensors temperatures={latestUpdates.current} />
      <ResponsiveContainer width="80%" height={400} className="responsive">
        <LineChart
          data={allTemperatures.current}
          margin={{ top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <CartesianGrid />
          <YAxis />
          <XAxis
            dataKey="timestamp"
            allowDuplicatedCategory={false}
            tickFormatter={renderTimeAxis}
          />
          <Tooltip />
          <Legend />
          {Object.values(updatedTemperatures).map((sensorData) => {
            const sensorId = sensorData?.[0]?.id;
            return (
              <Line
                key={sensorId}
                type="monotone"
                data={sensorData}
                name={`ID ${sensorId.toString()}`}
                dataKey="temperature"
                stroke={getSensorColor(sensorId)}
                dot={false}
                activeDot={{ r: 8 }}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>

      <ToastContainer position="bottom-right" newestOnTop={true} />
    </div>
  );
};

export default Chart;
