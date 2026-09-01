import { Zone } from '../enums/zone.enum';

export interface Port {
  id: number;
  idZonaMG: number;
  alias: string;
  name: string;
  zone: Zone;
  lat: number;
  lng: number;
  tideStation: string;
  tideOffsetMinutes: number;
}
