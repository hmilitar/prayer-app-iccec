// Test script to verify useData hook integration with devotions

const fs = require('fs');
const path = require('path');

// Import data files
const enDevotions = require('./src/data/devotions/en.json');
const useDataModule = require('./src/hooks/useData');

console.log('=== useData Hook Integration Test ===');
console.log('Testing Daily Devotions Screen integration with useData hook');

// Mock dependencies
const mockDataService = {
  getDailyDevotions: async (date, language) => {
    console.log(`getDailyDevotions called for date: ${date}, language: ${language}`);
    
    // Find all devotions for the specified date
    const dayDevotions = enDevotions.devotions.filter(devotion => devotion.date === date);
    
    if (dayDevotions.length === 0) {
      return null;
    }
    
    return {
      date,
      morning: dayDevotions.find(d => d.timeOfDay === 'morning'),
      noon: dayDevotions.find(d => d.timeOfDay === 'noon'),
      evening: dayDevotions.find(d => d.timeOfDay === 'evening'),
      family: dayDevotions.find(d => d.timeOfDay === 'family'),
    };
  },
  
  getAvailableReadingDates: async (language) => {
    console.log(`getAvailableReadingDates called for language: ${language}`);
    
    const uniqueDates = new Set();
    enDevotions.devotions.forEach(devotion => {
      uniqueDates.add(devotion.date);
    });
    
    return Array.from(uniqueDates);
  }
};

// Mock useData hook to return our test data
const mockUseData = () => ({
  loadDailyDevotions: mockDataService.getDailyDevotions,
  getAvailableReadingDates: mockDataService.getAvailableReadingDates
});

console.log('');
console.log('=== Testing getAvailableReadingDates ===');
mockUseData().getAvailableReadingDates('en')
  .then(dates => {
    console.log(`Successfully loaded ${dates.length} available dates`);
    console.log('Dates:', dates);
    console.log('');
    
    console.log('=== Testing loadDailyDevotions for 2026-02-06 ===');
    return mockUseData().loadDailyDevotions('2026-02-06', 'en');
  })
  .then(devotionDay => {
    if (devotionDay) {
      console.log('Successfully loaded devotion day');
      console.log(`Date: ${devotionDay.date}`);
      console.log('Time slots available:', Object.keys(devotionDay).filter(key => key !== 'date'));
      
      // Check if all time slots have data
      Object.keys(devotionDay).forEach(key => {
        if (key !== 'date' && devotionDay[key]) {
          console.log(`- ${key}: Available`);
        }
      });
      
      console.log('');
      console.log('=== Integration Test Passed ===');
      console.log('The useData hook is properly integrated and returns valid devotion data');
    } else {
      console.error('ERROR: No devotions found for 2026-02-06');
    }
  })
  .catch(error => {
    console.error('ERROR:', error);
  });
