import WebReader from '../../src/main';
import WebReaderError from '../../src/webreader-error';
import EventEmitter from '../../src/helpers/event-emitter';

let shortcuts = {
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
   EventEmitter.fireEvent('keydown', document.documentElement, shortcuts.toggleInteraction.reverse()[0]);
}

describe('WebReader', function() {
   const webReader = new WebReader({
      delay: 0
   });

   before(function() {
      fixture.setBase('test/fixtures');
   });

   beforeEach(function() {
      fixture.load('page.html');
   });

   afterEach(function() {
      fixture.cleanup();
   });

   describe('constructor()', function() {
      let webReader = new WebReader();

      it('should crate an instance of WebReader', function() {
         assert.instanceOf(webReader, WebReader, 'The returned object is an instance of WebReader');
         assert.isObject(webReader.settings, 'The settings are exposed');
         assert.isObject(webReader.recognizer, 'The recognizer object is exposed');
         assert.isObject(webReader.speaker, 'The speaker object is exposed');
      });

      it('should use the default settings when custom options are not provided', function() {
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

   describe('isInteracting()', function() {
      it('should return true if WebReader is interacting', function() {
         let speakerStub = sinon
            .stub(webReader.speaker, 'speak')
            .returns(Promise.resolve());
         let recognizerStub = sinon
            .stub(webReader.recognizer, 'recognize')
            .returns(Promise.resolve('search main content'));
         let promise = webReader.receiveCommand();

         assert.isTrue(webReader.isInteracting(), 'The returned value is correct');

         return promise.then(() => {
            speakerStub.restore();
            recognizerStub.restore();
         });
      });

      it('should return false if WebReader is not interacting', function() {
         webReader.stopCommand();

         assert.isFalse(webReader.isInteracting(), 'The returned value is correct');
      });
   });

   describe('enableShortcuts()', function() {
      afterEach(function() {
         webReader.disableShortcuts();
      });

      it('should return the current instance of WebReader is returned', function() {
         assert.strictEqual(webReader, webReader.enableShortcuts(), 'The instance is returned');
      });

      it('should enable the shortcuts', function() {
         let stub = sinon.stub(webReader, 'receiveCommand');

         webReader.enableShortcuts();

         simulateToggleInteractionShortcut();

         assert.isTrue(stub.calledOnce, 'The shortcut to activate WebReader is enabled');

         stub.restore();
      });
   });

   describe('disableShortcuts()', function() {
      beforeEach(function() {
         webReader.enableShortcuts();
      });

      it('should return the current instance of WebReader is returned', function() {
         assert.strictEqual(webReader, webReader.disableShortcuts(), 'The instance is returned');
      });

      it('should disable the shortcuts', function() {
         let stub = sinon.stub(webReader, 'receiveCommand');

         webReader.disableShortcuts();

         simulateToggleInteractionShortcut();

         assert.isTrue(stub.notCalled, 'The shortcut to activate WebReader is disabled');

         stub.restore();
      });
   });

   describe('stopCommand()', function() {
      let speakerStub, recognizerStub;

      before(function() {
         speakerStub = sinon
            .stub(webReader.speaker, 'speak')
            .returns(Promise.resolve());
         recognizerStub = sinon
            .stub(webReader.recognizer, 'recognize')
            .returns(Promise.resolve('search main content'));
      });

      beforeEach(function() {
         webReader.receiveCommand();
      });

      afterEach(function() {
         speakerStub.reset();
         recognizerStub.reset();
      });

      after(function() {
         speakerStub.restore();
         recognizerStub.restore();
      });

      it('should stop an interaction', function() {
         let speakerSpy = sinon.spy(webReader.speaker, 'cancel');
         let recognizerSpy = sinon.spy(webReader.recognizer, 'abort');

         assert.isTrue(webReader.isInteracting(), 'An interaction is in progress');

         webReader.stopCommand();

         assert.isTrue(speakerSpy.calledOnce, 'The speaker is stopped');
         assert.isTrue(recognizerSpy.calledOnce, 'The recognizer is stopped');
         assert.isFalse(webReader.isInteracting(), 'No interaction is in progress');

         webReader.speaker.cancel.restore();
         webReader.recognizer.abort.restore();
      });
   });

   describe('readHeaders()', function() {
      let stub;

      before(function() {
         stub = sinon
            .stub(webReader.speaker, 'speak')
            .returns(Promise.resolve());
      });

      afterEach(function() {
         stub.reset();
      });

      after(function() {
         stub.restore();
      });

      context('with no parameters provided', function() {
         it('should read all the headers', function() {
            let promise = webReader.readHeaders();

            return Promise.all([
               assert.instanceOf(promise, Promise, 'The value returned is a promise'),
               assert.isFulfilled(promise, 'The promise is fulfilled'),
               promise.then(() => {
                  let headers = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));

                  headers.forEach((header, index) => {
                     assert.isTrue(
                        stub.getCall(index).calledWithExactly(`${header.textContent} ${header.nodeName}`),
                        'The prompted text is correct'
                     );
                  });
               })
            ]);
         });
      });

      context('with parameters provided', function() {
         it('should read all the headers of the specified level', function() {
            let promise = webReader.readHeaders({
               level: 2
            });

            return Promise.all([
               assert.instanceOf(promise, Promise, 'The value returned is a promise'),
               assert.isFulfilled(promise, 'The promise is fulfilled'),
               promise.then(() => {
                  let headers = Array.from(document.querySelectorAll('h2'));

                  headers.forEach((header, index) => {
                     assert.isTrue(
                        stub.getCall(index).calledWithExactly(header.textContent),
                        'The prompted text is correct'
                     );
                  });
               })
            ]);
         });
      });
   });

   describe('readCurrentElement()', function() {
      context('without a previous interaction', function() {
         let webReader;

         before(function() {
            webReader = new WebReader();
         });

         it('should return a rejected promise', function() {
            return assert.isRejected(webReader.readCurrentElement(), WebReaderError, 'Promise is rejected');
         });
      });

      context('with a previously recognized command of a set of elements', function() {
         let stub;

         before(function() {
            stub = sinon
               .stub(webReader.speaker, 'speak')
               .returns(Promise.resolve());
         });

         beforeEach(function() {
            return webReader.readLinks();
         });

         afterEach(function() {
            stub.reset();
         });

         after(function() {
            stub.restore();
         });

         it('should read again the last spoken element', function() {
            let promise = webReader.readCurrentElement();

            return Promise.all([
               assert.instanceOf(promise, Promise, 'The value returned is a promise'),
               assert.isFulfilled(promise, 'The promise is fulfilled'),
               promise.then(() => {
                  assert.deepEqual(
                     stub.getCall(stub.callCount - 2).args,
                     stub.lastCall.args,
                     'The prompted text is correct'
                  );
               })
            ]);
         });
      });

      context('with a previously recognized command of a single of element', function() {
         let stub;

         before(function() {
            stub = sinon
               .stub(webReader.speaker, 'speak')
               .returns(Promise.resolve());
         });

         beforeEach(function() {
            return webReader.readMain();
         });

         afterEach(function() {
            stub.reset();
         });

         after(function() {
            stub.restore();
         });

         it('should read again the element', function() {
            let promise = webReader.readCurrentElement();

            return Promise.all([
               assert.instanceOf(promise, Promise, 'The value returned is a promise'),
               assert.isFulfilled(promise, 'The promise is fulfilled'),
               promise.then(() => {
                  let main = document.querySelector('main');

                  assert.isTrue(stub.alwaysCalledWithExactly(main.textContent), 'The prompted text is correct');
               })
            ]);
         });
      });

      context('with a previously recognized command that does not involve a spoken prompt', function() {
         beforeEach(function() {
            webReader.searchMain();
         });

         it('should return a rejected promise', function() {
            return assert.isRejected(webReader.readCurrentElement(), WebReaderError, 'Promise is rejected');
         });
      });

      context('with a previously unrecognized command', function() {
         let speakerStub, recognizerStub;

         before(function() {
            speakerStub = sinon
               .stub(webReader.speaker, 'speak')
               .returns(Promise.resolve());
            recognizerStub = sinon
               .stub(webReader.recognizer, 'recognize')
               .returns(Promise.reject({
                  error: 'interrupted'
               }));
         });

         beforeEach(function() {
            return webReader.receiveCommand();
         });

         afterEach(function() {
            speakerStub.reset();
            recognizerStub.reset();
         });

         after(function() {
            speakerStub.restore();
            recognizerStub.restore();
         });

         it('should return a rejected promise', function() {
            return assert.isRejected(webReader.readCurrentElement(), WebReaderError, 'Promise is rejected');
         });
      });
   });

   describe('goToLink()', function() {
      context('without a previously spoken element', function() {
         let webReader;

         before(function() {
            webReader = new WebReader();
         });

         it('should thrown an expection', function() {
            assert.throws(() => {
               webReader.goToLink();
            }, WebReaderError);
         });
      });

      context('with the last spoken element being a link', function() {
         it('should navigate to the page specified by the href attribute of the link');
      });

      context('with the last spoken element different from a link', function() {
         let stub;

         before(function() {
            stub = sinon
               .stub(webReader.speaker, 'speak')
               .returns(Promise.resolve());
         });

         beforeEach(function() {
            return webReader.readMain();
         });

         afterEach(function() {
            stub.reset();
         });

         after(function() {
            stub.restore();
         });

         it('should thrown an exception', function() {
            assert.throws(() => {
               webReader.goToLink();
            }, WebReaderError);
         });
      });
   });

   describe('readLinks()', function() {
      let stub;

      before(function() {
         stub = sinon
            .stub(webReader.speaker, 'speak')
            .returns(Promise.resolve());
      });

      afterEach(function() {
         stub.reset();
      });

      after(function() {
         stub.restore();
      });

      context('with no parameters provided', function() {
         it('should read all the links', function() {
            let promise = webReader.readLinks();

            return Promise.all([
               assert.instanceOf(promise, Promise, 'The value returned is a promise'),
               assert.isFulfilled(promise, 'The promise is fulfilled'),
               promise.then(() => {
                  let links = Array.from(document.querySelectorAll('a.target'));

                  links.forEach((link, index) => {
                     assert.isTrue(
                        stub.getCall(index).calledWithExactly(link.textContent),
                        'The prompted text is correct'
                     );
                  });
               })
            ]);
         });
      });

      context('with parameters provided', function() {
         it('should read all the headers with the specified ancestor', function() {
            let promise = webReader.readLinks({
               ancestor: document.querySelector('footer')
            });

            return Promise.all([
               assert.instanceOf(promise, Promise, 'The value returned is a promise'),
               assert.isFulfilled(promise, 'The promise is fulfilled'),
               promise.then(() => {
                  let links = Array.from(document.querySelectorAll('footer a.target'));

                  links.forEach((link, index) => {
                     assert.isTrue(
                        stub.getCall(index).calledWithExactly(link.textContent),
                        'The prompted text is correct'
                     );
                  });
               })
            ]);
         });
      });
   });

   describe('readMain()', function() {
      it('should read the content of the main element', function() {
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

   describe('searchMain()', function() {
      it('should focus the main element', function() {
         let main = document.querySelector('main');

         webReader.searchMain();

         assert.strictEqual(main.getAttribute('tabindex'), '-1', 'The value for the tabindex attribute is set');
         assert.strictEqual(main, document.activeElement, 'The main element is focused');
      });
   });

   describe('readPageTitle()', function() {
      it('should read the title of the document', function() {
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

   describe('readPageSummary()', function() {
      it('should prompt the amount of headers and links', function() {
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

   describe('goToPreviousPage()', function() {
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

      it('should fail if the current page is the first in the history', function() {
         return assert.isRejected(webReader.goToPreviousPage(), WebReaderError, 'Promise is rejected');
      });

      it('should change URL if there is a previous page', function() {
         let initialUrl = window.location.toString();

         window.history.pushState({}, 'test', '#prev-page');

         return webReader
            .goToPreviousPage()
            .then(() => assert.strictEqual(window.location.toString(), initialUrl, 'The URL is changed'));
      });
   });

   describe('goToNextPage()', function() {
      before(function() {
         // Resets the history ahead of the current page
         window.history.pushState({}, 'test', '#next-page');
      });

      it('should fail if the current page is the last in the history', function() {
         return assert.isRejected(webReader.goToNextPage(), WebReaderError, 'Promise is rejected');
      });

      it('should change URL if there is a next page', function() {
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

   describe('shortcuts', function() {
      before(function() {
         webReader.enableShortcuts();
      });

      after(function() {
         webReader.disableShortcuts();
      });

      describe('Toggle interaction', function() {
         let speakerStub, recognizerStub;

         before(function() {
            speakerStub = sinon
               .stub(webReader.speaker, 'speak')
               .returns(Promise.resolve());
            recognizerStub = sinon
               .stub(webReader.recognizer, 'recognize')
               .returns(Promise.reject({
                  error: 'interrupted'
               }));
         });

         beforeEach(function() {
            webReader.stopCommand();
         });

         afterEach(function() {
            speakerStub.reset();
            recognizerStub.reset();
         });

         after(function() {
            speakerStub.restore();
            recognizerStub.restore();
         });

         it('should start the interaction if none was in progress', function() {
            let spy = sinon.spy(webReader, 'receiveCommand');

            assert.isFalse(webReader.isInteracting(), 'No interaction is in progress');

            simulateToggleInteractionShortcut();

            assert.isTrue(spy.calledOnce, 'The receiveCommand method is called');
            assert.isTrue(webReader.isInteracting(), 'An interaction is in progress');

            let promise = spy.getCall(0).returnValue;

            webReader.receiveCommand.restore();

            return promise;
         });

         it('should stop the interaction if one was in progress', function() {
            let spy = sinon.spy(webReader, 'stopCommand');
            let promise = webReader.receiveCommand();

            assert.isTrue(webReader.isInteracting(), 'An interaction is in progress');

            simulateToggleInteractionShortcut();

            assert.isTrue(spy.calledOnce, 'The stopCommand method is called');
            assert.isFalse(webReader.isInteracting(), 'No interaction is in progress');

            webReader.stopCommand.restore();

            return promise;
         });
      });
   });
});