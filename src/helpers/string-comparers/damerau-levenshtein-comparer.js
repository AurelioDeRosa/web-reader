import DamerauLevenshtein from 'damerau-levenshtein';
import StringComparer from './string-comparer';

/**
 * The class representing a comparer using the Damerau-Levenshtein algorithm
 *
 * @class
 */
export
   default class DamerauLevenshteinComparer extends StringComparer {
   /**
    * Finds the closest match of a string using the Damerau-Levenshtein algorithm
    *
    * @param {(string|string[])} string The string or the array of strings to test
    * @param {string} target The string to test against
    *
    * @return {Object}
    */
   static findCloserMatch(string, target) {
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
}