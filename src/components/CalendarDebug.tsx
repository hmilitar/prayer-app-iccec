import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CalendarDebugProps {
  availableDates: string[];
  selectedDate: string;
}

export const CalendarDebug: React.FC<CalendarDebugProps> = ({ 
  availableDates, 
  selectedDate 
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calendar Debug Information</Text>
      
      <View style={styles.section}>
        <Text style={styles.label}>Selected Date:</Text>
        <Text style={styles.value}>{selectedDate}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Available Dates Count:</Text>
        <Text style={styles.value}>{availableDates.length}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Available Dates:</Text>
        {availableDates.length === 0 ? (
          <Text style={styles.value}>No dates available</Text>
        ) : (
          availableDates.map((date, index) => (
            <Text key={index} style={styles.value}>{date}</Text>
          ))
        )}
      </View>

      {availableDates.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.label}>Selected Date Available:</Text>
          <Text style={[
            styles.value,
            availableDates.includes(selectedDate) ? styles.available : styles.unavailable
          ]}>
            {availableDates.includes(selectedDate) ? 'Yes' : 'No'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
    margin: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  section: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    color: '#333',
  },
  available: {
    color: 'green',
  },
  unavailable: {
    color: 'red',
  },
});
