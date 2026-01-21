#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Preparing Organizational Chart App for deployment...\n');

// Check if build exists
const buildDir = path.join(__dirname, 'build');
if (!fs.existsSync(buildDir)) {
  console.log('❌ Build directory not found. Running build first...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build completed successfully');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Check for required files
console.log('📋 Checking required files...');
let allFilesPresent = true;

// Check manifest
const manifestPath = path.join(__dirname, 'monday-app-manifest.json');
if (fs.existsSync(manifestPath)) {
  console.log('✅ monday-app-manifest.json');
} else {
  console.log('❌ monday-app-manifest.json - MISSING');
  allFilesPresent = false;
}

// Check build index.html
const indexPath = path.join(buildDir, 'index.html');
if (fs.existsSync(indexPath)) {
  console.log('✅ build/index.html');
} else {
  console.log('❌ build/index.html - MISSING');
  allFilesPresent = false;
}

// Check for main JS file
const jsDir = path.join(buildDir, 'static/js');
const jsFiles = fs.readdirSync(jsDir);
const mainJsFile = jsFiles.find(file => file.startsWith('main.') && file.endsWith('.js'));
if (mainJsFile) {
  console.log(`✅ build/static/js/${mainJsFile}`);
} else {
  console.log('❌ build/static/js/main.*.js - MISSING');
  allFilesPresent = false;
}

// Check for main CSS file
const cssDir = path.join(buildDir, 'static/css');
const cssFiles = fs.readdirSync(cssDir);
const mainCssFile = cssFiles.find(file => file.startsWith('main.') && file.endsWith('.css'));
if (mainCssFile) {
  console.log(`✅ build/static/css/${mainCssFile}`);
} else {
  console.log('❌ build/static/css/main.*.css - MISSING');
  allFilesPresent = false;
}

if (!allFilesPresent) {
  console.error('\n❌ Some required files are missing. Please check the build output.');
  process.exit(1);
}

// Create deployment package info
const packageInfo = {
  name: 'Organizational Chart App',
  version: require('./package.json').version,
  buildDate: new Date().toISOString(),
  files: fs.readdirSync(buildDir),
  manifest: JSON.parse(fs.readFileSync('monday-app-manifest.json', 'utf8'))
};

fs.writeFileSync(
  path.join(buildDir, 'deployment-info.json'),
  JSON.stringify(packageInfo, null, 2)
);

console.log('\n📦 Deployment package ready!');
console.log('📁 Build directory:', buildDir);
console.log('📄 Files to deploy:', packageInfo.files.length);
console.log('🎯 Ready for monday.com deployment');

console.log('\n📋 Next steps:');
console.log('1. Upload the entire "build" folder to your hosting service');
console.log('2. Copy the deployment URL');
console.log('3. Update your monday.com app settings with the URL');
console.log('4. Install the app in your monday.com workspace');

console.log('\n📖 See DEPLOYMENT_README.md for detailed instructions');