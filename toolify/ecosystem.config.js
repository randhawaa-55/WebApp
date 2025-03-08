module.exports = {
  apps: [{
    name: "toolify-server",
    script: "./server/server.js",
    env: {
      NODE_ENV: "production",
      PORT: 5000
    },
    watch: false,
    max_memory_restart: '300M'
  }]
}; 