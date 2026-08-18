export interface OpenMeteoMarineResponse {
  hourly: {
    time: string[];
    wave_height: number[];
    wave_period: number[];
    wave_direction: number[];
    wind_speed_10m: number[];
    wind_direction_10m: number[];
    is_day: number[];
  };
}
