const fs = require('fs');
const path = require('path');

// Helper function to read and parse JSON files
function readJSONFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

// Test function to verify devotions data structure
function testDevotions() {
  console.log('Testing Devotions Data Structure\n');
  
  const languages = ['en', 'et', 'tl'];
  
  languages.forEach(language => {
    const filePath = path.join(__dirname, 'src', 'data', 'devotions', `${language}.json`);
    const devotionsData = readJSONFile(filePath);
    
    if (devotionsData) {
      console.log(`✅ ${language.toUpperCase()} devotions file is valid JSON`);
      
      if (devotionsData.devotions && Array.isArray(devotionsData.devotions)) {
        console.log(`  Found ${devotionsData.devotions.length} devotions`);
        
        // Check each devotion
        devotionsData.devotions.forEach((devotion, index) => {
          console.log(`  Devotion ${index + 1}: ${devotion.title || 'Untitled'}`);
          console.log(`    Date: ${devotion.date}`);
          console.log(`    Time: ${devotion.timeOfDay}`);
          
          // Verify the structure follows the new format
          const requiredFields = ['date', 'timeOfDay', 'content'];
          const missingFields = requiredFields.filter(field => !devotion[field]);
          
          if (missingFields.length > 0) {
            console.warn(`    ⚠️  Missing required fields: ${missingFields.join(', ')}`);
          }
          
          // Check if it has the new liturgical structure
          if (devotion.signOfTheCross && devotion.confession && devotion.readings) {
            console.log('    ✅ Follows new liturgical structure');
          } else {
            console.log('    ⚠️  Uses old structure');
          }
        });
      } else {
        console.warn(`  ⚠️  No devotions array found`);
      }
    } else {
      console.error(`❌ ${language.toUpperCase()} devotions file is invalid`);
    }
    
    console.log('');
  });
}

// Test TypeScript definitions
function testTypeDefinitions() {
  console.log('Testing Type Definitions\n');
  
  const devotionTypePath = path.join(__dirname, 'src', 'types', 'Devotion.ts');
  
  try {
    const typeContent = fs.readFileSync(devotionTypePath, 'utf8');
    
    // Check if the new interfaces are present
    if (typeContent.includes('interface LiturgicalDevotion')) {
      console.log('✅ LiturgicalDevotion interface exists');
    }
    
    if (typeContent.includes('interface ReadingSection')) {
      console.log('✅ ReadingSection interface exists');
    }
    
    if (typeContent.includes('interface Canticle')) {
      console.log('✅ Canticle interface exists');
    }
    
    if (typeContent.includes('interface PrayersSection')) {
      console.log('✅ PrayersSection interface exists');
    }
    
  } catch (error) {
    console.error(`❌ Error reading type definitions:`, error.message);
  }
  
  console.log('');
}

// Test the DailyDevotionsScreen component file
function testDailyDevotionsScreen() {
  console.log('Testing DailyDevotionsScreen\n');
  
  const screenPath = path.join(__dirname, 'src', 'screens', 'DailyDevotionsScreen.tsx');
  
  try {
    const screenContent = fs.readFileSync(screenPath, 'utf8');
    
    // Check if the component uses the new structure
    if (screenContent.includes('LiturgicalDevotion')) {
      console.log('✅ Uses LiturgicalDevotion type');
    }
    
    if (screenContent.includes('renderReadingSection')) {
      console.log('✅ Has reading section renderer');
    }
    
    if (screenContent.includes('renderPrayerSection')) {
      console.log('✅ Has prayer section renderer');
    }
    
    // Check if it fetches data correctly
    if (screenContent.includes('dataService.getDailyDevotions')) {
      console.log('✅ Fetches devotions from data service');
    }
    
  } catch (error) {
    console.error(`❌ Error reading DailyDevotionsScreen:`, error.message);
  }
}

// Run all tests
console.log('=== DEVOTIONS TEST ===\n');
testDevotions();
testTypeDefinitions();
testDailyDevotionsScreen();
console.log('\n=== TEST COMPLETED ===');
