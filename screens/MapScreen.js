import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { COLORS } from '../constants/colors';
import MatchCard from '../components/MatchCard';

export default function MapScreen({ matches, viewMode, setViewMode, onMarkerPress }) {
  const [mapRegion, setMapRegion] = useState({
    latitude: -23.5505,
    longitude: -46.4244,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  const handleMapRegionChange = (region) => {
    setMapRegion(region);
  };

  const renderMatchCard = ({ item }) => <MatchCard match={item} />;

  return (
    <View style={styles.container}>
      {/* View Mode Toggle */}
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={styles.viewBtn}
          onPress={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
        >
          <Text style={styles.viewBtnText}>
            {viewMode === 'map' ? '📋 List View' : '🗺️ Map View'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Map View */}
      {viewMode === 'map' && (
        <MapView
          style={styles.map}
          initialRegion={mapRegion}
          onRegionChangeComplete={handleMapRegionChange}
        >
          {matches.map((match) => (
            <Marker
              key={match.id}
              coordinate={{ latitude: match.lat, longitude: match.lng }}
              title={match.name}
              description={match.location}
              onPress={() => onMarkerPress(match)}
            />
          ))}
        </MapView>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <FlatList
          data={matches}
          renderItem={renderMatchCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.matchesList}
          scrollEnabled={true}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  viewToggle: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  viewBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    alignItems: 'center',
  },
  viewBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  map: {
    flex: 1,
  },
  matchesList: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
});
