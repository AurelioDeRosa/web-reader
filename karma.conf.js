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
         args: [],
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
               type: 'text-summary'
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
         'coverage',
         'coveralls'
      ],
      reportSlowerThan: 800,
      singleRun: true
   };

   if (process.env.CI) {
      settings.client.args.push('ci');
      settings.browsers = ['Chrome_travis_ci'];
   }

   config.set(settings);
};