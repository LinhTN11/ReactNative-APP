import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

// Example delivery points - Hanoi, Vietnam
const deliveryPoints = [
  { id: '1', title: 'Khách hàng A', coordinate: { latitude: 21.0285, longitude: 105.8542 } },
  { id: '2', title: 'Khách hàng B', coordinate: { latitude: 21.0245, longitude: 105.8412 } },
  { id: '3', title: 'Khách hàng C', coordinate: { latitude: 21.0355, longitude: 105.8345 } },
];

export default function DeliveryMapScreen() {
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [tracking, setTracking] = useState(false);
  const [routeCoords, setRouteCoords] = useState<any[]>([]);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Location permission required to show map');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setCurrentLocation(loc);
    })();

    return () => {
      if (watchRef.current) watchRef.current.remove();
    };
  }, []);

  // Toggle tracking
  const toggleTracking = async (value: boolean) => {
    setTracking(value);
    if (value) {
      // start watching
      watchRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 2000, distanceInterval: 5 },
        (loc) => {
          setCurrentLocation(loc);
        }
      );
    } else {
      // stop watching
      if (watchRef.current) {
        watchRef.current.remove();
        watchRef.current = null;
      }
    }
  };

  const fetchDirectionsTo = async (destination: { latitude: number; longitude: number }) => {
    if (!currentLocation) {
      alert('Đang lấy vị trí hiện tại...');
      return;
    }

    try {
      const origin = currentLocation.coords;
      
      // Use OpenRouteService API - FREE (no credit card needed!)
      // Get free API key at: https://openrouteservice.org/dev/#/signup
      const apiKey = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjlhY2NjNmIzMjU3ZjRhMDVhMzgxYTE0Y2FkZDY5NzIxIiwiaCI6Im11cm11cjY0In0='; // Your API key
      
      const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${origin.longitude},${origin.latitude}&end=${destination.longitude},${destination.latitude}`;
      
      console.log('Fetching directions from OpenRouteService...');
      const resp = await fetch(url);
      const data = await resp.json();
      console.log('OpenRouteService response:', data);

      if (data.error) {
        alert(`Lỗi API: ${data.error.message}`);
        return;
      }

      if (data.features && data.features.length > 0) {
        const route = data.features[0];
        const coords = route.geometry.coordinates;
        
        // Convert [lng, lat] to {latitude, longitude}
        const routePoints = coords.map((coord: number[]) => ({
          latitude: coord[1],
          longitude: coord[0],
        }));
        
        setRouteCoords(routePoints);

        const distanceKm = (route.properties.segments[0].distance / 1000).toFixed(1);
        const durationMin = Math.round(route.properties.segments[0].duration / 60);
        
        setRouteInfo({
          distance: `${distanceKm} km`,
          duration: `${durationMin} phút`,
        });
      } else {
        alert('Không tìm thấy đường đi');
      }
    } catch (err: any) {
      console.error('Error:', err);
      alert(`Lỗi: ${err.message || 'Không thể kết nối'}`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Compact header with dark theme */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Giao hàng</Text>
          <View style={styles.trackingRow}>
            <Text style={styles.trackingLabel}>Live</Text>
            <Switch
              value={tracking}
              onValueChange={toggleTracking}
              trackColor={{ false: '#3a3a3a', true: '#10b981' }}
              thumbColor={tracking ? '#fff' : '#666'}
            />
          </View>
        </View>
      </View>

      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        showsUserLocation
        followsUserLocation={tracking}
        customMapStyle={darkMapStyle}
        region={
          currentLocation
            ? {
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }
            : undefined
        }>
        {deliveryPoints.map((p) => (
          <Marker
            key={p.id}
            coordinate={p.coordinate}
            title={p.title}
            pinColor="#10b981"
            onPress={() => fetchDirectionsTo(p.coordinate)}
          />
        ))}
        {routeCoords.length > 0 && <Polyline coordinates={routeCoords} strokeWidth={5} strokeColor="#10b981" />}
      </MapView>

      {/* Route info overlay - like Google Maps */}
      {routeInfo && (
        <View style={styles.routeInfoCard}>
          <View style={styles.routeInfoRow}>
            <View style={styles.routeInfoItem}>
              <Text style={styles.routeInfoValue}>{routeInfo.duration}</Text>
              <Text style={styles.routeInfoLabel}>Thời gian</Text>
            </View>
            <View style={styles.routeInfoDivider} />
            <View style={styles.routeInfoItem}>
              <Text style={styles.routeInfoValue}>{routeInfo.distance}</Text>
              <Text style={styles.routeInfoLabel}>Khoảng cách</Text>
            </View>
          </View>
        </View>
      )}

      {/* Bottom drawer with delivery points */}
      <View style={styles.drawer}>
        <View style={styles.drawerHandle} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.deliveryList}>
          {deliveryPoints.map((point) => (
            <View key={point.id} style={styles.deliveryCard}>
              <View style={styles.cardIcon}>
                <Text style={styles.cardIconText}>📦</Text>
              </View>
              <Text style={styles.deliveryTitle}>{point.title}</Text>
              <Text style={styles.deliveryCoords}>
                {point.coordinate.latitude.toFixed(3)}°, {point.coordinate.longitude.toFixed(3)}°
              </Text>
              <TouchableOpacity style={styles.navigateButton} onPress={() => fetchDirectionsTo(point.coordinate)}>
                <Text style={styles.navigateText}>Chỉ đường →</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
        {routeCoords.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={() => {
            setRouteCoords([]);
            setRouteInfo(null);
          }}>
            <Text style={styles.clearButtonText}>✕ Xóa đường</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// Dark map style for Google Maps
const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1d1d1d' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1d1d1d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#2d2d2d' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#2d2d2d' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#6a6a6a' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2d2d2d' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1d1d1d' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3a3a3a' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a0a0a' }] },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  map: { flex: 1 },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d2d',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  trackingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trackingLabel: {
    fontSize: 13,
    color: '#10b981',
    fontWeight: '600',
  },
  drawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingBottom: 30,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  drawerHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#3a3a3a',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  deliveryList: { marginBottom: 12 },
  deliveryCard: {
    backgroundColor: '#2d2d2d',
    padding: 16,
    marginRight: 12,
    borderRadius: 16,
    width: 170,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  cardIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#10b981',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardIconText: { fontSize: 20 },
  deliveryTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    color: '#fff',
  },
  deliveryCoords: {
    fontSize: 11,
    color: '#8a8a8a',
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  navigateButton: {
    backgroundColor: '#10b981',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  navigateText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  clearButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  routeInfoCard: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#2d2d2d',
  },
  routeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  routeInfoItem: {
    flex: 1,
    alignItems: 'center',
  },
  routeInfoValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 4,
  },
  routeInfoLabel: {
    fontSize: 12,
    color: '#8a8a8a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  routeInfoDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#3a3a3a',
  },
});
