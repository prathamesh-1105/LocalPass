const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

console.log('--- Starting Vercel Build Orchestration ---');

try {
  // 1. Clean root public directory
  if (fs.existsSync(publicDir)) {
    console.log('Cleaning existing root public directory...');
    fs.rmSync(publicDir, { recursive: true, force: true });
  }

  // 2. Build Mobile Web App (Expo)
  console.log('\n--- Building Student Mobile Web App (Expo) ---');
  const mobileDir = path.join(rootDir, 'artifacts', 'mobile');
  execSync('npx expo export --platform web', {
    cwd: mobileDir,
    stdio: 'inherit',
  });

  // 3. Build Admin Portal (Vite)
  console.log('\n--- Building College Admin Portal (Vite) ---');
  const adminDir = path.join(rootDir, 'artifacts', 'admin-portal');
  // Pass env variables for PORT and BASE_PATH
  const env = {
    ...process.env,
    PORT: '5000',
    BASE_PATH: '/admin/',
  };
  execSync('npx vite build --config vite.config.ts', {
    cwd: adminDir,
    env,
    stdio: 'inherit',
  });

  // 4. Merge directories into root public
  console.log('\n--- Merging builds into root public directory ---');
  fs.mkdirSync(publicDir, { recursive: true });

  const mobileDist = path.join(mobileDir, 'dist');
  const adminDist = path.join(adminDir, 'dist', 'public');

  if (fs.existsSync(mobileDist)) {
    console.log(`Copying Mobile Web App build from ${mobileDist} to ${publicDir}...`);
    fs.cpSync(mobileDist, publicDir, { recursive: true });
  } else {
    throw new Error('Mobile Web App build output not found!');
  }

  const adminTargetDir = path.join(publicDir, 'admin');
  if (fs.existsSync(adminDist)) {
    console.log(`Copying Admin Portal build from ${adminDist} to ${adminTargetDir}...`);
    fs.cpSync(adminDist, adminTargetDir, { recursive: true });
  } else {
    throw new Error('Admin Portal build output not found!');
  }

  console.log('\n--- Build Orchestration Completed Successfully! ---');
  console.log(`Final deployment bundle created at: ${publicDir}`);
} catch (error) {
  console.error('\nBuild Orchestration Failed:', error);
  process.exit(1);
}
