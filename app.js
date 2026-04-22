import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function App() {
  const [activeTab, setActiveTab] = useState('map');
  const [matches, setMatches] = useState([
    {
      id: 1,
      name: 'Beach Volleyball at Copacabana',
      location: 'Copacabana Beach',
      lat: -23.5505,
      lng: -46.4244,
      time: '10:00 AM',
      players: 6,
      maxPlayers: 12,
    },
    {
      id: 2,
      name: 'Court Match at Leblon',
      location: 'Leblon Sports Court',
      lat: -23.5625,
      lng: -46.3494,
      time: '3:00 PM',
      players: 8,
      maxPlayers: 12,
    },
    {
      id: 3,
      name: 'Evening Game at Ipanema',
      location: 'Ipanema Park',
      lat: -23.5886,
      lng: -46.4244,
      time: '5:30 PM',
      players: 4,
      maxPlayers: 12,
    },
  ]);

  const renderMatchCard = ({ item }) => (
    <View style={styles.matchCard}>
      <Text style={styles.matchName}>{item.name}</Text>
      <Text style={styles.matchDetail}>📍 {item.location}</Text>
      <Text style={styles.matchDetail}>⏰ {item.time}</Text>
      <Text style={styles.matchDetail}>👥 {item.players}/{item.maxPlayers} players</Text>
      <TouchableOpacity style={styles.joinBtn}>
        <Text style={styles.joinBtnText}>Join Match</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚡ Volley Rio</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'map' && styles.activeTab]}
          onPress={() => setActiveTab('map')}
        >
          <Text style={styles.tabText}>🗺️ Map</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'matches' && styles.activeTab]}
          onPress={() => setActiveTab('matches')}
        >
          <Text style={styles.tabText}>📋 Matches</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'create' && styles.activeTab]}
          onPress={() => setActiveTab('create')}
        >
          <Text style={styles.tabText}>➕ Create</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'map' && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: -23.5505,
            longitude: -46.4244,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
        >
          {matches.map((match) => (
            <Marker
              key={match.id}
              coordinate={{ latitude: match.lat, longitude: match.lng }}
              title={match.name}
              description={match.location}
            />
          ))}
        </MapView>
      )}

      {activeTab === 'matches' && (
        <FlatList
          data={matches}
          renderItem={renderMatchCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.matchesList}
        />
      )}

      {activeTab === 'create' && (
        <View style={styles.createSection}>
          <Text style={styles.createTitle}>Create a New Match</Text>
          <View style={styles.formField}>
            <Text style={styles.label}>Match Name</Text>
            <View style={styles.input} />
          </View>
          <View style={styles.formField}>
            <Text style={styles.label}>Location</Text>
            <View style={styles.input} />
          </View>
          <View style={styles.formField}>
            <Text style={styles.label}>Time</Text>
            <View style={styles.input} />
          </View>
          <TouchableOpacity style={styles.createBtn}>
            <Text style={styles.createBtnText}>Create Match</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#FF6B6B',
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    marginTop: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#FF6B6B',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  map: {
    flex: 1,
  },
  matchesList: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  matchCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  matchName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  matchDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  joinBtn: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    alignItems: 'center',
  },
  joinBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  createSection: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-start',
  },
  createTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  formField: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    height: 48,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
  },
  createBtn: {
    paddingVertical: 14,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  createBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
});
