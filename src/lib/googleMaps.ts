import { LoadScriptProps } from '@react-google-maps/api';

export const GOOGLE_MAPS_API_KEY = 'AIzaSyACbllZW-okpfy_yTGNN3ODxl0bp6_K5E0';

export const googleMapsLibraries: LoadScriptProps['libraries'] = ['places'];

export const defaultMapCenter = {
  lat: -1.2921,
  lng: 36.8219
};