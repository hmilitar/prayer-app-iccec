module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@/components': './src/components',
            '@/screens': './src/screens',
            '@/navigation': './src/navigation',
            '@/services': './src/services',
            '@/data': './src/data',
            '@/hooks': './src/hooks',
            '@/types': './src/types',
            '@/styles': './src/styles',
            '@/utils': './src/utils',
            '@/i18n': './src/i18n'
          }
        }
      ]
    ]
  };
};