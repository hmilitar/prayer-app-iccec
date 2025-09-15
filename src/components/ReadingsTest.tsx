// Test component for readings data

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useData } from '../hooks/useData';
import { SupportedLanguage } from '../types/Prayer';

export default function ReadingsTest() {
  const { loadDailyReading } = useData();
  const [testResults, setTestResults] = useState<string[]>([]);

  const testDates = [
    '2025-08-01',
    '2025-08-06', // Transfiguration
    '2025-08-10', // 19th Sunday
    '2025-08-15', // Assumption
    '2025-08-28'  // Today (should fail)
  ];

  useEffect(() => {
    const runTests = async () => {
      const results: string[] = [];
      
      for (const date of testDates) {
        try {
          const reading = await loadDailyReading(date, 'en' as SupportedLanguage);
          if (reading) {
            results.push(`✅ ${date}: ${reading.title}`);
          } else {
            results.push(`❌ ${date}: No reading found`);
          }
        } catch (error) {
          results.push(`❌ ${date}: Error - ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
      
      setTestResults(results);
    };

    runTests();
  }, [loadDailyReading]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Readings Data Test</Text>
      <ScrollView style={styles.scrollView}>
        {testResults.map((result, index) => (
          <Text key={`test-${index}-${result.substring(0, 10)}`} style={styles.result}>
            {result}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  result: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: 'white',
    borderRadius: 5,
    fontSize: 14,
  },
});
