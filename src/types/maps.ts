export interface LatLng {
  lat: number;
  lng: number;
}

export interface MapMarkerDescriptor {
  id: string;
  position: LatLng;
  color?: string;
  label?: string;
  zIndex?: number;
  meta?: Record<string, unknown>;
}
