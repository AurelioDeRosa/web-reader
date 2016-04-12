'use strict';

var browserifyIstanbul = require('browserify-istanbul');
var isparta = require('isparta');

module.exports = function(config) {
   config.set({
      browserify: {
         debug: true,
         transform: [
            'babelify',
            browserifyIstanbul({
               instrumenter: isparta
            })
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
         type : 'html',
         dir : 'coverage/'
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
   });
};