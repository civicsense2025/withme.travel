module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@hooks': './src/hooks',
            '@utils': './src/utils',
            '@services': './src/services',
            '@types': './src/types',
            '@constants': './src/constants',
            '@navigation': './src/navigation',
            '@shared': './src/shared',
          }
        }
      ]
    ]
  };
};
