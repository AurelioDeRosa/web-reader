import StringComparer from './helpers/string-comparers/string-comparer';

/**
 * The translation currently in use
 *
 * @type {Object}
 */
let translation = null;

/**
 * @typedef CommandsHash
 * @type {Object}
 * @property {string} command The command recognized
 * @property {string} [translationsPath=''] The path to the translations folder
 * @property {Object} [recognizer] The settings for the speech recognition functionality
 */

/**
 * Extracts the heading level contained in the string provided.
 * If a perfect match is not found, the Damerau-Levenshtein algorithm
 * is used to find the closest match.
 *
 * @param {StringComparer} StringComparer The comparer to use for comparing strings
 * @param {string} recognizedText The string to analyze
 *
 * @return {Object}
 */
function extractHeaderLevel(StringComparer, recognizedText) {
   const headingLevels = translation.commands.READ_LEVEL_HEADERS.levels;
   let data = {};

   for(let i = 0; i < headingLevels.length; i++) {
      let regexp = new RegExp(`(^|\\b)(${i + 1}|h${i + 1}|${headingLevels[i]})(\\b|$)`, 'i');

      if (regexp.test(recognizedText)) {
         data.level = i + 1;
         break;
      }
   }

   // If the header level has not been found yet,
   // let's try a more heuristic strategy
   if (!data.level) {
      let closerMatchIndex = StringComparer.findCloserMatch(headingLevels, recognizedText).index;

      data.level = closerMatchIndex === -1 ? -1 : closerMatchIndex + 1;
   }

   return data;
}

/**
 * Searches an element type, such as <code>main</code> or <code>footer</code>,
 * in the text provided. If none is found, <code>null</code> is returned
 *
 * @param {string} recognizedText The string to analyze
 *
 * @return {HTMLElement|null}
 */
function findElementInText(recognizedText) {
   let elements = translation.elements;
   let foundElement = null;

   for(let key in elements) {
      let variations = elements[key].variations.join('|');
      let regexp = new RegExp(`(^|\\b)(${variations})(\\b|$)`, 'i');

      if (regexp.test(recognizedText)) {
         foundElement = document.querySelector(elements[key].selector);
         break;
      }
   }

   return foundElement;
}
/**
 * Searches an element type, such as <code>main</code> or <code>footer</code>,
 * in the text provided. If none is found, the closest match is re is returned
 *
 * @param {StringComparer} StringComparer The comparer to use for comparing strings
 * @param {string} recognizedText The string to analyze
 *
 * @return {Object}
 */
function extractElementFromText(StringComparer, recognizedText) {
   let foundElement = findElementInText(recognizedText);

   if (foundElement) {
      return {
         element: foundElement
      };
   }

   // Collects the closer match for each element.
   let closerMatches = [];
   let elements = translation.elements;

   // If the element has not been found yet,
   // let's try a more heuristic strategy
   for(let key in elements) {
      let variations = elements[key].variations;
      let closerMatchIndex = StringComparer.findCloserMatch(variations, recognizedText);

      if (closerMatchIndex !== -1) {
         closerMatches.push(variations[closerMatchIndex]);
      }
   }

   // Find the closest match among the closest match
   let closestMatch = StringComparer.findCloserMatch(closerMatches, recognizedText);

   return {
      element: closestMatch.index >= 0 ? closerMatches[closestMatch.index] : null
   };
}

/**
 * Extracts relevant data from a string, based on the recognized command
 *
 * @param {StringComparer} StringComparer The comparer to use for comparing strings
 * @param {string} command The recognized command
 * @param {string} recognizedText The string from which the data are extracted
 *
 * @return {Object}
 */
function extractData(StringComparer, command, recognizedText) {
   let data = {};

   if (command === 'READ_LEVEL_HEADERS') {
      console.debug('Extracting header level from text');
      data = extractHeaderLevel(StringComparer, recognizedText);
   } else if (command === 'READ_LINKS_IN_ELEMENT') {
      console.debug('Extracting element from text');
      data = extractElementFromText(StringComparer, recognizedText);
   }

   return data;
}

/**
 * The class responsible for the commands
 *
 * @class
 */
export
   default class Commands {
   /**
    * Creates an instance of Commands
    *
    * @constructor
    *
    * @param {StringComparer} Comparer The class representing the strategy to adopt to compare strings
    */
   constructor(Comparer) {
      if (typeof Comparer !== 'function' || !(Comparer.prototype instanceof StringComparer)) {
         throw new TypeError(`${arguments[0]} is not an instance of StringComparer`);
      }

      Object.defineProperty(this, 'StringComparer', {
         enumerable: false,
         configurable: false,
         get: function() {
            return Comparer;
         }
      });
   }

   /**
    * Detects the action to perform and extracts any relevant data
    * based on the string provided
    *
    * @param {string} recognizedText The string to analyze
    * @param {Object} currentTranslation The object containing the translation of the application
    *
    * @return {CommandsHash}
    */
   recognizeCommand(recognizedText, currentTranslation) {
      let minDistance = Number.POSITIVE_INFINITY;
      let commands = currentTranslation.commands;
      let foundCommand;

      translation = currentTranslation;
      recognizedText = recognizedText.toLocaleLowerCase();

      console.debug('Command recognition started');

      for(let command in commands) {
         let closerMatch = this.StringComparer.findCloserMatch(
            [commands[command].text].concat(commands[command].variations),
            recognizedText
         );

         if (closerMatch.distance < minDistance) {
            foundCommand = Object.assign({
               command
            }, extractData(this.StringComparer, command, recognizedText));

            if (closerMatch.distance === 0) {
               break;
            } else {
               minDistance = closerMatch.distance;
            }
         }
      }

      console.debug(`Command recognition ended. Found command "${commands[foundCommand.command].text}"`);
      console.debug('Extrapolated data:', foundCommand);

      return foundCommand;
   }
}