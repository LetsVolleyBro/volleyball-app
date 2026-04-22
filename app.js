import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList, SafeAreaView, TextInput, Alert, Modal, Dimensions, Animated } from 'react-native';
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

const TIMES = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'];
const DATES = ['Apr 23', 'Apr 24', 'Apr 25', 'Apr 26', 'Apr 27', 'Apr 28', 'Apr 29', 'Apr 30', 'May 01', 'May 02', 'May 03'];

export default function App() {
  const [activeTab, setActiveTab] = useState('map');
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const [matches, setMatches] = useState([
    {
      id: 1,
      name: '3vs3',
      location: 'Copacabana Beach',
      lat: -23.5505,
      lng: -46.4244,
      time: '10:00 AM',
      players: 6,
      maxPlayers: 6,
    },
    {
      id: 2,
      name: '4vs4',
      location: 'Leblon Sports Court',
      lat: -23.5625,
      lng: -46.3494,
      time: '3:00 PM',
      players: 8,
      maxPlayers: 8,
    },
    {
      id: 3,
      name: '3vs3',
      location: 'Ipanema Park',
      lat: -23.5886,
      lng: -46.4244,
      time: '5:30 PM',
      players: 4,
      maxPlayers: 6,
    },
  ]);

  const [selectedMatchForJoin, setSelectedMatchForJoin] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Create form state
  const [formData, setFormData] = useState({
    gameMode: '3vs3',
    location: 'Select location on map',
    date: 'Select date',
    time: 'Select time',
    lat: -23.5505,
    lng: -46.4244,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [mapRegion, setMapRegion] = useState({
    latitude: -23.5505,
    longitude: -46.4244,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  const mapRef = useRef(null);

  const handleMapRegionChange = (region) => {
    setMapRegion(region);
  };

  const handleMarkerPress = (match) => {
    setSelectedMatchForJoin(match);
    setShowJoinModal(true);
  };

  const joinMatch = () => {
    if (selectedMatchForJoin) {
      Alert.alert('Success!', `You joined ${selectedMatchForJoin.name} at ${selectedMatchForJoin.location}!`);
      setShowJoinModal(false);
      setSelectedMatchForJoin(null);
    }
  };

  const setLocationFromMap = () => {
    setFormData({
      ...formData,
      lat: mapRegion.latitude,
      lng: mapRegion.longitude,
      location: `${mapRegion.latitude.toFixed(4)}, ${mapRegion.longitude.toFixed(4)}`,
    });
    Alert.alert('Location Set!', `Selected: ${mapRegion.latitude.toFixed(4)}, ${mapRegion.longitude.toFixed(4)}`);
  };

  const selectDate = (date) => {
    setFormData({ ...formData, date });
    setShowDatePicker(false);
  };

  const selectTime = (time) => {
    setFormData({ ...formData, time });
    setShowTimePicker(false);
  };

  const createMatch = () => {
    if (formData.date === 'Select date') {
      Alert.alert('Error', 'Please select a date');
      return;
    }
    if (formData.time === 'Select time') {
      Alert.alert('Error', 'Please select a time');
      return;
    }

    const maxPlayers = formData.gameMode === '3vs3' ? 6 : 8;

    const newMatch = {
      id: matches.length + 1,
      name: formData.gameMode,
      location: formData.location,
      lat: formData.lat,
      lng: formData.lng,
      time: formData.time,
      players: formData.gameMode === '3vs3' ? 3 : 4,
      maxPlayers: maxPlayers,
    };

    setMatches([...matches, newMatch]);
    Alert.alert('Success!', `${formData.gameMode} match created!`);
    
    // Reset form
    setFormData({
      gameMode: '3vs3',
      location: 'Select location on map',
      date: 'Select date',
      time: 'Select time',
      lat: -23.5505,
      lng: -46.4244,
    });
    setActiveTab('matches');
  };

  const renderMatchCard = ({ item }) => {
    const spotsLeft = item.maxPlayers - item.players;
    const isFull = spotsLeft === 0;

    return (
      <View style={styles.matchCard}>
        <View style={styles.matchHeader}>
          <View style={styles.matchTitleContainer}>
            <View style={styles.gameModeTag}>
              <Text style={styles.gameModeName}>{item.name}</Text>
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
        <View style={styles.mapContainer}>
          {/* View Mode Toggle */}
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.viewBtn, viewMode === 'map' && styles.viewBtnActive]}
              onPress={() => setViewMode('map')}
            >
              <Text style={[styles.viewBtnText, viewMode === 'map' && styles.viewBtnTextActive]}>🗺️ Map</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewBtn, viewMode === 'list' && styles.viewBtnActive]}
              onPress={() => setViewMode('list')}
            >
              <Text style={[styles.viewBtnText, viewMode === 'list' && styles.viewBtnTextActive]}>📋 List</Text>
            </TouchableOpacity>
          </View>

          {/* Map View */}
          {viewMode === 'map' && (
            <MapView
              style={styles.map}
              initialRegion={mapRegion}
            >
              {matches.map((match) => (
                <Marker
                  key={match.id}
                  coordinate={{ latitude: match.lat, longitude: match.lng }}
                  title={match.name}
                  description={match.location}
                  onPress={() => handleMarkerPress(match)}
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

          {/* Game Mode Selector */}
          <View style={styles.formField}>
            <Text style={styles.label}>Game Mode</Text>
            <View style={styles.gameModeSelector}>
              <TouchableOpacity
                style={[
                  styles.gameModeBtn,
                  formData.gameMode === '3vs3' && styles.gameModeBtnActive,
                ]}
                onPress={() => setFormData({ ...formData, gameMode: '3vs3' })}
              >
                <Text
                  style={[
                    styles.gameModeBtnText,
                    formData.gameMode === '3vs3' && styles.gameModeBtnTextActive,
                  ]}
                >
                  3vs3
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.gameModeBtn,
                  { marginLeft: 12 },
                  formData.gameMode === '4vs4' && styles.gameModeBtnActive,
                ]}
                onPress={() => setFormData({ ...formData, gameMode: '4vs4' })}
              >
                <Text
                  style={[
                    styles.gameModeBtnText,
                    formData.gameMode === '4vs4' && styles.gameModeBtnTextActive,
                  ]}
                >
                  4vs4
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Location Picker with Map */}
          <View style={styles.formField}>
            <Text style={styles.label}>📍 Location</Text>
            <Text style={styles.locationHint}>Move the map and zoom. The 📍 in the center is your location.</Text>
            <MapView
              ref={mapRef}
              style={styles.locationMap}
              initialRegion={mapRegion}
              onRegionChangeComplete={handleMapRegionChange}
            >
              {matches.map((match) => (
                <Marker
                  key={match.id}
                  coordinate={{ latitude: match.lat, longitude: match.lng }}
                  title={match.name}
                />
              ))}
            </MapView>
            
            {/* Center Pin */}
            <View style={styles.centerPointer}>
              <Text style={styles.centerPointerText}>📍</Text>
            </View>

            <TouchableOpacity style={styles.setLocationBtn} onPress={setLocationFromMap}>
              <Text style={styles.setLocationBtnText}>Set Location</Text>
            </TouchableOpacity>

            <View style={styles.selectedLocation}>
              <Text style={styles.selectedLocationText}>{formData.location}</Text>
            </View>
          </View>

          {/* Date Picker */}
          <View style={styles.formField}>
            <Text style={styles.label}>📅 Date</Text>
            <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.pickerBtnText}>{formData.date}</Text>
            </TouchableOpacity>
          </View>

          {/* Time Picker */}
          <View style={styles.formField}>
            <Text style={styles.label}>⏰ Time</Text>
            <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowTimePicker(true)}>
              <Text style={styles.pickerBtnText}>{formData.time}</Text>
            </TouchableOpacity>
          </View>

          {/* Create Button */}
          <TouchableOpacity style={styles.createBtn} onPress={createMatch}>
            <Text style={styles.createBtnText}>Create Match</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Date Picker Modal */}
      <Modal visible={showDatePicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerScroll}>
              {DATES.map((date) => (
                <TouchableOpacity
                  key={date}
                  style={[styles.pickerOption, formData.date === date && styles.pickerOptionActive]}
                  onPress={() => selectDate(date)}
                >
                  <Text style={[styles.pickerOptionText, formData.date === date && styles.pickerOptionTextActive]}>
                    {date}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal */}
      <Modal visible={showTimePicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Time</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerScroll}>
              {TIMES.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[styles.pickerOption, formData.time === time && styles.pickerOptionActive]}
                  onPress={() => selectTime(time)}
                >
                  <Text style={[styles.pickerOptionText, formData.time === time && styles.pickerOptionTextActive]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Join Match Modal */}
      <Modal visible={showJoinModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.joinModalContent]}>
            {selectedMatchForJoin && (
              <>
                <View style={styles.joinModalHeader}>
                  <TouchableOpacity onPress={() => setShowJoinModal(false)}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.joinModalBody}>
                  <View style={styles.joinGameModeTag}>
                    <Text style={styles.joinGameModeName}>{selectedMatchForJoin.name}</Text>
                  </View>

                  <Text style={styles.joinLocation}>📍 {selectedMatchForJoin.location}</Text>
                  <Text style={styles.joinTime}>⏰ {selectedMatchForJoin.time}</Text>

                  <View style={styles.joinPlayerBar}>
                    <View style={styles.joinPlayerBarBg}>
                      <View
                        style={[
                          styles.joinPlayerBarFill,
                          { width: `${(selectedMatchForJoin.players / selectedMatchForJoin.maxPlayers) * 100}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.joinPlayerCount}>
                      👥 {selectedMatchForJoin.players}/{selectedMatchForJoin.maxPlayers}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.joinJoinBtn,
                      selectedMatchForJoin.players >= selectedMatchForJoin.maxPlayers && styles.joinJoinBtnDisabled,
                    ]}
                    onPress={joinMatch}
                    disabled={selectedMatchForJoin.players >= selectedMatchForJoin.maxPlayers}
                  >
                    <Text style={styles.joinJoinBtnText}>
                      {selectedMatchForJoin.players >= selectedMatchForJoin.maxPlayers ? 'Match Full' : 'Join Match'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    paddingVertical: 16,
    paddingTop: 24,
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
  mapContainer: {
    flex: 1,
  },
  viewToggle: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
  },
  viewBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  viewBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  viewBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  viewBtnTextActive: {
    color: COLORS.white,
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
  gameModeTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  gameModeName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
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
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  gameModeSelector: {
    flexDirection: 'row',
  },
  gameModeBtn: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  gameModeBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  gameModeBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  gameModeBtnTextActive: {
    color: COLORS.white,
  },
  locationHint: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  locationMap: {
    height: 300,
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
  },
  centerPointer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -25,
    marginLeft: -25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  centerPointerText: {
    fontSize: 36,
  },
  setLocationBtn: {
    paddingVertical: 12,
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  setLocationBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
  selectedLocation: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#E0F2FE',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  selectedLocationText: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: '600',
  },
  pickerBtn: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  pickerBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: Dimensions.get('window').height * 0.7,
  },
  joinModalContent: {
    maxHeight: Dimensions.get('window').height * 0.5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  joinModalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalClose: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  pickerScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pickerOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: COLORS.background,
  },
  pickerOptionActive: {
    backgroundColor: COLORS.primary,
  },
  pickerOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  pickerOptionTextActive: {
    color: COLORS.white,
  },
  joinModalBody: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  joinGameModeTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  joinGameModeName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  joinLocation: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 4,
    fontWeight: '500',
  },
  joinTime: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 12,
    fontWeight: '500',
  },
  joinPlayerBar: {
    marginBottom: 12,
  },
  joinPlayerBarBg: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  joinPlayerBarFill: {
    height: '100%',
    backgroundColor: COLORS.success,
  },
  joinPlayerCount: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  joinJoinBtn: {
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    alignItems: 'center',
  },
  joinJoinBtnDisabled: {
    backgroundColor: COLORS.border,
  },
  joinJoinBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
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
