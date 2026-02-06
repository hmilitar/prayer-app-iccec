<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal
} from 'react-native';
import { useLocalization } from '../hooks/useLocalization';
import { useData } from '../hooks/useData';
import { DevotionDay, LiturgicalDevotion } from '../types/Devotion';
import { formatDateToISO, getTodayISO } from '../utils/dateUtils';
import { CalendarView } from '../components/readings/CalendarView';
import { WebView } from 'react-native-webview';
import { CalendarDebug } from '../components/CalendarDebug';

export default function DailyDevotionsScreen() {
  const { currentLanguage, formatDate } = useLocalization();
  const { loadDailyDevotions, getAvailableReadingDates } = useData();
  const [devotionDay, setDevotionDay] = useState<DevotionDay | null>(null);
  const [selectedTime, setSelectedTime] = useState<'morning' | 'noon' | 'evening' | 'family'>('morning');
  const [selectedDate, setSelectedDate] = useState(getTodayISO());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [bibleModalVisible, setBibleModalVisible] = useState(false);
  const [bibleReference, setBibleReference] = useState<string>('');

  useEffect(() => {
    loadDevotions(selectedDate);
    loadAvailableDates();
  }, [currentLanguage, selectedDate]);

  const loadDevotions = async (date: string) => {
    try {
      setLoading(true);
      setError(null);
      const devotions = await loadDailyDevotions(date, currentLanguage);
      setDevotionDay(devotions);
    } catch (err) {
      console.error('Error loading devotions:', err);
      setError('Failed to load daily devotions. Please try again.');
      Alert.alert('Error', 'Failed to load daily devotions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableDates = async () => {
    try {
      console.log('Loading available dates for language:', currentLanguage);
      const dates = await getAvailableReadingDates(currentLanguage);
      console.log('Available dates:', dates); // Debug log
      if (!dates || dates.length === 0) {
        console.warn('No available dates found for language:', currentLanguage);
      }
      setAvailableDates(dates || []);
    } catch (err) {
      console.error('Error loading available dates:', err);
      setAvailableDates([]);
    }
  };

  const getBibleGatewayUrl = (reference: string) => {
    return `https://www.biblegateway.com/passage/?search=${encodeURIComponent(reference)}&version=NIV`;
  };

  const openBibleReference = (reference: string) => {
    setBibleReference(reference);
    setBibleModalVisible(true);
  };

  const selectedDevotion = devotionDay?.[selectedTime];

  const renderReadingSection = (section: any, title: string) => {
    if (!section) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {section.reference && (
          <TouchableOpacity onPress={() => openBibleReference(section.reference)}>
            <Text style={styles.reference}>{section.reference}</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.content}>{section.text}</Text>
      </View>
    );
  };

  const renderPrayerSection = (prayer: string, title: string) => {
    if (!prayer) return null;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.content}>{prayer}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading devotions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily Devotions</Text>
        <Text style={styles.date}>{formatDate(new Date(selectedDate), {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</Text>
        <TouchableOpacity 
          style={styles.calendarButton}
          onPress={() => setCalendarVisible(true)}
        >
          <Text style={styles.calendarButtonText}>Select Date</Text>
        </TouchableOpacity>
      </View>

      {/* Debug information */}
      <CalendarDebug 
        availableDates={availableDates} 
        selectedDate={selectedDate} 
      />

      <View style={styles.timeSelector}>
        {(['morning', 'noon', 'evening', 'family'] as const).map((time) => (
          <TouchableOpacity
            key={time}
            style={[
              styles.timeButton,
              selectedTime === time && styles.selectedTimeButton
            ]}
            onPress={() => setSelectedTime(time)}
          >
            <Text style={[
              styles.timeButtonText,
              selectedTime === time && styles.selectedTimeButtonText
            ]}>
              {time.charAt(0).toUpperCase() + time.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.contentContainer}>
        {selectedDevotion ? (
          <>
            {selectedDevotion.title && (
              <Text style={styles.devotionTitle}>{selectedDevotion.title}</Text>
            )}

            {selectedDevotion.signOfTheCross && (
              <View style={styles.section}>
                <Text style={styles.content}>{selectedDevotion.signOfTheCross}</Text>
              </View>
            )}

            {selectedDevotion.confession && renderPrayerSection(selectedDevotion.confession, 'Confession')}

            {selectedDevotion.psalmForTheDay && renderReadingSection(selectedDevotion.psalmForTheDay, 'Psalm for the Day')}

            {selectedDevotion.gloriaPatri && renderPrayerSection(selectedDevotion.gloriaPatri, 'Gloria Patri')}

            {selectedDevotion.readings && (
              <>
                {selectedDevotion.readings.oldTestament && renderReadingSection(selectedDevotion.readings.oldTestament, 'Old Testament')}
                {selectedDevotion.readings.canticle1 && renderReadingSection(selectedDevotion.readings.canticle1, 'Canticle')}
                {selectedDevotion.readings.newTestament && renderReadingSection(selectedDevotion.readings.newTestament, 'New Testament')}
                {selectedDevotion.readings.canticle2 && renderReadingSection(selectedDevotion.readings.canticle2, 'Canticle')}
                {selectedDevotion.readings.gospel && renderReadingSection(selectedDevotion.readings.gospel, 'Gospel')}
              </>
            )}

            {selectedDevotion.apostlesCreed && renderPrayerSection(selectedDevotion.apostlesCreed, 'Apostle\'s Creed')}

            {selectedDevotion.prayers && (
              <>
                {selectedDevotion.prayers.lordsPrayer && renderPrayerSection(selectedDevotion.prayers.lordsPrayer, 'The Lord\'s Prayer')}
                {selectedDevotion.prayers.prayerToStMichael && renderPrayerSection(selectedDevotion.prayers.prayerToStMichael, 'Prayer to St. Michael')}
                {selectedDevotion.prayers.collect && renderPrayerSection(selectedDevotion.prayers.collect, 'Collect')}
              </>
            )}

            {selectedDevotion.signOfTheCrossEnd && (
              <View style={styles.section}>
                <Text style={styles.content}>{selectedDevotion.signOfTheCrossEnd}</Text>
              </View>
            )}

            {selectedDevotion.reflection && renderPrayerSection(selectedDevotion.reflection, 'Reflection')}

            {selectedDevotion.metadata && (
              <View style={styles.metadataSection}>
                {selectedDevotion.metadata.liturgicalSeason && (
                  <Text style={styles.metadataText}>
                    Season: {selectedDevotion.metadata.liturgicalSeason}
                  </Text>
                )}
                {selectedDevotion.metadata.feast && (
                  <Text style={styles.metadataText}>
                    Feast: {selectedDevotion.metadata.feast}
                  </Text>
                )}
                {selectedDevotion.metadata.sourceReference && (
                  <Text style={styles.metadataText}>
                    Source: {selectedDevotion.metadata.sourceReference}
                  </Text>
                )}
              </View>
            )}
          </>
        ) : (
          <View style={styles.noDevotionContainer}>
            <Text style={styles.noDevotionText}>
              No devotions available for this date.
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => loadDevotions(selectedDate)}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
       </ScrollView>

      {/* Calendar Popup */}
      <CalendarView
        visible={calendarVisible}
        onClose={() => setCalendarVisible(false)}
        selectedDate={selectedDate}
        availableDates={availableDates}
        onDateSelect={(dateISO) => {
          setSelectedDate(dateISO);
          setCalendarVisible(false);
        }}
      />

      {/* Bible Gateway Modal */}
      <Modal
        visible={bibleModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setBibleModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{bibleReference}</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setBibleModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            <WebView
              source={{ uri: getBibleGatewayUrl(bibleReference) }}
              style={styles.webView}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#007bff" />
                  <Text style={styles.loadingText}>Loading Bible passage...</Text>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#007bff',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
   calendarButton: {
     marginTop: 10,
     paddingHorizontal: 20,
     paddingVertical: 8,
     backgroundColor: 'rgba(255, 255, 255, 0.2)',
     borderRadius: 20,
   },
   calendarButtonText: {
     color: 'white',
     fontSize: 14,
     fontWeight: '500',
   },
   centerContainer: {
     flex: 1,
     justifyContent: 'center',
     alignItems: 'center',
     backgroundColor: '#f5f5f5',
   },
  header: {
    backgroundColor: '#007bff',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  date: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  timeSelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 10,
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  timeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedTimeButton: {
    backgroundColor: '#007bff',
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  selectedTimeButtonText: {
    color: 'white',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  devotionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 8,
    textAlign: 'center',
  },
  reference: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 8,
    textAlign: 'center',
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    textAlign: 'justify',
  },
  metadataSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  metadataText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  noDevotionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noDevotionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});
=======
import React from 'react';
import { View, Text } from 'react-native';

export default function DailyDevotionsScreen() {
    return (
        <View>
            <Text>Daily Devotions</Text>
        </View>
    );
}
>>>>>>> 828180ffeabee9906add19b3bcf9df32c2115fa0
