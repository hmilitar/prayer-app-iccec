// Test script to specifically test the Daily Devotions calendar integration

const fs = require('fs');
const path = require('path');

// Import devotions data
const enDevotions = require('./src/data/devotions/en.json');
const etDevotions = require('./src/data/devotions/et.json');
const tlDevotions = require('./src/data/devotions/tl.json');

console.log('=== Daily Devotions Calendar Test ===');

// Get all available devotions dates
const getAvailableDates = (language) => {
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

// Test function to simulate what the calendar does
const testCalendarRendering = (selectedDate, language) => {
  const availableDates = getAvailableDates(language);
  const date = new Date(selectedDate + 'T00:00:00');
  
  console.log(`\nLanguage: ${language.toUpperCase()}`);
  console.log(`Selected Date: ${selectedDate}`);
  console.log(`Month: ${date.getMonth() + 1}/${date.getFullYear()}`);
  console.log(`Available Dates Count: ${availableDates.length}`);
  console.log(`Dates with Devotions: ${availableDates}`);
  
  // Check if selected date is in available dates
  const hasDevotion = availableDates.includes(selectedDate);
  console.log(`Selected Date has Devotion: ${hasDevotion}`);
  
  if (hasDevotion) {
    // Find the specific devotion
    const languageDevotions = language === 'en' ? enDevotions.devotions : 
                            language === 'et' ? etDevotions.devotions : tlDevotions.devotions;
    const dateDevotions = languageDevotions.filter(d => d.date === selectedDate);
    
    console.log(`Time Slots Available: ${dateDevotions.map(d => d.timeOfDay).join(', ')}`);
    
    // Check if morning devotion exists
    const morningDevotion = dateDevotions.find(d => d.timeOfDay === 'morning');
    if (morningDevotion) {
      console.log(`Morning Devotion: ${morningDevotion.title}`);
    }
  }
};

// Test all languages
testCalendarRendering('2026-02-06', 'en');
testCalendarRendering('2026-02-06', 'et');
testCalendarRendering('2026-02-06', 'tl');

// Test January 2024
console.log('\n=== Testing January 2024 ===');
testCalendarRendering('2024-01-01', 'en');

console.log('\n=== Calendar Integration Test Complete ===');
console.log('\nThe Daily Devotions calendar should now:');
console.log('1. Display all dates in February 2026');
console.log('2. Highlight February 6, 2026 as selected');
console.log('3. Show clickable dates only for February 6, 2026 and January 1, 2024');
console.log('4. Display reading indicator dots for dates with devotions');
console.log('5. Navigate to January 2024 with the prev arrow');
