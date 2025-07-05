#!/usr/bin/env node

const { logger } = require('../utils/logger');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function diagnoseBuildIssues() {
  logger.info('🔍 Starting VX10 build diagnostics...');
  
  const results = {
    buildIntegrity: false,
    serverHealth: false,
    environmentCheck: false,
    dependencyCheck: false,
    configCheck: false,
    networkCheck: false
  };

  try {
    // 1. Check build integrity
    logger.info('📦 Checking build integrity...');
    results.buildIntegrity = await logger.checkBuildIntegrity();

    // 2. Check server health
    logger.info('🏥 Checking server health...');
    results.serverHealth = await logger.checkServerHealth();

    // 3. Check environment variables
    logger.info('🌍 Checking environment configuration...');
    results.environmentCheck = checkEnvironment();

    // 4. Check dependencies
    logger.info('📚 Checking dependencies...');
    results.dependencyCheck = checkDependencies();

    // 5. Check Next.js configuration
    logger.info('⚙️ Checking Next.js configuration...');
    results.configCheck = checkNextConfig();

    // 6. Check network and ports
    logger.info('🌐 Checking network configuration...');
    results.networkCheck = await checkNetwork();

    // 7. Generate recommendations
    generateRecommendations(results);

    logger.success('✅ Diagnostics completed!');
    return results;

  } catch (error) {
    logger.error('❌ Diagnostics failed', { error: error.message, stack: error.stack });
    return results;
  }
}

function checkEnvironment() {
  try {
    const envFile = path.join(process.cwd(), '.env.local');
    const envExampleFile = path.join(process.cwd(), '.env.example');

    const envData = {
      nodeVersion: process.version,
      nodeEnv: process.env.NODE_ENV || 'not set',
      hasEnvFile: fs.existsSync(envFile),
      hasEnvExample: fs.existsSync(envExampleFile),
      envVars: {}
    };

    // Check critical environment variables
    const criticalVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
      'JWT_SECRET'
    ];

    criticalVars.forEach(varName => {
      envData.envVars[varName] = process.env[varName] ? '✅ Set' : '❌ Missing';
    });

    logger.info('Environment check results', envData);

    // Check if all critical vars are set
    const missingVars = criticalVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      logger.warn('Missing critical environment variables', { missingVars });
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Environment check failed', { error: error.message });
    return false;
  }
}

function checkDependencies() {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageLockPath = path.join(process.cwd(), 'package-lock.json');
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');

    if (!fs.existsSync(packageJsonPath)) {
      logger.error('package.json not found');
      return false;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const depInfo = {
      hasPackageJson: true,
      hasPackageLock: fs.existsSync(packageLockPath),
      hasNodeModules: fs.existsSync(nodeModulesPath),
      nextVersion: packageJson.dependencies?.next || 'not installed',
      reactVersion: packageJson.dependencies?.react || 'not installed'
    };

    logger.info('Dependency check results', depInfo);

    // Try to run npm ls to check for broken dependencies
    try {
      execSync('npm ls --depth=0', { stdio: 'pipe' });
      logger.success('All dependencies are properly installed');
      return true;
    } catch (error) {
      logger.warn('Some dependencies may be broken', { 
        output: error.stdout?.toString(),
        error: error.stderr?.toString() 
      });
      return false;
    }

  } catch (error) {
    logger.error('Dependency check failed', { error: error.message });
    return false;
  }
}

function checkNextConfig() {
  try {
    const nextConfigPath = path.join(process.cwd(), 'next.config.js');
    const nextConfigMjsPath = path.join(process.cwd(), 'next.config.mjs');
    
    let configPath = null;
    if (fs.existsSync(nextConfigPath)) {
      configPath = nextConfigPath;
    } else if (fs.existsSync(nextConfigMjsPath)) {
      configPath = nextConfigMjsPath;
    }

    if (!configPath) {
      logger.warn('No Next.js configuration file found');
      return true; // This is optional
    }

    logger.info('Next.js config found', { configPath });

    // Check for common configuration issues
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    const issues = [];
    
    // Check for experimental features that might cause issues
    if (configContent.includes('appDir')) {
      issues.push('appDir experimental feature detected');
    }
    
    if (configContent.includes('serverComponents')) {
      issues.push('serverComponents experimental feature detected');
    }

    if (issues.length > 0) {
      logger.warn('Potential configuration issues detected', { issues });
    }

    return true;

  } catch (error) {
    logger.error('Next.js config check failed', { error: error.message });
    return false;
  }
}

async function checkNetwork() {
  try {
    const net = require('net');
    
    // Check if port 3000 is available
    const port = process.env.PORT || 3000;
    
    return new Promise((resolve) => {
      const server = net.createServer();
      
      server.listen(port, () => {
        server.close();
        logger.info('Port check passed', { port, status: 'available' });
        resolve(true);
      });
      
      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          logger.warn('Port already in use', { port, error: err.message });
          resolve(false);
        } else {
          logger.error('Network check failed', { port, error: err.message });
          resolve(false);
        }
      });
    });

  } catch (error) {
    logger.error('Network check failed', { error: error.message });
    return false;
  }
}

function generateRecommendations(results) {
  logger.info('📋 Generating recommendations...');
  
  const recommendations = [];

  if (!results.buildIntegrity) {
    recommendations.push({
      priority: 'HIGH',
      category: 'Build',
      issue: 'Build integrity check failed',
      solution: 'Run: npm run build or rm -rf .next && npm run build'
    });
  }

  if (!results.environmentCheck) {
    recommendations.push({
      priority: 'HIGH',
      category: 'Environment',
      issue: 'Missing critical environment variables',
      solution: 'Check .env.local file and ensure all required variables are set'
    });
  }

  if (!results.dependencyCheck) {
    recommendations.push({
      priority: 'MEDIUM',
      category: 'Dependencies',
      issue: 'Dependency issues detected',
      solution: 'Run: npm install or rm -rf node_modules package-lock.json && npm install'
    });
  }

  if (!results.networkCheck) {
    recommendations.push({
      priority: 'MEDIUM',
      category: 'Network',
      issue: 'Port conflicts detected',
      solution: 'Kill existing processes on port 3000 or use a different port'
    });
  }

  // Specific recommendations for 400 errors on chunk files
  recommendations.push({
    priority: 'HIGH',
    category: 'Chunk Loading',
    issue: '400 errors on JavaScript chunks indicate server routing issues',
    solution: 'Check if Next.js is properly serving static files. Try: npm run build && npm start'
  });

  recommendations.push({
    priority: 'MEDIUM',
    category: 'Cache',
    issue: 'Browser cache might be serving stale chunks',
    solution: 'Clear browser cache and hard refresh (Ctrl+Shift+R)'
  });

  if (recommendations.length === 0) {
    logger.success('🎉 No issues detected! Your build looks healthy.');
  } else {
    logger.warn(`⚠️ Found ${recommendations.length} recommendations:`, { recommendations });
  }

  return recommendations;
}

// Additional utility functions for quick fixes
async function quickFix() {
  logger.info('🔧 Running quick fix procedures...');
  
  const fixes = [
    {
      name: 'Clear Next.js cache',
      command: 'rm -rf .next',
      description: 'Removes cached build files'
    },
    {
      name: 'Rebuild application',
      command: 'npm run build',
      description: 'Creates fresh build'
    },
    {
      name: 'Clear npm cache',
      command: 'npm cache clean --force',
      description: 'Clears npm cache'
    }
  ];

  for (const fix of fixes) {
    try {
      logger.info(`Applying fix: ${fix.name}`, { description: fix.description });
      execSync(fix.command, { stdio: 'inherit' });
      logger.success(`✅ ${fix.name} completed`);
    } catch (error) {
      logger.error(`❌ ${fix.name} failed`, { error: error.message });
    }
  }
}

// Export functions for use in other scripts
module.exports = {
  diagnoseBuildIssues,
  quickFix,
  checkEnvironment,
  checkDependencies,
  checkNextConfig,
  checkNetwork
};

// Run diagnostics if this script is executed directly
if (require.main === module) {
  diagnoseBuildIssues()
    .then((results) => {
      if (process.argv.includes('--fix')) {
        return quickFix();
      }
      return results;
    })
    .catch((error) => {
      logger.error('Diagnostics script failed', { error: error.message });
      process.exit(1);
    });
}
