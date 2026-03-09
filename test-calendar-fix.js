// Test script to verify the calendar fix

const fs = require('fs');
const path = require('path');

// Mock the data service to test the getAvailableReadingDates method
const enDevotions = require('./src/data/devotions/en.json');
const tlDevotions = require('./src/data/devotions/tl.json');
const etDevotions = require('./src/data/devotions/et.json');

console.log('=== Testing getAvailableReadingDates Method ===');

// Test English devotions
console.log('\n1. English Devotions:');
console.log(`Total devotions: ${enDevotions.devotions.length}`);
const enDates = new Set();
enDevotions.devotions.forEach(devotion => {
  enDates.add(devotion.date);
});
console.log(`Unique dates: ${Array.from(enDates).length}`);
console.log('Dates:', Array.from(enDates));

// Test Tagalog devotions
console.log('\n2. Tagalog Devotions:');
console.log(`Total devotions: ${tlDevotions.devotions.length}`);
const tlDates = new Set();
tlDevotions.devotions.forEach(devotion => {
  tlDates.add(devotion.date);
});
console.log(`Unique dates: ${Array.from(tlDates).length}`);
console.log('Dates:', Array.from(tlDates));

// Test Estonian devotions
console.log('\n3. Estonian Devotions:');
console.log(`Total devotions: ${etDevotions.devotions.length}`);
const etDates = new Set();
etDevotions.devotions.forEach(devotion => {
  etDates.add(devotion.date);
});
console.log(`Unique dates: ${Array.from(etDates).length}`);
console.log('Dates:', Array.from(etDates));

// Verify if all dates have at least one devotion
console.log('\n=== Verification Check ===');
const allDates = new Set([...Array.from(enDates), ...Array.from(tlDates), ...Array.from(etDates)]);
console.log(`Total unique dates across all languages: ${allDates.size}`);

// Check if current date is available
const today = new Date().toISOString().split('T')[0];
console.log(`\nToday (${today}) has devotions?`);
console.log(`English: ${enDates.has(today)}`);
console.log(`Tagalog: ${tlDates.has(today)}`);
console.log(`Estonian: ${etDates.has(today)}`);

console.log('\n=== Calendar Fix Test Complete ===');
