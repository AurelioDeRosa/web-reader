import WebReader from '../../src/main';
import WebReaderError from '../../src/webreader-error';
import EventEmitter from '../../src/helpers/event-emitter';

let shortCuts = {
   toggleInteraction: [
      {
         ctrlKey: true,
         code: 'Space'
      },
      {
         ctrlKey: true,
         which: 32
      }
   ]
};

function simulateToggleInteractionShortcut() {
   EventEmitter.fireEvent('keydown', document.documentElement, shortCuts.toggleInteraction.reverse()[0]);
}

describe('WebReader', () => {
   const METHODS_DELAY = 5;
   const webReader = new WebReader({
      delay: 0
   });

   before(() => {
      fixture.setBase('test/fixtures');
   });

   beforeEach(() => {
      fixture.load('page.html');
   });

   afterEach(() => {
      fixture.cleanup();
   });

   describe('constructor()', () => {
      let webReader = new WebReader();

      it('should crate an instance of WebReader', () => {
         assert.instanceOf(webReader, WebReader, 'The returned object is an instance of WebReader');
         assert.isObject(webReader.settings, 'The settings are exposed');
         assert.isObject(webReader.recognizer, 'The recognizer object is exposed');
         assert.isObject(webReader.speaker, 'The speaker object is exposed');
      });

      it('should use the default settings when custom options are not provided', () => {
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

   describe('isInteracting()', () => {
      it('should return true if WebReader is interacting', () => {
         let speakerStub = sinon
            .stub(webReader.speaker, 'speak')
            .returns(new Promise(resolve => {
               setTimeout(resolve, METHODS_DELAY);
            }));
         let recognizerStub = sinon
            .stub(webReader.recognizer, 'recognize')
            .returns(new Promise(resolve => {
               setTimeout(() => resolve('search main content'), METHODS_DELAY);
            }));
         let promise = webReader.receiveCommand();

         assert.isTrue(webReader.isInteracting(), 'The returned value is correct');

         return promise.then(() => {
            speakerStub.restore();
            recognizerStub.restore();
         });
      });

      it('should return false if WebReader is not interacting', () => {
         webReader.stopCommand();

         assert.isFalse(webReader.isInteracting(), 'The returned value is correct');
      });
   });

   describe('enableShortcuts()', () => {
      afterEach(() => {
         webReader.disableShortcuts();
      });

      it('should return the current instance of WebReader is returned', () => {
         assert.strictEqual(webReader, webReader.enableShortcuts(), 'The instance is returned');
      });

      it('should enable the shortcuts', () => {
         let stub = sinon.stub(webReader, 'receiveCommand');

         webReader.enableShortcuts();

         simulateToggleInteractionShortcut();

         assert.isTrue(stub.calledOnce, 'The shortcut to activate WebReader is enabled');

         stub.restore();
      });
   });

   describe('disableShortcuts()', () => {
      beforeEach(() => {
         webReader.enableShortcuts();
      });

      it('should return the current instance of WebReader is returned', () => {
         assert.strictEqual(webReader, webReader.disableShortcuts(), 'The instance is returned');
      });

      it('should disable the shortcuts', () => {
         let stub = sinon.stub(webReader, 'receiveCommand');

         webReader.disableShortcuts();

         simulateToggleInteractionShortcut();

         assert.isTrue(stub.notCalled, 'The shortcut to activate WebReader is disabled');

         stub.restore();
      });
   });

   describe('stopCommand()', () => {
      let speakerStub, recognizerStub;

      before(() => {
         speakerStub = sinon
            .stub(webReader.speaker, 'speak')
            .returns(new Promise(resolve => {
               setTimeout(resolve, METHODS_DELAY);
            }));
         recognizerStub = sinon
            .stub(webReader.recognizer, 'recognize')
            .returns(new Promise(resolve => {
               setTimeout(() => resolve('search main content'), METHODS_DELAY);
            }));
      });

      beforeEach(() => {
         webReader.receiveCommand();
      });

      afterEach(() => {
         speakerStub.reset();
         recognizerStub.reset();
      });

      after(() => {
         speakerStub.restore();
         recognizerStub.restore();
      });

      it('should stop an interaction', () => {
         let speakerSpy = sinon.spy(webReader.speaker, 'cancel');
         let recognizerSpy = sinon.spy(webReader.recognizer, 'abort');

         assert.isTrue(webReader.isInteracting(), 'An interaction is in progress');

         webReader.stopCommand();

         assert.isTrue(speakerSpy.calledOnce, 'The speaker is stopped');
         assert.isTrue(recognizerSpy.calledOnce, 'The recognizer is stopped');
         assert.isFalse(webReader.isInteracting(), 'No interaction is in progress');

         speakerSpy.restore();
         recognizerSpy.restore();
      });
   });

   describe('readMain()', () => {
      it('should read the content of the main element', () => {
         let stub = sinon
            .stub(webReader.speaker, 'speak')
            .returns(Promise.resolve());
         let main = document.querySelector('main');
         let promise = webReader.readMain();

         return Promise.all([
            assert.instanceOf(promise, Promise, 'The value returned is a promise'),
            assert.isFulfilled(promise, 'The promise is fulfilled'),
            promise.then(() => {
               let promptedText = stub.args[0][0];

               assert.isTrue(stub.calledOnce, 'The speak method is called');
               assert.strictEqual(promptedText, main.textContent, 'The content of the main element is read');

               stub.restore();
            })
         ]);
      });
   });

   describe('searchMain()', () => {
      it('should focus the main element', () => {
         let main = document.querySelector('main');

         webReader.searchMain();

         assert.strictEqual(main.getAttribute('tabindex'), '-1', 'The value for the tabindex attribute is set');
         assert.strictEqual(main, document.activeElement, 'The main element is focused');
      });
   });

   describe('readPageTitle()', () => {
      it('should read the title of the document', () => {
         let stub = sinon
            .stub(webReader.speaker, 'speak')
            .returns(Promise.resolve());
         let promise = webReader.readPageTitle();

         return Promise.all([
            assert.instanceOf(promise, Promise, 'The value returned is a promise'),
            assert.isFulfilled(promise, 'The promise is fulfilled'),
            promise.then(() => {
               let promptedText = stub.args[0][0];

               assert.isTrue(stub.calledOnce, 'The speak method is called');
               assert.match(promptedText, new RegExp(document.title), 'The title of the document is read');

               stub.restore();
            })
         ]);
      });
   });

   describe('readPageSummary()', () => {
      it('should prompt the amount of headers and links', () => {
         let stub = sinon
            .stub(webReader.speaker, 'speak')
            .returns(Promise.resolve());
         let promise = webReader.readPageSummary();

         return Promise.all([
            assert.instanceOf(promise, Promise, 'The value returned is a promise'),
            assert.isFulfilled(promise, 'The promise is fulfilled'),
            promise.then(() => {
               let promptedText = stub.args[0][0];

               assert.isTrue(stub.calledOnce, 'The speak method is called');
               assert.match(promptedText, /\d+ header/, 'The number of headers is read');
               assert.match(promptedText, /\d+ links/, 'The number of links is read');

               stub.restore();
            })
         ]);
      });
   });

   describe('goToPreviousPage()', () => {
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

   describe('shortcuts', () => {
      before(() => {
         webReader.enableShortcuts();
      });

      after(() => {
         webReader.disableShortcuts();
      });

      describe('Toggle interaction', () => {
         let speakerStub, recognizerStub;

         before(() => {
            speakerStub = sinon
               .stub(webReader.speaker, 'speak')
               .returns(new Promise(resolve => {
                  setTimeout(resolve, METHODS_DELAY);
               }));
            recognizerStub = sinon
               .stub(webReader.recognizer, 'recognize')
               .returns(new Promise(resolve => {
                  setTimeout(() => resolve('search main content'), METHODS_DELAY);
               }));
         });

         beforeEach(() => {
            webReader.stopCommand();
         });

         afterEach(() => {
            speakerStub.reset();
            recognizerStub.reset();
         });

         after(() => {
            speakerStub.restore();
            recognizerStub.restore();
         });

         it('should start the interaction if none was in progress', () => {
            let spy = sinon.spy(webReader, 'receiveCommand');

            assert.isFalse(webReader.isInteracting(), 'No interaction is in progress');

            simulateToggleInteractionShortcut();

            assert.isTrue(spy.calledOnce, 'The receiveCommand method is called');
            assert.isTrue(webReader.isInteracting(), 'An interaction is in progress');

            let promise = spy.getCall(0).returnValue;

            spy.restore();

            return promise;
         });

         it('should stop the interaction if one was in progress', () => {
            let spy = sinon.spy(webReader, 'stopCommand');

            webReader.receiveCommand();

            assert.isTrue(webReader.isInteracting(), 'An interaction is in progress');

            simulateToggleInteractionShortcut();

            assert.isTrue(spy.calledOnce, 'The stopCommand method is called');
            assert.isFalse(webReader.isInteracting(), 'No interaction is in progress');

            spy.restore();
         });
      });
   });
});