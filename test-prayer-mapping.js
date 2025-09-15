// Test file to verify prayer mapping functionality
import { getMappedPrayerId, getAllEquivalentPrayerIds } from '../src/utils/prayerMapping';

console.log('Testing Prayer Mapping:');
console.log('');

// Test 1: Lord's Prayer mapping
console.log('Test 1: Lord\'s Prayer mapping');
console.log('ama-namin -> en:', getMappedPrayerId('ama-namin', 'en')); // Should return 'lords-prayer'
console.log('lords-prayer -> tl:', getMappedPrayerId('lords-prayer', 'tl')); // Should return 'ama-namin'
console.log('meie-isa -> en:', getMappedPrayerId('meie-isa', 'en')); // Should return 'lords-prayer'
console.log('');

// Test 2: Gloria Patri mapping
console.log('Test 2: Gloria Patri mapping');
console.log('luwalhati-sa-diyos -> en:', getMappedPrayerId('luwalhati-sa-diyos', 'en')); // Should return 'gloria-patri'
console.log('au-olgu-isale -> tl:', getMappedPrayerId('au-olgu-isale', 'tl')); // Should return 'luwalhati-sa-diyos'
console.log('');

// Test 3: Prayer with same ID across languages
console.log('Test 3: Prayer with same ID across languages');
console.log('come-holy-spirit -> en:', getMappedPrayerId('come-holy-spirit', 'en')); // Should return 'come-holy-spirit'
console.log('come-holy-spirit -> tl:', getMappedPrayerId('come-holy-spirit', 'tl')); // Should return 'come-holy-spirit'
console.log('');

// Test 4: Get all equivalent IDs
console.log('Test 4: Get all equivalent IDs');
console.log('Equivalents for ama-namin:', getAllEquivalentPrayerIds('ama-namin'));
console.log('Equivalents for come-holy-spirit:', getAllEquivalentPrayerIds('come-holy-spirit'));
console.log('');

// Test 5: Non-existent prayer
console.log('Test 5: Non-existent prayer');
console.log('non-existent -> en:', getMappedPrayerId('non-existent', 'en')); // Should return 'non-existent'
console.log('');

console.log('Prayer mapping tests completed.');
