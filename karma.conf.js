module.exports = function(config) {
  config.set({
    singleRun: true,
    frameworks: ['mocha', 'chai'],
    files: [
      { pattern: 'test/index.html', type: 'html' },
      { pattern: 'test/**/*.js', included: false },
      { pattern: 'src/**/*.js', included: false },
      { pattern: 'node_modules/lit-html/**', included: false, watched: false },
      { pattern: 'node_modules/@webcomponents/webcomponentsjs/**', included: false, watched: false },
      { pattern: 'node_modules/babel-polyfill/dist/polyfill.min.js', included: false, watched: false }
    ],
    reporters: ['mocha'],
    browsers: ['DockerChromeHeadless'],
    customLaunchers: {
      DockerChromeHeadless: {
        base: 'ChromeHeadless',
        flags: ['--disable-gpu', '--no-sandbox']
      },
      FirefoxHeadless: {
        base: 'Firefox',
        flags: ['-headless']
      }
    }
  });
};
