export interface TemperatureModel {
  data: number;
  id: number;
  temperature: number;
  timestamp: number;
}

export interface TemperatureMap {
  [id: string]: TemperatureModel[];
}
