import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList, SafeAreaView, TextInput, Alert, Modal, Dimensions, Animated, AsyncStorage, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { fetchMatches, createMatch, joinMatch, getOrCreateUser } from './api';

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
  const [viewMode, setViewMode] = useState('map');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [selectedMatchForJoin, setSelectedMatchForJoin] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Animated values for modals
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
    longitude: -23.5505,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  const mapRef = useRef(null);

  // Initialize user and load matches
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Get or generate device ID
      let deviceId = await AsyncStorage.getItem('deviceId');
      if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem('deviceId', deviceId);
      }

      // Get or create user
      const user = await getOrCreateUser(deviceId);
      setUserId(user);

      // Load matches from backend
      const fetchedMatches = await fetchMatches();
      setMatches(fetchedMatches);
    } catch (error) {
      console.error('Init error:', error);
      Alert.alert('Error', 'Failed to initialize app. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Animate modal slide up
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (showDatePicker || showTimePicker || showJoinModal) {
      slideAnim.setValue(Dimensions.get('window').height);
      fadeAnim.setValue(0);
      
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: Dimensions.get('window').height,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showDatePicker, showTimePicker, showJoinModal]);

  const handleMapRegionChange = (region) => {
    setMapRegion(region);
  };

  const handleMarkerPress = (match) => {
    setSelectedMatchForJoin(match);
    setShowJoinModal(true);
  };

  const joinMatchHandler = async () => {
    if (selectedMatchForJoin && userId) {
      try {
        await joinMatch(selectedMatchForJoin.id, userId);
        Alert.alert('Success!', `You joined ${selectedMatchForJoin.name} at ${selectedMatchForJoin.location}!`);
        setShowJoinModal(false);
        setSelectedMatchForJoin(null);
        // Refresh matches
        const fetchedMatches = await fetchMatches();
        setMatches(fetchedMatches);
      } catch (error) {
        Alert.alert('Error', 'Failed to join match');
      }
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

  const createMatchHandler = async () => {
    if (formData.date === 'Select date') {
      Alert.alert('Error', 'Please select a date');
      return;
    }
    if (formData.time === 'Select time') {
      Alert.alert('Error', 'Please select a time');
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'User not initialized');
      return;
    }

    try {
      const maxPlayers = formData.gameMode === '3vs3' ? 6 : 8;

      const newMatchData = {
        name: formData.gameMode,
        location: formData.location,
        lat: formData.lat,
        lng: formData.lng,
        time: formData.time,
        date: formData.date,
        maxPlayers: maxPlayers,
      };

      await createMatch(newMatchData, userId);
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
      setActiveTab('map');

      // Refresh matches
      const fetchedMatches = await fetchMatches();
      setMatches(fetchedMatches);
    } catch (error) {
      console.error('Create match error:', error);
      Alert.alert('Error', 'Failed to create match. Make sure backend is running.');
    }
  };

  const renderMatchCard = ({ item }) => {
    const spotsLeft = item.maxPlayers - (item.currentPlayers || 0);
    const isFull = spotsLeft <= 0;

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
                { width: `${((item.currentPlayers || 0) / item.maxPlayers) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.playerCount}>
            👥 {item.currentPlayers || 0}/{item.maxPlayers}
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

  const closeModal = (modalSetter) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: Dimensions.get('window').height,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      modalSetter(false);
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 16, color: COLORS.textLight }}>Loading Volley Rio...</Text>
      </SafeAreaView>
    );
  }

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
          <TouchableOpacity style={styles.createBtn} onPress={createMatchHandler}>
            <Text style={styles.createBtnText}>Create Match</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Bottom Sheet Overlay */}
      {(showDatePicker || showTimePicker || showJoinModal) && (
        <Animated.View
          style={[
            styles.bottomSheetOverlay,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.overlayTouchable}
            onPress={() => {
              if (showDatePicker) closeModal(setShowDatePicker);
              if (showTimePicker) closeModal(setShowTimePicker);
              if (showJoinModal) closeModal(setShowJoinModal);
            }}
          />
        </Animated.View>
      )}

      {/* Date Picker Bottom Sheet */}
      {showDatePicker && (
        <Animated.View
          style={[
            styles.animatedBottomSheet,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.bottomSheetContent}>
            <View style={styles.bottomSheetHeader}>
              <Text style={styles.bottomSheetTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => closeModal(setShowDatePicker)}>
                <Text style={styles.bottomSheetClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerScroll}>
              {DATES.map((date) => (
                <TouchableOpacity
                  key={date}
                  style={[styles.pickerOption, formData.date === date && styles.pickerOptionActive]}
                  onPress={() => {
                    selectDate(date);
                    closeModal(setShowDatePicker);
                  }}
                >
                  <Text style={[styles.pickerOptionText, formData.date === date && styles.pickerOptionTextActive]}>
                    {date}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Animated.View>
      )}

      {/* Time Picker Bottom Sheet */}
      {showTimePicker && (
        <Animated.View
          style={[
            styles.animatedBottomSheet,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.bottomSheetContent}>
            <View style={styles.bottomSheetHeader}>
              <Text style={styles.bottomSheetTitle}>Select Time</Text>
              <TouchableOpacity onPress={() => closeModal(setShowTimePicker)}>
                <Text style={styles.bottomSheetClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerScroll}>
              {TIMES.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[styles.pickerOption, formData.time === time && styles.pickerOptionActive]}
                  onPress={() => {
                    selectTime(time);
                    closeModal(setShowTimePicker);
                  }}
                >
                  <Text style={[styles.pickerOptionText, formData.time === time && styles.pickerOptionTextActive]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Animated.View>
      )}

      {/* Join Match Bottom Sheet */}
      {showJoinModal && selectedMatchForJoin && (
        <Animated.View
          style={[
            styles.animatedBottomSheet,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={[styles.bottomSheetContent, styles.joinBottomSheetContent]}>
            <View style={styles.joinBottomSheetHeader}>
              <View style={{ width: 24 }} />
              <TouchableOpacity onPress={() => closeModal(setShowJoinModal)}>
                <Text style={styles.bottomSheetClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.joinBottomSheetBody}>
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
                      { width: `${((selectedMatchForJoin.currentPlayers || 0) / selectedMatchForJoin.maxPlayers) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.joinPlayerCount}>
                  👥 {selectedMatchForJoin.currentPlayers || 0}/{selectedMatchForJoin.maxPlayers}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.joinJoinBtn,
                  (selectedMatchForJoin.currentPlayers || 0) >= selectedMatchForJoin.maxPlayers && styles.joinJoinBtnDisabled,
                ]}
                onPress={joinMatchHandler}
                disabled={(selectedMatchForJoin.currentPlayers || 0) >= selectedMatchForJoin.maxPlayers}
              >
                <Text style={styles.joinJoinBtnText}>
                  {(selectedMatchForJoin.currentPlayers || 0) >= selectedMatchForJoin.maxPlayers ? 'Match Full' : 'Join Match'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
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
  bottomSheetOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlayTouchable: {
    flex: 1,
  },
  animatedBottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  bottomSheetContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: Dimensions.get('window').height * 0.7,
  },
  joinBottomSheetContent: {
    maxHeight: Dimensions.get('window').height * 0.5,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  joinBottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  bottomSheetClose: {
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
  joinBottomSheetBody: {
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
