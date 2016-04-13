import * as Commands from './commands';
import Dom from './dom/dom';
import Recognizer from './reader/recognizer';
import Router from './router';
import Speaker from './reader/speaker';
import EventEmitter from './helpers/event-emitter';
import Timer from './helpers/timer';
import WebReaderError from './webreader-error';
import defaultTranslation from '../lang/en-GB.json';

const defaultLanguage = 'en-GB';

/**
 * @typedef SettingsHash
 * @type {Object}
 * @property {number} [delay=300] The delay between each spoken text
 * @property {string} [translationsPath=''] The path to the translations folder
 * @property {Object} [recognizer] The settings for the speech recognition functionality
 * @property {string} [recognizer.lang='en-GB'] The language to use for the speech recognition functionality
 * @property {Object} [speaker] The settings for the speech synthesis functionality
 * @property {string} [speaker.lang='en-GB'] The language to use for the speech synthesis functionality
 * @property {string} [speaker.voice='Google UK English Female'] The voice to use for the synthesis recognition
 * functionality
 */

/**
 * The default values for the settings available
 *
 * @type {SettingsHash}
 */
const defaults = {
   delay: 300,
   translationsPath: '',
   recognizer: {
      lang: defaultLanguage
   },
   speaker: {
      lang: defaultLanguage,
      voice: 'Google UK English Female'
   }
};

const defaultState = {
   isInteracting: false,
   elements: null,
   currentIndex: -1
};

let eventListenersMap = new WeakMap();
let statusMap = new WeakMap();
let translations = new Map([[defaultLanguage, defaultTranslation]]);

/**
 * Downloads a translation for the commands available
 *
 * @param {string} translationsPath The path to the translations folder
 * @param {string} language The language to download
 *
 * @return {Promise}
 */
function downloadTranslation(translationsPath, language) {
   return window
      .fetch(`${translationsPath}/${language}.json`)
      .then(response => response.json())
      .then(response => {
         translations.set(language, response);

         return response;
      });
}

/**
 * Performs certain actions based on the shortcuts pressed by the user
 *
 * @param {WebReader} webReader An instance of WebReader
 * @param {Event} event An event
 */
function listenShortcuts(webReader, event) {
   if (
      event.ctrlKey === true &&
      (event.code && event.code === 'Space' || event.which === 32)
   ) {
      if (webReader.isInteracting()) {
         let state = statusMap.get(webReader);

         if (state.elements) {
            Dom.unhighlightElement(state.elements[state.currentIndex]);
         }

         webReader.stopCommand();
      } else {
         webReader.receiveCommand();
      }
   }
}

/**
 * The class representing the library
 *
 * @class
 */
export
   default class WebReader {
   /**
    * Creates an instance of WebReader
    *
    * @constructor
    *
    * @param {SettingsHash} [options={}] The options to customize WebReader
    */
   constructor(options = {}) {
      /**
       * @type {Object}
       */
      this.settings = Object.assign({}, defaults, options);
      /**
       *
       * @type {Recognizer}
       */
      this.recognizer = new Recognizer(this.settings.recognizer);
      /**
       *
       * @type {Speaker}
       */
      this.speaker = new Speaker(this.settings.speaker);

      statusMap.set(this, Object.assign({}, defaultState));
      eventListenersMap.set(this, new Map());

      let language = this.settings.recognizer.lang;

      if (language && !translations.has(language)) {
         downloadTranslation(this.settings.translationsPath, language)
            .then(
               () => {
                  let message = `Language "${language}" successfully loaded`;

                  console.debug(message);

                  EventEmitter.fireEvent(`${EventEmitter.namespace}.languagedownload`, document, {
                     data: {
                        lang: language
                     }
                  });

                  return this.speaker.speak(message);
               },
               err => {
                  console.debug(err.message);

                  EventEmitter.fireEvent(`${EventEmitter.namespace}.languageerror`, document, {
                     data: {
                        lang: language
                     }
                  });

                  return this.speaker.speak(`An error occurred: the language "${language}" was not loaded`);
               }
            );
      }
   }

   /**
    * Determines if WebReader is currently interacting with the user
    *
    * @return {boolean}
    */
   isInteracting() {
      return statusMap.get(this).isInteracting;
   }

   /**
    * Enables the keyboard shortcuts provided
    *
    * @return {WebReader}
    */
   enableShortcuts() {
      let eventListeners = eventListenersMap.get(this);

      eventListeners.set('keydown', listenShortcuts.bind(this, this));

      document.documentElement.addEventListener('keydown', eventListeners.get('keydown'));

      return this;
   }

   /**
    * Disables the keyboard shortcuts provided
    *
    * @return {WebReader}
    */
   disableShortcuts() {
      let eventListeners = eventListenersMap.get(this);

      document.documentElement.removeEventListener('keydown', eventListeners.get('keydown'));
      eventListeners.delete('keydown');

      return this;
   }

   /**
    * Starts the interaction with the user to receive a vocal command.
    * If a supported command is recognized, the required action is executed.
    *
    * @return {Promise}
    */
   receiveCommand() {
      statusMap.get(this).isInteracting = true;
      console.debug('Interaction started');

      EventEmitter.fireEvent(`${EventEmitter.namespace}.interactionstart`, document);

      return this.speaker
         .speak('Ready')
         .then(() => this.recognizer.recognize())
         .then(recognizedText => {
            let translation = translations.get(this.settings.recognizer.lang);

            return Commands.recognizeCommand(recognizedText, translation);
         })
         .then(recognizedCommand => Router.route(this, recognizedCommand))
         .catch(error => {
            if (error instanceof WebReaderError) {
               return this.speaker.speak(error.message);
            }

            if (error.error !== 'aborted' && error.error !== 'interrupted') {
               console.debug('An error occurred', error);

               statusMap.set(this, Object.assign({}, defaultState));

               return this.speaker.speak('Sorry, I could not recognize the command');
            }
         })
         .then(// Simulate an always() method
            () => {},
            () => {}
         )
         .then(() => {
            statusMap.get(this).isInteracting = false;
            console.debug('Interaction completed');

            EventEmitter.fireEvent(`${EventEmitter.namespace}.interactionend`, document);
         });
   }

   /**
    * Stops the interaction
    */
   stopCommand() {
      this.recognizer.abort();
      this.speaker.cancel();
      statusMap.get(this).isInteracting = false;
      console.debug('Interaction stopped');
   }

   /**
    * Reads all the headers of a page, optionally filtered
    *
    * @param {Object} [filters={}] The filters to apply
    * @param {number} [filters.level=-1] The level of the headers to read
    * (e.g. 1 means read all and only the H1 on the page).
    * If -1 is provided, all the headers are read
    *
    * @return {Promise}
    */
   readHeaders(filters = {}) {
      let headers = Dom.getHeaders(filters);
      let level = filters && filters.level ? filters.level : -1;

      statusMap.get(this).elements = headers;

      return headers.reduce((promise, header, index) => {
         promise = promise.then(() => {
            statusMap.get(this).currentIndex = index;
            Dom.highlightElement(header);

            return this.speaker
               .speak(header.textContent + (level !== -1 ? '' : ` ${header.nodeName}`))
               .then(() => Dom.unhighlightElement(header))
               .catch(error => {
                  Dom.unhighlightElement(header);

                  return Promise.reject(error);
               });
         });

         if (this.settings.delay > 0) {
            promise = promise.then(() => Timer.wait(this.settings.delay));
         }

         return promise;
      }, Promise.resolve());
   }

   /**
    * Reads again the last element processed
    *
    * @return {Promise}
    */
   readCurrentElement() {
      let state = statusMap.get(this);

      if (!state.elements) {
         return Promise.reject(new WebReaderError('There is not a current element to read'));
      }

      let element = state.elements[state.currentIndex];

      Dom.highlightElement(element);

      return this.speaker
         .speak(element.textContent)
         .then(() => Dom.unhighlightElement(element))
         .catch(error => {
            Dom.unhighlightElement(element);

            return Promise.reject(error);
         });
   }

   /**
    * Reads the previous element
    *
    * @return {Promise}
    */
   readPreviousElement() {
      let state = statusMap.get(this);

      if (state.currentIndex === 0) {
         return Promise.reject(new WebReaderError('The current element is the first'));
      }

      state.currentIndex--;

      return this.readCurrentElement();
   }

   /**
    * Reads the next element
    *
    * @return {Promise}
    */
   readNextElement() {
      let state = statusMap.get(this);

      if (state.currentIndex === state.elements.length - 1) {
         return Promise.reject(new WebReaderError('The current element is the last'));
      }

      state.currentIndex++;

      return this.readCurrentElement();
   }

   /**
    * Follows the last read link
    */
   goToLink() {
      let state = statusMap.get(this);
      let currentElement = state.elements ? state.elements[state.currentIndex] : null;

      if (!currentElement || currentElement.nodeName !== 'A') {
         return Promise.reject(new WebReaderError('There is not a current link to follow'));
      }

      window.location.assign(currentElement.href);
   }

   /**
    * Reads all the links of a page
    *
    * @param {Object} filters
    *
    * @return {Promise}
    */
   readLinks(filters) {
      let links = Dom.getLinks(filters);

      statusMap.get(this).elements = links;

      return links.reduce((promise, link, index) => {
         promise = promise.then(() => {
            statusMap.get(this).currentIndex = index;

            return this.readCurrentElement();
         });

         if (this.settings.delay > 0) {
            promise = promise.then(() => Timer.wait(this.settings.delay));
         }

         return promise;
      }, Promise.resolve());
   }

   /**
    * Reads the main element of the page
    *
    * @return {Promise}
    */
   readMain() {
      let main = Dom.getMain();
      let state = statusMap.get(this);

      state.elements = [main];
      state.currentIndex = 0;

      if (!main) {
         return Promise.reject(new WebReaderError('The main content of this page cannot be found'));
      }

      return this.speaker.speak(main.textContent);
   }

   /**
    * Searches the main content of the page. If the element is found, it is focused
    */
   searchMain() {
      let main = Dom.getMain();

      if (!main) {
         return Promise.reject(new WebReaderError('The main content of this page cannot be found'));
      }

      let oldTabIndex = main.getAttribute('tabindex');

      main.setAttribute('tabindex', -1);
      main.addEventListener('blur', function removeTabIndex() {
         main.removeEventListener('blur', removeTabIndex);

         // Restore tabindex's old value, if any
         if (oldTabIndex) {
            main.setAttribute('tabindex', oldTabIndex);
         } else {
            main.removeAttribute('tabindex');
         }
      });
      main.focus();
   }

   /**
    * Reads the title of a page, if present or not empty
    *
    * @return {Promise}
    */
   readPageTitle() {
      let title = Dom.getTitle();

      if (title) {
         return this.speaker.speak(`The title of the page is ${title}`);
      } else {
         return this.speaker.speak('This page does not have a title');
      }
   }

   /**
    * Reads a summary of the content of the page
    *
    * @return {Promise}
    */
   readPageSummary() {
      let headers = Dom.getHeaders();
      let links = Dom.getLinks();

      return this.speaker.speak(`The page contains ${headers.length} headers and ${links.length} links`);
   }

   /**
    * Goes to the previous page as specified by the browser's history
    */
   goToPreviousPage() {
      window.history.back();
   }

   /**
    * Goes to the next page as specified by the browser's history
    */
   goToNextPage() {
      window.history.forward();
   }

   /**
    * Goes to the homepage
    */
   goToHomepage() {
      window.location.assign('/');
   }
}