export interface MapSensor {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: 'ONLINE' | 'OFFLINE' | 'ALERT';
}
