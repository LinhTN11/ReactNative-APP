// Mock implementation of react-native-maps for web
import React from 'react';

export const PROVIDER_GOOGLE = 'google';

export const Marker = () => null;
export const Polyline = () => null;

const MapView = () => React.createElement('div', { 
  style: { flex: 1, backgroundColor: '#0a0a0a' } 
});

export default MapView;
