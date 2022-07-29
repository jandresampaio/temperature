import { TemperatureModel } from "../../types/temperature";
import "./Sensors.css";

const Sensors = (props: { temperatures: TemperatureModel[] }) => {
  const sensorsWidthPercentage = 100 / props.temperatures.length - 5;
  return (
    <div className="Sensors">
      {props.temperatures.map((temp) => (
        <div
          className="Sensor-temperature"
          style={{ width: `${sensorsWidthPercentage}%` }}
        >
          <span>ID {temp.id}</span>
          <span className="Temperature">Temp: {temp.temperature} ºC</span>
        </div>
      ))}
    </div>
  );
};

export default Sensors;
