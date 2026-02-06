// Test script to verify data service functionality

const fs = require('fs');
const path = require('path');

// Import data files directly
const enDevotions = require('./src/data/devotions/en.json');
const etDevotions = require('./src/data/devotions/et.json');
const tlDevotions = require('./src/data/devotions/tl.json');

console.log('=== Data Service Integration Test ===');

// Function to simulate getAvailableReadingDates
const getAvailableReadingDates = (language) => {
  let devotions;
  
  switch (language) {
    case 'en':
      devotions = enDevotions.devotions;
      break;
    case 'et':
      devotions = etDevotions.devotions;
      break;
    case 'tl':
      devotions = tlDevotions.devotions;
      break;
    default:
      return [];
  }
  
  const uniqueDates = new Set();
  devotions.forEach(devotion => {
    uniqueDates.add(devotion.date);
  });
  
  return Array.from(uniqueDates);
};

// Function to simulate loadDailyDevotions
const loadDailyDevotions = (date, language) => {
  let devotions;
  
  switch (language) {
    case 'en':
      devotions = enDevotions.devotions;
      break;
    case 'et':
      devotions = etDevotions.devotions;
      break;
    case 'tl':
      devotions = tlDevotions.devotions;
      break;
    default:
      return null;
  }
  
  const dayDevotions = devotions.filter(devotion => devotion.date === date);
  
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
};

// Test English available dates
console.log('\n=== Testing English Available Dates ===');
const enDates = getAvailableReadingDates('en');
console.log(`Number of available dates: ${enDates.length}`);
console.log('Dates:', enDates);

// Test English devotions for current date
const today = '2026-02-06';
console.log(`\n=== Testing English Devotions for ${today} ===`);
const enDayDevotions = loadDailyDevotions(today, 'en');
if (enDayDevotions) {
  console.log('Devotions loaded successfully');
  console.log('Time slots available:');
  Object.keys(enDayDevotions).forEach(key => {
    if (key !== 'date' && enDayDevotions[key]) {
      console.log(`- ${key}`);
    }
  });
  
  // Check morning devotion content
  if (enDayDevotions.morning) {
    console.log(`\nMorning devotion content: ${enDayDevotions.morning.title}`);
  }
} else {
  console.log('No devotions found for this date');
}

// Test Tagalog available dates
console.log('\n=== Testing Tagalog Available Dates ===');
const tlDates = getAvailableReadingDates('tl');
console.log(`Number of available dates: ${tlDates.length}`);
console.log('Dates:', tlDates);

// Test Estonian available dates
console.log('\n=== Testing Estonian Available Dates ===');
const etDates = getAvailableReadingDates('et');
console.log(`Number of available dates: ${etDates.length}`);
console.log('Dates:', etDates);

// Verify all dates are valid
console.log('\n=== Date Validation Check ===');
const allDates = new Set([...enDates, ...tlDates, ...etDates]);
console.log(`Total unique dates across all languages: ${allDates.size}`);

// Check if all dates are in ISO format (YYYY-MM-DD)
let invalidDates = 0;
allDates.forEach(date => {
  const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoDatePattern.test(date)) {
    console.log(`Invalid date format: ${date}`);
    invalidDates++;
  }
});

console.log(`\nInvalid date formats found: ${invalidDates}`);

if (invalidDates === 0) {
  console.log('All dates are in valid ISO format');
}

console.log('\n=== Test Complete ===');
