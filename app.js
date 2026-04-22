import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const COLORS = {
  primary: '#FF6B35',
  primaryDark: '#E55100',
  accent: '#004E89',
  background: '#F8F9FB',
  white: '#FFFFFF',
  text: '#1A1A1A',
  textLight: '#666666',
  border: '#E5E7EB',
  success: '#10B981',
};

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
      type: 'Beach',
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
      type: 'Indoor',
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
      type: 'Beach',
    },
  ]);

  const renderMatchCard = ({ item }) => {
    const spotsLeft = item.maxPlayers - item.players;
    const isFull = spotsLeft === 0;

    return (
      <View style={styles.matchCard}>
        <View style={styles.matchHeader}>
          <View style={styles.matchTitleContainer}>
            <Text style={styles.matchName}>{item.name}</Text>
            <View style={[styles.typeTag, { backgroundColor: item.type === 'Beach' ? '#FFE5CC' : '#CCE5FF' }]}>
              <Text style={[styles.typeTagText, { color: item.type === 'Beach' ? '#E55100' : '#004E89' }]}>
                {item.type}
              </Text>
            </View>
          </View>
          <View style={[styles.spotsIndicator, { backgroundColor: isFull ? '#FEE2E2' : '#D1FAE5' }]}>
            <Text style={[styles.spotsText, { color: isFull ? '#991B1B' : '#065F46' }]}>
              {spotsLeft}
            </Text>
          </View>
        </View>

        <View style={styles.matchDetails}>
          <Text style={styles.matchDetail}>📍 {item.location}</Text>
          <Text style={styles.matchDetail}>⏰ {item.time}</Text>
        </View>

        <View style={styles.playerBar}>
          <View style={styles.playerBarBg}>
            <View
              style={[
                styles.playerBarFill,
                { width: `${(item.players / item.maxPlayers) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.playerCount}>
            👥 {item.players}/{item.maxPlayers}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.joinBtn, isFull && styles.joinBtnDisabled]}
          disabled={isFull}
        >
          <Text style={styles.joinBtnText}>{isFull ? 'Match Full' : 'Join Match'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚡ Volley Rio</Text>
        <Text style={styles.headerSubtitle}>Find your game</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'map' && styles.activeTab]}
          onPress={() => setActiveTab('map')}
        >
          <Text style={[styles.tabText, activeTab === 'map' && styles.activeTabText]}>🗺️ Map</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'matches' && styles.activeTab]}
          onPress={() => setActiveTab('matches')}
        >
          <Text style={[styles.tabText, activeTab === 'matches' && styles.activeTabText]}>📋 Matches</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'create' && styles.activeTab]}
          onPress={() => setActiveTab('create')}
        >
          <Text style={[styles.tabText, activeTab === 'create' && styles.activeTabText]}>➕ Create</Text>
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
          scrollEnabled={true}
        />
      )}

      {activeTab === 'create' && (
        <ScrollView style={styles.createSection} contentContainerStyle={{ paddingBottom: 40 }}>
          <Text style={styles.createTitle}>Create New Match</Text>
          <Text style={styles.createSubtitle}>Get the game started</Text>

          <View style={styles.formField}>
            <Text style={styles.label}>Match Name</Text>
            <View style={styles.input} />
          </View>

          <View style={styles.formField}>
            <Text style={styles.label}>Location</Text>
            <View style={styles.input} />
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formField, { flex: 1 }]}>
              <Text style={styles.label}>Date</Text>
              <View style={styles.input} />
            </View>
            <View style={[styles.formField, { flex: 1, marginLeft: 12 }]}>
              <Text style={styles.label}>Time</Text>
              <View style={styles.input} />
            </View>
          </View>

          <View style={styles.formField}>
            <Text style={styles.label}>Match Type</Text>
            <View style={styles.typeSelector}>
              <TouchableOpacity style={styles.typeOption}>
                <Text style={styles.typeOptionText}>🏖️ Beach</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.typeOption, { marginLeft: 12 }]}>
                <Text style={styles.typeOptionText}>🏐 Indoor</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.createBtn}>
            <Text style={styles.createBtnText}>Create Match</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
    fontWeight: '500',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  activeTabText: {
    color: COLORS.primary,
  },
  map: {
    flex: 1,
  },
  matchesList: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  matchCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  matchTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  matchName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  typeTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  spotsIndicator: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spotsText: {
    fontSize: 18,
    fontWeight: '700',
  },
  matchDetails: {
    marginBottom: 12,
  },
  matchDetail: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 4,
    fontWeight: '500',
  },
  playerBar: {
    marginBottom: 12,
  },
  playerBarBg: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  playerBarFill: {
    height: '100%',
    backgroundColor: COLORS.success,
  },
  playerCount: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  joinBtn: {
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    alignItems: 'center',
  },
  joinBtnDisabled: {
    backgroundColor: COLORS.border,
  },
  joinBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
  createSection: {
    flex: 1,
    padding: 16,
  },
  createTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  createSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 24,
    fontWeight: '500',
  },
  formField: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    height: 48,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
  },
  typeSelector: {
    flexDirection: 'row',
  },
  typeOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  createBtn: {
    paddingVertical: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  createBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
