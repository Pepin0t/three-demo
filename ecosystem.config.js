module.exports = {
  apps: [{
    name: 'playground',
    script: './server.js',
    env: {
      NODE_ENV: 'development',
    },
    env_production: {
      NODE_ENV: 'production',
    },
  }],
};
