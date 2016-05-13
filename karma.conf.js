'use strict';

var browserifyIstanbul = require('browserify-istanbul');
var isparta = require('isparta');

module.exports = function(config) {
   var settings = {
      browserify: {
         debug: true,
         transform: [
            browserifyIstanbul({
               instrumenter: isparta
            }),
            'babelify'
         ]
      },
      browsers: ['Chrome'],
      browserNoActivityTimeout: 1500,
      captureTimeout: 3000,
      client: {
         mocha: {
            timeout: 1500,
            ui: 'bdd'
         }
      },
      coverageReporter: {
         dir : 'coverage',
         reporters: [
            {
               type : 'html'
            },
            {
               type: 'lcovonly',
               subdir: 'lcov'
            }
         ]
      },
      customLaunchers: {
         Chrome_travis_ci: {
            base: 'Chrome',
            flags: ['--no-sandbox']
         }
      },
      files: [
         'test/spec/**/*.js',
         'test/fixtures/**/*.html'
      ],
      frameworks: [
         'browserify',
         'mocha',
         'chai-as-promised',
         'chai',
         'sinon-chai',
         'fixture'
      ],
      port: 9001,
      preprocessors: {
         'test/spec/**/*.js': ['browserify'],
         'test/fixtures/**/*.html': ['html2js']
      },
      reporters: [
         'mocha',
         'coverage'
      ],
      reportSlowerThan: 800,
      singleRun: true
   };

   if (process.env.TRAVIS) {
      settings.browsers = ['Chrome_travis_ci'];
   }

   config.set(settings);
};