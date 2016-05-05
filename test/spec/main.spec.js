import WebReader from '../../src/main';
import WebReaderError from '../../src/webreader-error';

describe('WebReader', () => {
   describe('constructor()', () => {
      it('should crate an instance of WebReader', () => {
         let webReader = new WebReader();

         assert.instanceOf(webReader, WebReader, 'The returned object is an instance of WebReader');
         assert.isObject(webReader.settings, 'The settings are exposed');
         assert.isObject(webReader.recognizer, 'The recognizer object is exposed');
         assert.isObject(webReader.speaker, 'The speaker object is exposed');
      });

      it('should use the default settings when custom options are not provided', () => {
         let webReader = new WebReader();

         assert.deepEqual(webReader.settings, {
            delay: 300,
            translationsPath: '',
            recognizer: {
               lang: 'en-GB'
            },
            speaker: {
               lang: 'en-GB',
               voice: 'Google UK English Female'
            }
         }, 'The default settings are set');
      });
   });

   describe('goToPreviousPage()', () => {
      let webReader = new WebReader();

      before(done => {
         function onPopState() {
            window.removeEventListener('popstate', onPopState);
            done();
         }

         // Go to the beginning of the browser's history
         window.history.pushState({}, 'test', '#reset');
         window.addEventListener('popstate', onPopState);
         window.history.go((window.history.length - 1) * -1);
      });

      it('should fail if the current page is the first in the history', () => {
         return assert.isRejected(webReader.goToPreviousPage(), WebReaderError, 'Promise is rejected');
      });

      it('should change URL if there is a previous page', () => {
         let initialUrl = window.location.toString();

         window.history.pushState({}, 'test', '#prev-page');

         return webReader
            .goToPreviousPage()
            .then(() => assert.strictEqual(window.location.toString(), initialUrl, 'The URL is changed'));
      });
   });

   describe('goToNextPage()', () => {
      let webReader = new WebReader();

      before(() => {
         // Resets the history ahead of the current page
         window.history.pushState({}, 'test', '#next-page');
      });

      it('should fail if the current page is the last in the history', () => {
         return assert.isRejected(webReader.goToNextPage(), WebReaderError, 'Promise is rejected');
      });

      it('should change URL if there is a next page', () => {
         window.history.pushState({}, 'test', '#another-page');

         let nextUrl = window.location.toString();
         let changeUrl = new Promise(resolve => {
            function onPopState() {
               window.removeEventListener('popstate', onPopState);
               resolve();
            }

            window.addEventListener('popstate', onPopState);
            window.history.back();
         });

         return changeUrl
            .then(webReader.goToNextPage)
            .then(() => assert.strictEqual(window.location.toString(), nextUrl, 'The URL is changed'));
      });
   });
});