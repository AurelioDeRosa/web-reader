import DamerauLevenshtein from 'damerau-levenshtein';

let translation = null;

/**
 * Finds the closest match of a string using the Damerau-Levenshtein algorithm
 *
 * @param {(string|string[])} string The string or the strings to test
 * @param {string} target The string to test against
 *
 * @return {Object}
 */
function findCloserMatch(string, target) {
   if (!Array.isArray(string)) {
      string = [string];
   }

   let damerauLevenshtein = DamerauLevenshtein(); // jshint ignore:line
   let minDistance = Number.POSITIVE_INFINITY;
   let i;

   for(i = 0; i < string.length; i++) {
      let distance = damerauLevenshtein(string[i], target);

      console.debug(`The distance between "${string[i]}" and "${target}" is ${distance}`);

      // If a perfect match is found, exit immediately
      if (distance === 0) {
         minDistance = distance;
         break;
      } else if (distance < minDistance) {
         minDistance = distance;
      }
   }

   return {
      index: i === string.length ? -1 : i,
      distance: minDistance
   };
}

/**
 * Extracts the heading level contained in the string provided.
 * If a perfect match is not found, the Damerau-Levenshtein algorithm
 * is used to find the closest match.
 *
 * @param {string} recognizedText The string to analyze
 *
 * @return {Object}
 */
function extractHeaderLevel(recognizedText) {
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
      let closerMatchIndex = findCloserMatch(headingLevels, recognizedText).index;

      data.level = closerMatchIndex === -1 ? -1 : closerMatchIndex + 1;
   }

   return data;
}

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
 *
 * @return {Object}
 */
function extractElementFromText(recognizedText) {
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
      let closerMatchIndex = findCloserMatch(variations, recognizedText);

      if (closerMatchIndex !== -1) {
         closerMatches.push(variations[closerMatchIndex]);
      }
   }

   // Find the closest match among the closest match
   return findCloserMatch(closerMatches, recognizedText);
}

/**
 * Extracts relevant data from a string, based on the recognized command
 *
 * @param {string} command The recognized command
 * @param {string} recognizedText The string from which the data are extracted
 *
 * @return {Object}
 */
function extractData(command, recognizedText) {
   let data = {};

   if (command === 'READ_LEVEL_HEADERS') {
      console.debug('Extracting header level from text');
      data = extractHeaderLevel(recognizedText);
   } else if (command === 'READ_LINKS_IN_ELEMENT') {
      console.debug('Extracting element from text');
      data = extractElementFromText(recognizedText);
   }

   return data;
}

/**
 * Detects the action to perform and extracts any relevant data
 * based on the string provided
 *
 * @param {string} recognizedText The string to analyze
 * @param {Object} currentTranslation The object containing the translation of the application
 *
 * @return {Object}
 */
export

 function recognizeCommand(recognizedText, currentTranslation) {
   let minDistance = Number.POSITIVE_INFINITY;
   let commands = currentTranslation.commands;
   let foundCommand;

   translation = currentTranslation;
   recognizedText = recognizedText.toLocaleLowerCase();

   console.debug('Command recognition started');

   for(let command in commands) {
      let closerMatch = findCloserMatch(
         [commands[command].text].concat(commands[command].variations),
         recognizedText
      );

      if (closerMatch.distance < minDistance) {
         foundCommand = Object.assign(
            {
               command: command
            },
            extractData(command, recognizedText)
         );

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