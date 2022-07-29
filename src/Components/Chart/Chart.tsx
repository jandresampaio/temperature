import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FIVE_MINS_MS,
  getSensorColor,
  mapTemperaturesToDictionary,
  SERVER_WS_URL,
} from "../../utils";
import { ToastContainer, toast } from "react-toastify";
import { TemperatureModel } from "../../types/temperature";
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
  const connected = useRef<boolean>(false);
  const [temperatures, setTemperatures] = useState<{
    latest: TemperatureModel[];
    all: TemperatureModel[];
  }>({ latest: [], all: [] });

  const getUpdatedData = useCallback(
    (previousData: TemperatureModel[], newData: TemperatureModel[]) => {
      const currentTime = new Date().getTime();
      const lastValidEntryInMs = currentTime - FIVE_MINS_MS;
      const latestFiveMinutesTemperatures = [
        ...previousData,
        ...newData,
      ].filter(
        ({ temperature, timestamp }) =>
          temperature <= 100 && timestamp >= lastValidEntryInMs
      );
      return latestFiveMinutesTemperatures;
    },
    []
  );

  const renderTimeAxis = useCallback((value: "auto" | number) => {
    if (value === "auto") return value;
    return new Date(value).toLocaleTimeString();
  }, []);

  useEffect(() => {
    const ws = new WebSocket(SERVER_WS_URL);

    ws.onopen = function (event) {
      connected.current = true;
      connected.current && toast.success("Connected");
    };

    ws.onmessage = function (event) {
      try {
        const data = JSON.parse(event.data) as TemperatureModel[];
        setTemperatures((previousTemperatures) => {
          return {
            all: getUpdatedData(previousTemperatures.all, data),
            latest: data,
          };
        });
      } catch (err) {
        toast.error("Could not fetch latest data");
      }
    };

    ws.onclose = function (event) {
      connected.current && toast.error("Disconnected");
      connected.current = false;
    };

    return () => ws.close();
  }, [getUpdatedData]);

  return (
    <div className="Chart-container">
      <Sensors temperatures={temperatures.latest} />
      <ResponsiveContainer width="80%" height={400} className="responsive">
        <LineChart
          data={temperatures.all}
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

          {Object.values(mapTemperaturesToDictionary(temperatures.all)).map(
            (sensorData) => {
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
            }
          )}
        </LineChart>
      </ResponsiveContainer>

      <ToastContainer position="bottom-right" newestOnTop={true} />
    </div>
  );
};

export default Chart;
