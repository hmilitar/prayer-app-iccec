#!/usr/bin/env node

/**
 * Pre-deployment checklist script
 * Run this before building for production to ensure everything is ready
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Prayer App - Production Readiness Check\n');

const checks = [];

// Check if required files exist
const requiredFiles = [
  'app.json',
  'eas.json',
  'package.json',
  'assets/icon.png',
  'assets/splash.png',
  'assets/adaptive-icon.png',
  'src/data/readings/en_new.json',
  'src/data/readings/tl_new.json',
  'src/data/readings/et_new.json',
  'src/data/translations/en.json',
  'src/data/translations/tl.json',
  'src/data/translations/et.json'
];

requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  checks.push({
    name: `File exists: ${file}`,
    status: exists ? 'PASS' : 'FAIL',
    required: true
  });
});

// Check app.json configuration
try {
  const appConfig = JSON.parse(fs.readFileSync('app.json', 'utf8'));
  const expo = appConfig.expo;

  checks.push({
    name: 'App name is set',
    status: expo.name ? 'PASS' : 'FAIL',
    value: expo.name,
    required: true
  });

  checks.push({
    name: 'Bundle identifier is set (iOS)',
    status: expo.ios?.bundleIdentifier ? 'PASS' : 'FAIL',
    value: expo.ios?.bundleIdentifier,
    required: true
  });

  checks.push({
    name: 'Package name is set (Android)',
    status: expo.android?.package ? 'PASS' : 'FAIL',
    value: expo.android?.package,
    required: true
  });

  checks.push({
    name: 'Version is set',
    status: expo.version ? 'PASS' : 'FAIL',
    value: expo.version,
    required: true
  });

  checks.push({
    name: 'Icon is configured',
    status: expo.icon && fs.existsSync(expo.icon) ? 'PASS' : 'FAIL',
    value: expo.icon,
    required: true
  });

  checks.push({
    name: 'Splash screen is configured',
    status: expo.splash?.image && fs.existsSync(expo.splash.image) ? 'PASS' : 'FAIL',
    value: expo.splash?.image,
    required: true
  });

  checks.push({
    name: 'Privacy flag set (iOS)',
    status: expo.ios?.infoPlist?.ITSAppUsesNonExemptEncryption === false ? 'PASS' : 'FAIL',
    value: expo.ios?.infoPlist?.ITSAppUsesNonExemptEncryption,
    required: true
  });

  checks.push({
    name: 'EAS project ID configured',
    status: expo.extra?.eas?.projectId ? 'PASS' : 'FAIL',
    value: expo.extra?.eas?.projectId,
    required: true
  });

} catch (error) {
  checks.push({
    name: 'app.json is valid JSON',
    status: 'FAIL',
    error: error.message,
    required: true
  });
}

// Check EAS configuration
try {
  const easConfig = JSON.parse(fs.readFileSync('eas.json', 'utf8'));

  checks.push({
    name: 'EAS production build profile exists',
    status: easConfig.build?.production ? 'PASS' : 'FAIL',
    required: true
  });

  checks.push({
    name: 'EAS submit configuration exists',
    status: easConfig.submit?.production ? 'PASS' : 'FAIL',
    required: false
  });

} catch (error) {
  checks.push({
    name: 'eas.json is valid JSON',
    status: 'FAIL',
    error: error.message,
    required: true
  });
}

// Check package.json
try {
  const packageConfig = JSON.parse(fs.readFileSync('package.json', 'utf8'));

  checks.push({
    name: 'Package name is set',
    status: packageConfig.name ? 'PASS' : 'FAIL',
    value: packageConfig.name,
    required: true
  });

  checks.push({
    name: 'Description is set',
    status: packageConfig.description ? 'PASS' : 'FAIL',
    value: packageConfig.description,
    required: false
  });

  checks.push({
    name: 'Production build scripts available',
    status: packageConfig.scripts?.['build:ios:production'] && packageConfig.scripts?.['build:android:production'] ? 'PASS' : 'FAIL',
    required: true
  });

} catch (error) {
  checks.push({
    name: 'package.json is valid JSON',
    status: 'FAIL',
    error: error.message,
    required: true
  });
}

// Check data files
const dataFiles = [
  'src/data/readings/en_new.json',
  'src/data/readings/tl_new.json',
  'src/data/readings/et_new.json'
];

dataFiles.forEach(file => {
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    checks.push({
      name: `${file} is valid JSON`,
      status: 'PASS',
      required: true
    });

    if (data.readings && Array.isArray(data.readings)) {
      const readingsCount = data.readings.length;
      checks.push({
        name: `${file} has readings data`,
        status: readingsCount > 0 ? 'PASS' : 'FAIL',
        value: `${readingsCount} readings`,
        required: true
      });
    }
  } catch (error) {
    checks.push({
      name: `${file} is valid JSON`,
      status: 'FAIL',
      error: error.message,
      required: true
    });
  }
});

// Display results
console.log('📋 Checklist Results:\n');

let passCount = 0;
let failCount = 0;
let requiredFailCount = 0;

checks.forEach((check, index) => {
  const status = check.status === 'PASS' ? '✅' : '❌';
  const required = check.required ? '(Required)' : '(Optional)';
  
  console.log(`${status} ${check.name} ${required}`);
  
  if (check.value) {
    console.log(`   Value: ${check.value}`);
  }
  
  if (check.error) {
    console.log(`   Error: ${check.error}`);
  }
  
  if (check.status === 'PASS') {
    passCount++;
  } else {
    failCount++;
    if (check.required) {
      requiredFailCount++;
    }
  }
  
  console.log('');
});

console.log('📊 Summary:');
console.log(`✅ Passed: ${passCount}`);
console.log(`❌ Failed: ${failCount}`);
console.log(`🚨 Required failures: ${requiredFailCount}\n`);

if (requiredFailCount === 0) {
  console.log('🎉 All required checks passed! The app is ready for production build.');
  console.log('\nNext steps:');
  console.log('1. Run: npm run build:ios:production');
  console.log('2. Run: npm run build:android:production');
  console.log('3. Submit to app stores when builds complete');
} else {
  console.log('🚨 Some required checks failed. Please fix these issues before building for production.');
  process.exit(1);
}
