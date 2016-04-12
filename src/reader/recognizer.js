import EventEmitter from '../helpers/event-emitter';
import WebReaderError from '../webreader-error';

/**
 * Retrieves the object that allows to recognize the speech or
 * <code>null</code> if the feature is not supported
 *
 * @returns {SpeechRecognition|null}
 */
function getRecognizer() {
   return window.SpeechRecognition ||
          window.webkitSpeechRecognition ||
          null;
}

function bindEvents(recognizer, eventsHash) {
   for (let eventName in eventsHash) {
      recognizer.addEventListener(eventName, eventsHash[eventName]);
   }
}

function unbindEvents(recognizer, eventsHash) {
   for (let eventName in eventsHash) {
      recognizer.removeEventListener(eventName, eventsHash[eventName]);
   }
}

/**
 * The class exposing the reading features of a web page
 *
 * @class
 */
export default class Recognizer {
   /**
    * Creates a Recognizer instance
    *
    * @constructor
    *
    * @param {Object} [options={}] The options to customize the settings of the recognizer
    */
   constructor(options={}) {
      let Recognizer = getRecognizer();

      if (!Recognizer) {
         throw Error('API not supported');
      }

      /**
       *
       * @type {SpeechRecognition}
       */
      this.recognizer = new Recognizer();

      for(let key in options) {
         if (options.hasOwnProperty(key) && this.recognizer[key] !== undefined) {
            this.recognizer[key] = options[key];
         }
      }
   }

   /**
    * Detects if the recognition feature is supported
    *
    * @returns {boolean}
    */
   static isSupported() {
      return !!getRecognizer();
   }

   /**
    * Starts the recognition of the speech
    *
    * @returns {Promise}
    */
   recognize() {
      return new Promise((resolve, reject) => {
         let recognizer = this.recognizer;
         let eventsHash = {
            audiostart: () => {
               EventEmitter.fireEvent(`${EventEmitter.namespace}.recognitionstart`, document);
            },
            result: event => {
               for (let i = event.resultIndex; i < event.results.length; i++) {
                  if (event.results[i].isFinal) {
                     let bestGuess = event.results[i][0];

                     console.debug('Recognition completed');
                     console.debug(`Recognized "${bestGuess.transcript}" with a confidence of ${bestGuess.confidence}`);

                     EventEmitter.fireEvent(`${EventEmitter.namespace}.recognitionresult`, document, {
                        data: {
                           result: bestGuess
                        }
                     });

                     resolve(bestGuess.transcript);
                  }
               }
            },
            error: event => {
               console.debug('Recognition error:', event.error);

               EventEmitter.fireEvent(`${EventEmitter.namespace}.recognitionerror`, document, {
                  error: event.error
               });

               reject(new WebReaderError('An error has occurred while recognizing your speech'));
            },
            noMatch: () => {
               console.debug('Recognition ended because of nomatch');

               EventEmitter.fireEvent(`${EventEmitter.namespace}.recognitionnomatch`, document);

               reject(new WebReaderError('Sorry, I could not find a match'));
            },
            end: () => {
               console.debug('Recognition ended');

               EventEmitter.fireEvent(`${EventEmitter.namespace}.recognitionend`, document);

               unbindEvents(recognizer, eventsHash);

               // If the Promise isn't resolved or rejected at this point
               // the demo is running on Chrome and Windows 8.1 (issue #428873).
               reject(new WebReaderError('Sorry, I could not recognize your speech'));
            }
         };

         bindEvents(this.recognizer, eventsHash);

         console.debug('Recognition started');
         this.recognizer.start();
      });
   }

   /**
    * Stops listening and recognizing the speech of the user
    */
   abort() {
      this.recognizer.abort();
   }
}