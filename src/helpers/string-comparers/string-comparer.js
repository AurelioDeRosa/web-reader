/**
 * An interface representing a string comparer
 *
 * @interface
 */
export
   default class StringComparer {
      /**
       * Finds the closest match of a string
       *
       * @abstract
       *
       * @param {(string|string[])} string The string or the array of strings to test
       * @param {string} target The string to test against
       *
       * @return {Object}
       */
      static findCloserMatch(string, target) {
         throw new Error(`The ${arguments.callee.name} function must be overridden`);
      }
   }
