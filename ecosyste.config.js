module.exports = {
    apps: [
        {
            name: 'reset-ful',
            script: './src/index.js',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
            },
        }
    ]
};