(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.WebReader = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports={
   "commands": {
      "READ_ALL_HEADERS": {
         "text": "read all headers",
         "variations": [
            "read headers",
            "read all the headers"
         ]
      },
      "READ_ALL_LINKS": {
         "text": "read all links",
         "variations": [
            "read links",
            "read all the links"
         ]
      },
      "READ_LEVEL_HEADERS": {
         "text": "read all h",
         "variations": [
            "read h",
            "read all the h"
         ],
         "levels": [
            "one",
            "two",
            "three",
            "four",
            "five",
            "six"
         ]
      },
      "READ_MAIN": {
         "text": "read main content",
         "variations": [
            "read the main",
            "read the main content"
         ]
      },
      "SEARCH_MAIN": {
         "text": "search main content",
         "variations": [
            "search the main",
            "search the main content",
            "find main content",
            "find the main",
            "find the main content"
         ]
      },
      "READ_AGAIN": {
         "text": "read element again",
         "variations": [
            "read the current element again",
            "read again"
         ]
      },
      "READ_PREVIOUS": {
         "text": "read previous element",
         "variations": [
            "read previous"
         ]
      },
      "READ_NEXT": {
         "text": "read next element",
         "variations": [
            "read next"
         ]
      },
      "READ_PAGE_TITLE": {
         "text": "read page title",
         "variations": [
            "read title",
            "read the title of the page",
            "read document title"
         ]
      },
      "READ_LINKS_IN_ELEMENT": {
         "text": "read links inside",
         "variations": [
            "read links contained",
            "read links contained in",
            "read all links inside",
            "read all links contained",
            "read all links contained in"
         ]
      },
      "GO_TO_PREVIOUS_PAGE": {
         "text": "previous page",
         "variations": [
            "go to previous page"
         ]
      },
      "GO_TO_NEXT_PAGE": {
         "text": "next page",
         "variations": [
            "go to next page"
         ]
      },
      "READ_PAGE_SUMMARY": {
         "text": "read page summary",
         "variations": [
            "summarize page",
            "summarize the page"
         ]
      },
      "GO_TO_HOMEPAGE": {
         "text": "homepage",
         "variations": [
            "go to homepage"
         ]
      },
      "GO_TO_LINK": {
         "text": "go to link",
         "variations": [
            "follow link",
            "go",
            "go there"
         ]
      }
   },
   "elements": {
      "MAIN": {
         "selector": "main",
         "variations": [
            "main"
         ]
      },
      "NAV": {
         "selector": "nav",
         "variations": [
            "nav",
            "navigation",
            "menu"
         ]
      },
      "HEADER": {
         "selector": "header",
         "variations": [
            "header"
         ]
      },
      "FOOTER": {
         "selector": "footer",
         "variations": [
            "footer"
         ]
      }
   }
}
},{}],2:[function(require,module,exports){
function DamerauLevenshtein (prices, damerau) {
    // 'prices' customisation of the edit costs by passing an
    // object with optional 'insert', 'remove', 'substitute', and
    // 'transpose' keys, corresponding to either a constant
    // number, or a function that returns the cost. The default
    // cost for each operation is 1. The price functions take
    // relevant character(s) as arguments, should return numbers,
    // and have the following form:
    //
    // insert: function (inserted) { return NUMBER; }
    //
    // remove: function (removed) { return NUMBER; }
    //
    // substitute: function (from, to) { return NUMBER; }
    //
    // transpose: function (backward, forward) { return NUMBER; }
    //
    // The damerau flag allows us to turn off transposition and
    // only do plain Levenshtein distance.

    if (damerau !== false) damerau = true;
    if (!prices) prices = {};
    var insert, remove, substitute, transpose;

    switch (typeof prices.insert) {
    case 'function': insert = prices.insert; break;
    case 'number': insert = function (c) { return prices.insert; }; break;
    default: insert = function (c) { return 1; }; break; }

    switch (typeof prices.remove) {
    case 'function': remove = prices.remove; break;
    case 'number': remove = function (c) { return prices.remove; }; break;
    default: remove = function (c) { return 1; }; break; }

    switch (typeof prices.substitute) {
    case 'function': substitute = prices.substitute; break;
    case 'number':
        substitute = function (from, to) { return prices.substitute; };
        break;
    default: substitute = function (from, to) { return 1; }; break; }

    switch (typeof prices.transpose) {
    case 'function': transpose = prices.transpose; break;
    case 'number':
        transpose = function (backward, forward) { return prices.transpose; };
        break;
    default: transpose = function (backward, forward) { return 1; }; break; }

    function distance(down, across) {
        // http://en.wikipedia.org/wiki/Damerau%E2%80%93Levenshtein_distance
        var ds = [];
        if ( down === across ) {
            return 0;
        } else {
            down = down.split(''); down.unshift(null);
            across = across.split(''); across.unshift(null);
            down.forEach(function (d, i) {
                if (!ds[i]) ds[i] = [];
                across.forEach(function (a, j) {
                    if (i === 0 && j === 0) ds[i][j] = 0;
                    // Empty down (i == 0) -> across[1..j] by inserting
                    else if (i === 0) ds[i][j] = ds[i][j-1] + insert(a);
                    // Down -> empty across (j == 0) by deleting
                    else if (j === 0) ds[i][j] = ds[i-1][j] + remove(d);
                    else {
                        // Find the least costly operation that turns
                        // the prefix down[1..i] into the prefix
                        // across[1..j] using already calculated costs
                        // for getting to shorter matches.
                        ds[i][j] = Math.min(
                            // Cost of editing down[1..i-1] to
                            // across[1..j] plus cost of deleting
                            // down[i] to get to down[1..i-1].
                            ds[i-1][j] + remove(d),
                            // Cost of editing down[1..i] to
                            // across[1..j-1] plus cost of inserting
                            // across[j] to get to across[1..j].
                            ds[i][j-1] + insert(a),
                            // Cost of editing down[1..i-1] to
                            // across[1..j-1] plus cost of
                            // substituting down[i] (d) with across[j]
                            // (a) to get to across[1..j].
                            ds[i-1][j-1] + (d === a ? 0 : substitute(d, a))
                        );
                        // Can we match the last two letters of down
                        // with across by transposing them? Cost of
                        // getting from down[i-2] to across[j-2] plus
                        // cost of moving down[i-1] forward and
                        // down[i] backward to match across[j-1..j].
                        if (damerau
                            && i > 1 && j > 1
                            && down[i-1] === a && d === across[j-1]) {
                            ds[i][j] = Math.min(
                                ds[i][j],
                                ds[i-2][j-2] + (d === a ? 0 : transpose(d, down[i-1]))
                            );
                        };
                    };
                });
            });
            return ds[down.length-1][across.length-1];
        };
    };
    return distance;
};

module.exports = DamerauLevenshtein;

},{}],3:[function(require,module,exports){
(function (global, factory) {
   if (typeof define === "function" && define.amd) {
      define('WebReader', ['module', 'exports', './helpers/string-comparers/string-comparer'], factory);
   } else if (typeof exports !== "undefined") {
      factory(module, exports, require('./helpers/string-comparers/string-comparer'));
   } else {
      var mod = {
         exports: {}
      };
      factory(mod, mod.exports, global.stringComparer);
      global.WebReader = mod.exports;
   }
})(this, function (module, exports, _stringComparer) {
   'use strict';

   Object.defineProperty(exports, "__esModule", {
      value: true
   });

   var _stringComparer2 = _interopRequireDefault(_stringComparer);

   function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
         default: obj
      };
   }

   function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
         throw new TypeError("Cannot call a class as a function");
      }
   }

   var _createClass = function () {
      function defineProperties(target, props) {
         for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
         }
      }

      return function (Constructor, protoProps, staticProps) {
         if (protoProps) defineProperties(Constructor.prototype, protoProps);
         if (staticProps) defineProperties(Constructor, staticProps);
         return Constructor;
      };
   }();

   /**
    * The translation currently in use
    *
    * @type {Object}
    */
   var translation = null;

   /**
    * @typedef CommandsHash
    * @type {Object}
    * @property {string} command The command recognized
    * @property {string} [translationsPath=''] The path to the translations folder
    * @property {Object} [recognizer] The settings for the speech recognition functionality
    */

   /**
    * Extracts the heading level contained in the string provided.
    * If a perfect match is not found, a string comparison algorithm
    * is used to find the closest match.
    *
    * @param {StringComparer} StringComparer The comparer to use for comparing strings
    * @param {string} recognizedText The string to analyze
    *
    * @return {Object}
    */
   function extractHeaderLevel(StringComparer, recognizedText) {
      var headingLevels = translation.commands.READ_LEVEL_HEADERS.levels;
      var data = {};

      for (var i = 0; i < headingLevels.length; i++) {
         var regexp = new RegExp('(^|\\b)(' + (i + 1) + '|h' + (i + 1) + '|' + headingLevels[i] + ')(\\b|$)', 'i');

         if (regexp.test(recognizedText)) {
            data.level = i + 1;
            break;
         }
      }

      // If the header level has not been found yet,
      // let's try a more heuristic strategy
      if (!data.level) {
         var closerMatchIndex = StringComparer.findCloserMatch(headingLevels, recognizedText).index;

         data.level = closerMatchIndex + 1;
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
      var elements = translation.elements;
      var foundElement = null;

      for (var key in elements) {
         var variations = elements[key].variations.join('|');
         var regexp = new RegExp('(^|\\b)(' + variations + ')(\\b|$)', 'i');

         if (regexp.test(recognizedText)) {
            foundElement = document.querySelector(elements[key].selector);
            break;
         }
      }

      return foundElement;
   }
   /**
    * Searches an element type, such as <code>main</code> or <code>footer</code>,
    * in the text provided. If none is found, the closest match is returned
    *
    * @param {StringComparer} StringComparer The comparer to use for comparing strings
    * @param {string} recognizedText The string to analyze
    *
    * @return {Object}
    */
   function extractElementFromText(StringComparer, recognizedText) {
      var foundElement = findElementInText(recognizedText);

      if (foundElement) {
         return {
            element: foundElement
         };
      }

      // Collects the closer match for each element.
      var closerMatches = [];
      var elements = translation.elements;

      // If the element has not been found yet,
      // let's try a more heuristic strategy
      for (var key in elements) {
         var variations = elements[key].variations;
         var closerMatchIndex = StringComparer.findCloserMatch(variations, recognizedText).index;

         closerMatches.push(variations[closerMatchIndex]);
      }

      // Find the closest match among the closest match
      var closestMatch = StringComparer.findCloserMatch(closerMatches, recognizedText);

      return {
         element: document.querySelector(closerMatches[closestMatch.index])
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
      var data = {};

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

   var Commands = function () {
      /**
       * Creates an instance of Commands
       *
       * @constructor
       *
       * @param {StringComparer} Comparer The class representing the strategy to adopt to compare strings
       */

      function Commands(Comparer) {
         _classCallCheck(this, Commands);

         if (typeof Comparer !== 'function' || !(Comparer.prototype instanceof _stringComparer2.default)) {
            throw new TypeError(arguments[0] + ' is not an instance of StringComparer');
         }

         Object.defineProperty(this, 'StringComparer', {
            enumerable: false,
            configurable: false,
            get: function get() {
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


      _createClass(Commands, [{
         key: 'recognizeCommand',
         value: function recognizeCommand(recognizedText, currentTranslation) {
            var minDistance = Number.POSITIVE_INFINITY;
            var commands = currentTranslation.commands;
            var foundCommand = void 0;

            translation = currentTranslation;
            recognizedText = recognizedText.toLocaleLowerCase();

            console.debug('Command recognition started');

            for (var command in commands) {
               var closerMatch = this.StringComparer.findCloserMatch([commands[command].text].concat(commands[command].variations), recognizedText);

               if (closerMatch.distance < minDistance) {
                  foundCommand = Object.assign({
                     command: command
                  }, extractData(this.StringComparer, command, recognizedText));

                  if (closerMatch.distance === 0) {
                     break;
                  } else {
                     minDistance = closerMatch.distance;
                  }
               }
            }

            console.debug('Command recognition ended. Found command "' + commands[foundCommand.command].text + '"');
            console.debug('Extrapolated data:', foundCommand);

            return foundCommand;
         }
      }]);

      return Commands;
   }();

   exports.default = Commands;
   module.exports = exports['default'];
});

},{"./helpers/string-comparers/string-comparer":11}],4:[function(require,module,exports){
(function (global, factory) {
   if (typeof define === "function" && define.amd) {
      define("WebReader", ["exports"], factory);
   } else if (typeof exports !== "undefined") {
      factory(exports);
   } else {
      var mod = {
         exports: {}
      };
      factory(mod.exports);
      global.WebReader = mod.exports;
   }
})(this, function (exports) {
   "use strict";

   Object.defineProperty(exports, "__esModule", {
      value: true
   });
   /**
    * Returns the title of the current document
    *
    * @return {string}
    */
   function getTitle() {
      return document.title;
   }

   exports.getTitle = getTitle;
});

},{}],5:[function(require,module,exports){
(function (global, factory) {
   if (typeof define === "function" && define.amd) {
      define('WebReader', ['module', 'exports', './document', './headers', './links', './main'], factory);
   } else if (typeof exports !== "undefined") {
      factory(module, exports, require('./document'), require('./headers'), require('./links'), require('./main'));
   } else {
      var mod = {
         exports: {}
      };
      factory(mod, mod.exports, global.document, global.headers, global.links, global.main);
      global.WebReader = mod.exports;
   }
})(this, function (module, exports, _document, _headers, _links, _main) {
   'use strict';

   Object.defineProperty(exports, "__esModule", {
      value: true
   });


   /**
    * Highlights an element in the current document by wrapping it
    * with a <code>mark</code> element
    *
    * @param {HTMLElement} element The element to highlight
    */
   function highlightElement(element) {
      if (!(element instanceof HTMLElement)) {
         return;
      }

      element.innerHTML = '<mark>' + element.innerHTML + '</mark>';
   }

   /**
    * Unhighlights an element in the current document by removing
    * the <code>mark</code> element wrapping it
    *
    * @param {HTMLElement} element The element to unhighlight
    */
   function unhighlightElement(element) {
      if (!(element instanceof HTMLElement)) {
         return;
      }

      element.innerHTML = element.innerHTML.replace(/^<mark>/, '').replace(/<\/mark>$/, '');
   }

   exports.default = {
      getHeaders: _headers.getHeaders,
      getLinks: _links.getLinks,
      getMain: _main.getMain,
      getTitle: _document.getTitle,
      highlightElement: highlightElement,
      unhighlightElement: unhighlightElement
   };
   module.exports = exports['default'];
});

},{"./document":4,"./headers":6,"./links":7,"./main":8}],6:[function(require,module,exports){
(function (global, factory) {
   if (typeof define === "function" && define.amd) {
      define('WebReader', ['exports'], factory);
   } else if (typeof exports !== "undefined") {
      factory(exports);
   } else {
      var mod = {
         exports: {}
      };
      factory(mod.exports);
      global.WebReader = mod.exports;
   }
})(this, function (exports) {
   'use strict';

   Object.defineProperty(exports, "__esModule", {
      value: true
   });
   /**
    * Returns the level of a header (1 for an <code>h1</code>, 2 for an <code>h2</code>,
    * and so on). If the element is not an header or it is not defined, zero is returned
    *
    * @param {HTMLElement} element
    *
    * @return {number}
    */
   function getHeaderLevel(element) {
      if (!element || !element.nodeName || element.nodeName.toLowerCase().indexOf('h') !== 0) {
         return 0;
      }

      return parseInt(element.nodeName.charAt(1), 10);
   }

   /**
    * Returns all the headers of a page in a tree structure. Each element
    * possesses two properties: element and subheadings. The former
    * is an <code>HTMLElement</code> referencing the header, while the latter is an array
    * containing all the subheadings of the header.
    *
    * @param {HTMLElement[]} headers The headers to use to create the tree
    *
    * @return {Object[]}
    */
   function createHeadingsStructure(headers) {
      var tree = [];

      (function recurse(headers, index, tree) {
         if (index.index === headers.length) {
            return tree;
         }

         var headerLevel = getHeaderLevel(headers[index.index]);
         var header = {
            element: headers[index.index],
            subheadings: []
         };

         if (tree.length === 0 || headerLevel === getHeaderLevel(tree[tree.length - 1].element)) {
            tree.push(header);
            index.index++;

            return recurse(headers, index, tree);
         }

         if (headerLevel > getHeaderLevel(tree[tree.length - 1].element)) {
            tree[tree.length - 1].subheadings = recurse(headers, index, []);
         }

         headerLevel = getHeaderLevel(headers[index.index]);

         if (headerLevel === getHeaderLevel(tree[tree.length - 1].element)) {
            return recurse(headers, index, tree);
         } else {
            return tree;
         }
      })(headers, {
         index: 0
      }, tree);

      return tree;
   }

   /**
    * Returns all the headers of a page, optionally filtered
    *
    * @param {Object} [filters={}] An object used to filters the headers to return
    * @param {number} [filters.level=-1] An integer that specifies the level to retrieve.
    * If set  to -1 retrieves all the headers
    * @param {string} [filters.text=''] A string that must be contained in the header's text
    *
    * @return {HTMLElement[]}
    */
   function getHeaders() {
      var filters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var selector = void 0;

      filters = Object.assign({
         level: -1,
         text: ''
      }, filters);

      if (filters.level === -1) {
         selector = 'h1, h2, h3, h4, h5, h6';
      } else {
         selector = 'h' + filters.level;
      }

      var filterTextRegExp = new RegExp('(^|\\b)' + filters.text + '(\\b|$)', 'i');
      var headers = Array.from(document.querySelectorAll(selector)).filter(function (header) {
         return header.textContent.search(filterTextRegExp) >= 0;
      });

      return headers;
   }

   exports.createHeadingsStructure = createHeadingsStructure;
   exports.getHeaders = getHeaders;
});

},{}],7:[function(require,module,exports){
(function (global, factory) {
   if (typeof define === "function" && define.amd) {
      define('WebReader', ['exports'], factory);
   } else if (typeof exports !== "undefined") {
      factory(exports);
   } else {
      var mod = {
         exports: {}
      };
      factory(mod.exports);
      global.WebReader = mod.exports;
   }
})(this, function (exports) {
   'use strict';

   Object.defineProperty(exports, "__esModule", {
      value: true
   });
   /**
    * Determines if a link would be read or not by a classic screen reader
    *
    * @param {HTMLElement} element The element to test
    *
    * @return {boolean}
    */
   function isScreenReaderVisible(element) {
      return window.getComputedStyle(element).display !== 'none' && element.getAttribute('aria-hidden') !== 'true';
   }

   /**
    * Returns all the links of a page, optionally filtered
    *
    * @param {Object} [filters={}] An object used to filters the links
    * @param {(HTMLElement|HTMLDocument)} [filters.ancestor=document] The ancestor of the links to retrieve
    *
    * @return {HTMLElement[]}
    */
   function getLinks() {
      var filters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      filters = Object.assign({
         ancestor: document
      }, filters);

      var links = filters.ancestor.querySelectorAll('a');

      return Array.from(links).filter(function (element) {
         return isScreenReaderVisible(element);
      });
   }

   exports.getLinks = getLinks;
});

},{}],8:[function(require,module,exports){
(function (global, factory) {
   if (typeof define === "function" && define.amd) {
      define('WebReader', ['exports'], factory);
   } else if (typeof exports !== "undefined") {
      factory(exports);
   } else {
      var mod = {
         exports: {}
      };
      factory(mod.exports);
      global.WebReader = mod.exports;
   }
})(this, function (exports) {
   'use strict';

   Object.defineProperty(exports, "__esModule", {
      value: true
   });
   /**
    * Searches for potential main element in the page. If only one element
    * is found, it is returned; otherwise <code>null</code> is returned
    *
    * @return {HTMLElement|null}
    */
   function getPotentialMain() {
      var potentialMain = document.querySelectorAll('#main-content, .main-content, #main, .main');

      // If only one element is found, it's highly possible
      // that it's the true main content of the page.
      return potentialMain.length === 1 ? potentialMain[0] : null;
   }

   /**
    * Returns the main element of the page.
    * If the element is not found, an heuristic is employed to find a possible
    * main element. If the heuristic approach fails, <code>null</code> is returned
    *
    * @return {HTMLElement|null}
    */
   function getMain() {
      var main = document.querySelectorAll('main, [role="main"]');

      // If a main has not been found, let's use an heuristic to find
      // a possible main content that has not been marked as such.
      if (main.length === 0) {
         main = getPotentialMain();
      } else if (main.length > 1) {
         main = null;
      } else {
         main = main[0];
      }

      return main;
   }

   exports.getMain = getMain;
});

},{}],9:[function(require,module,exports){
(function (global, factory) {
   if (typeof define === "function" && define.amd) {
      define('WebReader', ['module', 'exports'], factory);
   } else if (typeof exports !== "undefined") {
      factory(module, exports);
   } else {
      var mod = {
         exports: {}
      };
      factory(mod, mod.exports);
      global.WebReader = mod.exports;
   }
})(this, function (module, exports) {
   'use strict';

   Object.defineProperty(exports, "__esModule", {
      value: true
   });

   function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
         throw new TypeError("Cannot call a class as a function");
      }
   }

   var _createClass = function () {
      function defineProperties(target, props) {
         for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
         }
      }

      return function (Constructor, protoProps, staticProps) {
         if (protoProps) defineProperties(Constructor.prototype, protoProps);
         if (staticProps) defineProperties(Constructor, staticProps);
         return Constructor;
      };
   }();

   var EventEmitter = function () {
      function EventEmitter() {
         _classCallCheck(this, EventEmitter);
      }

      _createClass(EventEmitter, null, [{
         key: 'namespaceEvent',
         value: function namespaceEvent(eventName) {
            return EventEmitter.namespace + '.' + eventName;
         }
      }, {
         key: 'fireEvent',
         value: function fireEvent(eventName, element) {
            var properties = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

            var customEvent = document.createEvent('Event');

            customEvent.initEvent(eventName, true, true);

            Object.getOwnPropertyNames(properties).forEach(function (property) {
               return customEvent[property] = properties[property];
            });

            element.dispatchEvent(customEvent);
         }
      }, {
         key: 'namespace',
         get: function get() {
            return 'webreader';
         }
      }]);

      return EventEmitter;
   }();

   exports.default = EventEmitter;
   module.exports = exports['default'];
});

},{}],10:[function(require,module,exports){
(function (global, factory) {
   if (typeof define === "function" && define.amd) {
      define('WebReader', ['module', 'exports', 'damerau-levenshtein', './string-comparer'], factory);
   } else if (typeof exports !== "undefined") {
      factory(module, exports, require('damerau-levenshtein'), require('./string-comparer'));
   } else {
      var mod = {
         exports: {}
      };
      factory(mod, mod.exports, global.damerauLevenshtein, global.stringComparer);
      global.WebReader = mod.exports;
   }
})(this, function (module, exports, _damerauLevenshtein, _stringComparer) {
   'use strict';

   Object.defineProperty(exports, "__esModule", {
      value: true
   });

   var _damerauLevenshtein2 = _interopRequireDefault(_damerauLevenshtein);

   var _stringComparer2 = _interopRequireDefault(_stringComparer);

   function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
         default: obj
      };
   }

   function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
         throw new TypeError("Cannot call a class as a function");
      }
   }

   var _createClass = function () {
      function defineProperties(target, props) {
         for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
         }
      }

      return function (Constructor, protoProps, staticProps) {
         if (protoProps) defineProperties(Constructor.prototype, protoProps);
         if (staticProps) defineProperties(Constructor, staticProps);
         return Constructor;
      };
   }();

   function _possibleConstructorReturn(self, call) {
      if (!self) {
         throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }

      return call && (typeof call === "object" || typeof call === "function") ? call : self;
   }

   function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
         throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }

      subClass.prototype = Object.create(superClass && superClass.prototype, {
         constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
         }
      });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
   }

   var DamerauLevenshteinComparer = function (_StringComparer) {
      _inherits(DamerauLevenshteinComparer, _StringComparer);

      function DamerauLevenshteinComparer() {
         _classCallCheck(this, DamerauLevenshteinComparer);

         return _possibleConstructorReturn(this, Object.getPrototypeOf(DamerauLevenshteinComparer).apply(this, arguments));
      }

      _createClass(DamerauLevenshteinComparer, null, [{
         key: 'findCloserMatch',
         value: function findCloserMatch(string, target) {
            if (!Array.isArray(string)) {
               string = [string];
            }

            var damerauLevenshtein = (0, _damerauLevenshtein2.default)(); // jshint ignore:line
            var minDistance = Number.POSITIVE_INFINITY;
            var index = -1;

            for (var i = 0; i < string.length; i++) {
               var distance = damerauLevenshtein(string[i], target);

               console.debug('The distance between "' + string[i] + '" and "' + target + '" is ' + distance);

               if (distance === 0 || distance < minDistance) {
                  minDistance = distance;
                  index = i;

                  // If a perfect match is found, exit immediately
                  if (distance === 0) {
                     break;
                  }
               }
            }

            return {
               index: index,
               distance: minDistance
            };
         }
      }]);

      return DamerauLevenshteinComparer;
   }(_stringComparer2.default);

   exports.default = DamerauLevenshteinComparer;
   module.exports = exports['default'];
});

},{"./string-comparer":11,"damerau-levenshtein":2}],11:[function(require,module,exports){
(function (global, factory) {
   if (typeof define === "function" && define.amd) {
      define("WebReader", ["module", "exports"], factory);
   } else if (typeof exports !== "undefined") {
      factory(module, exports);
   } else {
      var mod = {
         exports: {}
      };
      factory(mod, mod.exports);
      global.WebReader = mod.exports;
   }
})(this, function (module, exports) {
   "use strict";

   Object.defineProperty(exports, "__esModule", {
      value: true
   });

   function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
         throw new TypeError("Cannot call a class as a function");
      }
   }

   var _createClass = function () {
      function defineProperties(target, props) {
         for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
         }
      }

      return function (Constructor, protoProps, staticProps) {
         if (protoProps) defineProperties(Constructor.prototype, protoProps);
         if (staticProps) defineProperties(Constructor, staticProps);
         return Constructor;
      };
   }();

   var StringComparer = function () {
      function StringComparer() {
         _classCallCheck(this, StringComparer);
      }

      _createClass(StringComparer, null, [{
         key: "findCloserMatch",
         value: function findCloserMatch(string, target) {
            throw new Error("The " + arguments.callee.name + " function must be overridden");
         }
      }]);

      return StringComparer;
   }();

   exports.default = StringComparer;
   module.exports = exports['default'];
});

},{}],12:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define("WebReader", ["module", "exports"], factory);
  } else if (typeof exports !== "undefined") {
    factory(module, exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod, mod.exports);
    global.WebReader = mod.exports;
  }
})(this, function (module, exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var Timer = function () {
    function Timer() {
      _classCallCheck(this, Timer);
    }

    _createClass(Timer, null, [{
      key: "wait",
      value: function wait(milliseconds) {
        return new Promise(function (resolve) {
          return window.setTimeout(resolve, milliseconds);
        });
      }
    }]);

    return Timer;
  }();

  exports.default = Timer;
  module.exports = exports['default'];
});

},{}],13:[function(require,module,exports){
(function (global, factory) {
   if (typeof define === "function" && define.amd) {
      define('WebReader', ['module', 'exports', './commands', './dom/dom', './reader/recognizer', './router', './reader/speaker', './helpers/event-emitter', './helpers/string-comparers/damerau-levenshtein-comparer', './helpers/timer', './webreader-error', '../lang/en-GB.json'], factory);
   } else if (typeof exports !== "undefined") {
      factory(module, exports, require('./commands'), require('./dom/dom'), require('./reader/recognizer'), require('./router'), require('./reader/speaker'), require('./helpers/event-emitter'), require('./helpers/string-comparers/damerau-levenshtein-comparer'), require('./helpers/timer'), require('./webreader-error'), require('../lang/en-GB.json'));
   } else {
      var mod = {
         exports: {}
      };
      factory(mod, mod.exports, global.commands, global.dom, global.recognizer, global.router, global.speaker, global.eventEmitter, global.damerauLevenshteinComparer, global.timer, global.webreaderError, global.enGB);
      global.WebReader = mod.exports;
   }
})(this, function (module, exports, _commands, _dom, _recognizer, _router, _speaker, _eventEmitter, _damerauLevenshteinComparer, _timer, _webreaderError, _enGB) {
   'use strict';

   Object.defineProperty(exports, "__esModule", {
      value: true
   });

   var _commands2 = _interopRequireDefault(_commands);

   var _dom2 = _interopRequireDefault(_dom);

   var _recognizer2 = _interopRequireDefault(_recognizer);

   var _router2 = _interopRequireDefault(_router);

   var _speaker2 = _interopRequireDefault(_speaker);

   var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

   var _damerauLevenshteinComparer2 = _interopRequireDefault(_damerauLevenshteinComparer);

   var _timer2 = _interopRequireDefault(_timer);

   var _webreaderError2 = _interopRequireDefault(_webreaderError);

   var _enGB2 = _interopRequireDefault(_enGB);

   function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
         default: obj
      };
   }

   function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
         throw new TypeError("Cannot call a class as a function");
      }
   }

   var _createClass = function () {
      function defineProperties(target, props) {
         for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
         }
      }

      return function (Constructor, protoProps, staticProps) {
         if (protoProps) defineProperties(Constructor.prototype, protoProps);
         if (staticProps) defineProperties(Constructor, staticProps);
         return Constructor;
      };
   }();

   var defaultLanguage = 'en-GB';

   /**
    * @typedef SettingsHash
    * @type {Object}
    * @property {number} [delay=300] The delay between each spoken text
    * @property {string} [translationsPath=''] The path to the translations folder
    * @property {SpeechRecognitionHash} [recognizer] The settings for the speech recognition functionality
    * @property {SpeechSynthesisUtteranceHash} [speaker] The settings for the speech synthesis functionality
    * functionality
    */

   /**
    * The default values for the settings available
    *
    * @type {SettingsHash}
    */
   var defaults = {
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

   var defaultState = {
      isInteracting: false,
      elements: [],
      currentIndex: -1
   };

   var eventListenersMap = new WeakMap();
   var statusMap = new WeakMap();
   var translations = new Map([[defaultLanguage, _enGB2.default]]);

   /**
    * Downloads a translation for the commands available
    *
    * @param {string} translationsPath The path to the translations folder
    * @param {string} language The language to download
    *
    * @return {Promise}
    */
   function downloadTranslation(translationsPath, language) {
      return window.fetch(translationsPath + '/' + language + '.json').then(function (response) {
         return response.json();
      }).then(function (response) {
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
      if (event.ctrlKey === true && (event.code && event.code === 'Space' || event.which === 32)) {
         if (webReader.isInteracting()) {
            var state = statusMap.get(webReader);
            var element = state.elements[state.currentIndex];

            if (element) {
               _dom2.default.unhighlightElement(element);
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

   var WebReader = function () {
      /**
       * Creates an instance of WebReader
       *
       * @constructor
       *
       * @param {SettingsHash} [options={}] The options to customize WebReader
       */

      function WebReader() {
         var _this = this;

         var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

         _classCallCheck(this, WebReader);

         /**
          * @type {Object}
          */
         this.settings = Object.assign({}, defaults, options);
         /**
          *
          * @type {Recognizer}
          */
         this.recognizer = new _recognizer2.default(this.settings.recognizer);
         /**
          *
          * @type {Speaker}
          */
         this.speaker = new _speaker2.default(this.settings.speaker);

         statusMap.set(this, Object.assign({}, defaultState));
         eventListenersMap.set(this, new Map());

         var language = this.settings.recognizer.lang;

         if (language && !translations.has(language)) {
            downloadTranslation(this.settings.translationsPath, language).then(function () {
               var message = 'Language "' + language + '" successfully loaded';

               console.debug(message);

               _eventEmitter2.default.fireEvent(_eventEmitter2.default.namespace + '.languagedownload', document, {
                  data: {
                     lang: language
                  }
               });

               return _this.speaker.speak(message);
            }, function (err) {
               console.debug(err.message);

               _eventEmitter2.default.fireEvent(_eventEmitter2.default.namespace + '.languageerror', document, {
                  data: {
                     lang: language
                  }
               });

               return _this.speaker.speak('An error occurred: the language "' + language + '" was not loaded');
            });
         }
      }

      /**
       * Determines if WebReader is currently interacting with the user
       *
       * @return {boolean}
       */


      _createClass(WebReader, [{
         key: 'isInteracting',
         value: function isInteracting() {
            return statusMap.get(this).isInteracting;
         }
      }, {
         key: 'enableShortcuts',
         value: function enableShortcuts() {
            var eventListeners = eventListenersMap.get(this);

            eventListeners.set('keydown', listenShortcuts.bind(this, this));

            document.documentElement.addEventListener('keydown', eventListeners.get('keydown'));

            return this;
         }
      }, {
         key: 'disableShortcuts',
         value: function disableShortcuts() {
            var eventListeners = eventListenersMap.get(this);

            document.documentElement.removeEventListener('keydown', eventListeners.get('keydown'));
            eventListeners.delete('keydown');

            return this;
         }
      }, {
         key: 'receiveCommand',
         value: function receiveCommand() {
            var _this2 = this;

            statusMap.get(this).isInteracting = true;
            console.debug('Interaction started');

            _eventEmitter2.default.fireEvent(_eventEmitter2.default.namespace + '.interactionstart', document);

            return this.speaker.speak('Ready').then(function () {
               return _this2.recognizer.recognize();
            }).then(function (recognizedText) {
               var commands = new _commands2.default(_damerauLevenshteinComparer2.default);
               var translation = translations.get(_this2.settings.recognizer.lang);

               return commands.recognizeCommand(recognizedText, translation);
            }).then(function (recognizedCommand) {
               return _router2.default.route(_this2, recognizedCommand);
            }).catch(function (error) {
               if (error instanceof _webreaderError2.default) {
                  return _this2.speaker.speak(error.message);
               }

               if (error.error !== 'aborted' && error.error !== 'interrupted') {
                  console.debug('An error occurred', error);

                  statusMap.set(_this2, Object.assign({}, defaultState));

                  return _this2.speaker.speak('Sorry, I could not recognize the command');
               }
            }).then( // Simulate an always() method
            function () {}, function () {}).then(function () {
               statusMap.get(_this2).isInteracting = false;
               console.debug('Interaction completed');

               _eventEmitter2.default.fireEvent(_eventEmitter2.default.namespace + '.interactionend', document);
            });
         }
      }, {
         key: 'stopCommand',
         value: function stopCommand() {
            this.recognizer.abort();
            this.speaker.cancel();
            statusMap.get(this).isInteracting = false;
            console.debug('Interaction stopped');
         }
      }, {
         key: 'readHeaders',
         value: function readHeaders() {
            var _this3 = this;

            var filters = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var headers = _dom2.default.getHeaders(filters);
            var level = filters && filters.level ? filters.level : -1;

            statusMap.get(this).elements = headers;

            return headers.reduce(function (promise, header, index) {
               promise = promise.then(function () {
                  statusMap.get(_this3).currentIndex = index;
                  _dom2.default.highlightElement(header);

                  return _this3.speaker.speak(header.textContent + (level !== -1 ? '' : ' ' + header.nodeName)).then(function () {
                     return _dom2.default.unhighlightElement(header);
                  }).catch(function (error) {
                     _dom2.default.unhighlightElement(header);

                     return Promise.reject(error);
                  });
               });

               if (_this3.settings.delay > 0) {
                  promise = promise.then(function () {
                     return _timer2.default.wait(_this3.settings.delay);
                  });
               }

               return promise;
            }, Promise.resolve());
         }
      }, {
         key: 'readCurrentElement',
         value: function readCurrentElement() {
            var state = statusMap.get(this);
            var element = state.elements[state.currentIndex];

            if (!element) {
               return Promise.reject(new _webreaderError2.default('There is not a current element to read'));
            }

            _dom2.default.highlightElement(element);

            return this.speaker.speak(element.textContent).then(function () {
               return _dom2.default.unhighlightElement(element);
            }).catch(function (error) {
               _dom2.default.unhighlightElement(element);

               return Promise.reject(error);
            });
         }
      }, {
         key: 'readPreviousElement',
         value: function readPreviousElement() {
            var state = statusMap.get(this);

            if (state.currentIndex === 0) {
               return Promise.reject(new _webreaderError2.default('The current element is the first'));
            }

            state.currentIndex--;

            return this.readCurrentElement();
         }
      }, {
         key: 'readNextElement',
         value: function readNextElement() {
            var state = statusMap.get(this);

            if (state.currentIndex === state.elements.length - 1) {
               return Promise.reject(new _webreaderError2.default('The current element is the last'));
            }

            state.currentIndex++;

            return this.readCurrentElement();
         }
      }, {
         key: 'goToLink',
         value: function goToLink() {
            var state = statusMap.get(this);
            var element = state.elements[state.currentIndex];

            if (!element || element.nodeName !== 'A') {
               throw new _webreaderError2.default('There is not a current link to follow');
            }

            window.location.assign(element.href);
         }
      }, {
         key: 'readLinks',
         value: function readLinks(filters) {
            var _this4 = this;

            var links = _dom2.default.getLinks(filters);

            statusMap.get(this).elements = links;

            return links.reduce(function (promise, link, index) {
               promise = promise.then(function () {
                  statusMap.get(_this4).currentIndex = index;

                  return _this4.readCurrentElement();
               });

               if (_this4.settings.delay > 0) {
                  promise = promise.then(function () {
                     return _timer2.default.wait(_this4.settings.delay);
                  });
               }

               return promise;
            }, Promise.resolve());
         }
      }, {
         key: 'readMain',
         value: function readMain() {
            var main = _dom2.default.getMain();
            var state = statusMap.get(this);

            if (!main) {
               return Promise.reject(new _webreaderError2.default('The main content of this page cannot be found'));
            } else {
               state.elements = [main];
               state.currentIndex = 0;
            }

            return this.speaker.speak(main.textContent);
         }
      }, {
         key: 'searchMain',
         value: function searchMain() {
            var main = _dom2.default.getMain();

            if (!main) {
               throw new _webreaderError2.default('The main content of this page has not been found');
            }

            var oldTabIndex = main.getAttribute('tabindex');

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
      }, {
         key: 'readPageTitle',
         value: function readPageTitle() {
            var title = _dom2.default.getTitle();

            if (title) {
               return this.speaker.speak('The title of the page is ' + title);
            } else {
               return this.speaker.speak('This page does not have a title');
            }
         }
      }, {
         key: 'readPageSummary',
         value: function readPageSummary() {
            var headers = _dom2.default.getHeaders();
            var links = _dom2.default.getLinks();

            return this.speaker.speak('The page contains ' + headers.length + ' headers and ' + links.length + ' links');
         }
      }, {
         key: 'goToPreviousPage',
         value: function goToPreviousPage() {
            return new Promise(function (resolve, reject) {
               function onPopState() {
                  window.removeEventListener('popstate', onPopState);
                  resolve();
               }

               window.addEventListener('popstate', onPopState);
               window.history.back();

               // For privacy reasons a script doesn't have access to the list of pages
               // visited by the user. So, there is no way to detect if the current page
               // is already the first of the history. If that is the case, the
               // "popstate" event won't be triggered and there is no way to know when
               // to reject the promise (for example by checking that the current page has
               // the same URL of the previous one).
               //
               // This hack allows to reject the promise if it hasn't been already resolved
               // by the event listener for the "popstate" event.
               setTimeout(function () {
                  reject(new _webreaderError2.default('This is already the first page'));
                  window.removeEventListener('popstate', onPopState);
               }, 10);
            });
         }
      }, {
         key: 'goToNextPage',
         value: function goToNextPage() {
            return new Promise(function (resolve, reject) {
               function onPopState() {
                  window.removeEventListener('popstate', onPopState);
                  resolve();
               }

               window.addEventListener('popstate', onPopState);
               window.history.forward();

               // To know the rationale behind this hack, read the comment inside
               // the "goToPreviousPage()" function.
               setTimeout(function () {
                  reject(new _webreaderError2.default('This is already the last page'));
                  window.removeEventListener('popstate', onPopState);
               }, 10);
            });
         }
      }, {
         key: 'goToHomepage',
         value: function goToHomepage() {
            window.location.assign('/');
         }
      }]);

      return WebReader;
   }();

   exports.default = WebReader;
   module.exports = exports['default'];
});

},{"../lang/en-GB.json":1,"./commands":3,"./dom/dom":5,"./helpers/event-emitter":9,"./helpers/string-comparers/damerau-levenshtein-comparer":10,"./helpers/timer":12,"./reader/recognizer":14,"./reader/speaker":15,"./router":16,"./webreader-error":17}],14:[function(require,module,exports){
(function (global, factory) {
   if (typeof define === "function" && define.amd) {
      define('WebReader', ['module', 'exports', '../helpers/event-emitter', '../webreader-error'], factory);
   } else if (typeof exports !== "undefined") {
      factory(module, exports, require('../helpers/event-emitter'), require('../webreader-error'));
   } else {
      var mod = {
         exports: {}
      };
      factory(mod, mod.exports, global.eventEmitter, global.webreaderError);
      global.WebReader = mod.exports;
   }
})(this, function (module, exports, _eventEmitter, _webreaderError) {
   'use strict';

   Object.defineProperty(exports, "__esModule", {
      value: true
   });

   var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

   var _webreaderError2 = _interopRequireDefault(_webreaderError);

   function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
         default: obj
      };
   }

   function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
         throw new TypeError("Cannot call a class as a function");
      }
   }

   var _createClass = function () {
      function defineProperties(target, props) {
         for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
         }
      }

      return function (Constructor, protoProps, staticProps) {
         if (protoProps) defineProperties(Constructor.prototype, protoProps);
         if (staticProps) defineProperties(Constructor, staticProps);
         return Constructor;
      };
   }();

   /**
    * Stores the private data of a Recognizer instance
    *
    * @type {WeakMap}
    */
   var dataMap = new WeakMap();

   /**
    * @typedef SpeechRecognitionHash
    * @type {Object}
    * @property {Object[]} [grammars=[]] The collection of <code>SpeechGrammar</code> objects
    * which represent the grammars that are active for this recognition
    * @property {string} [lang=''] The language of the recognition for the request.
    * If unspecified it defaults to the language of the html document root element
    * @property {boolean} [continuous=false] Controls whether the interaction is stopped when the user
    * stops speaking or not
    * @property {boolean} [interimResults=false] Controls whether interim results are returned or not
    * @property {number} [maxAlternatives=1] The maximum number of <code>SpeechRecognitionAlternative</code>s per result
    * @property {string} [serviceURI=''] The location of the speech recognition service to use
    *
    * @see https://dvcs.w3.org/hg/speech-api/raw-file/tip/webspeechapi.html#speechreco-attributes
    */

   /**
    * Retrieves the object that allows to recognize the speech or
    * <code>null</code> if the feature is not supported
    *
    * @returns {SpeechRecognition|null}
    */
   function getRecognizer() {
      return window.SpeechRecognition || window.webkitSpeechRecognition || null;
   }

   /**
    * Binds one or more events to a <code>SpeechRecognition</code> object
    *
    * @param {SpeechRecognition} recognizer A <code>SpeechRecognition</code> object
    * @param {Object} eventsHash An object of name-function pairs,
    * where name is the event to listen and function is the function to attach
    */
   function bindEvents(recognizer, eventsHash) {
      for (var eventName in eventsHash) {
         recognizer.addEventListener(eventName, eventsHash[eventName]);
      }
   }

   /**
    * Unbinds one or more events to a <code>SpeechRecognition</code> object
    *
    * @param {SpeechRecognition} recognizer A <code>SpeechRecognition</code> object
    * @param {Object} eventsHash An object of name-function pairs,
    * where name is the event to listen and function is the function to attach
    */
   function unbindEvents(recognizer, eventsHash) {
      for (var eventName in eventsHash) {
         recognizer.removeEventListener(eventName, eventsHash[eventName]);
      }
   }

   /**
    * The class exposing the reading features of a web page
    *
    * @class
    */

   var Recognizer = function () {
      /**
       * Creates a Recognizer instance
       *
       * @constructor
       *
       * @param {SpeechRecognitionHash} [options={}] The options to customize the settings of the recognizer
       */

      function Recognizer() {
         var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

         _classCallCheck(this, Recognizer);

         var _Recognizer = getRecognizer();

         if (!_Recognizer) {
            throw Error('API not supported');
         }

         /**
          * The speech recognizer used
          *
          * @type {SpeechRecognition}
          */
         var recognizer = new _Recognizer();

         for (var key in options) {
            if (options.hasOwnProperty(key) && recognizer[key] !== undefined) {
               recognizer[key] = options[key];
            }
         }

         dataMap.set(this, {
            recognizer: recognizer,
            isRecognizing: false
         });
      }

      /**
       * Detects if the recognition feature is supported
       *
       * @returns {boolean}
       */


      _createClass(Recognizer, [{
         key: 'isRecognizing',
         value: function isRecognizing() {
            return dataMap.get(this).isRecognizing;
         }
      }, {
         key: 'recognize',
         value: function recognize() {
            var _this = this;

            return new Promise(function (resolve, reject) {
               var data = dataMap.get(_this);
               var eventsHash = {
                  audiostart: function audiostart() {
                     data.isRecognizing = true;
                     _eventEmitter2.default.fireEvent(_eventEmitter2.default.namespace + '.recognitionstart', document);
                  },
                  result: function result(event) {
                     for (var i = event.resultIndex; i < event.results.length; i++) {
                        if (event.results[i].isFinal) {
                           var bestGuess = event.results[i][0];

                           console.debug('Recognition completed');
                           console.debug('Recognized "' + bestGuess.transcript + '" with a confidence of ' + bestGuess.confidence);

                           _eventEmitter2.default.fireEvent(_eventEmitter2.default.namespace + '.recognitionresult', document, {
                              data: {
                                 result: bestGuess
                              }
                           });

                           data.isRecognizing = false;
                           resolve(bestGuess.transcript);
                        }
                     }
                  },
                  error: function error(event) {
                     console.debug('Recognition error:', event.error);

                     data.isRecognizing = false;
                     _eventEmitter2.default.fireEvent(_eventEmitter2.default.namespace + '.recognitionerror', document, {
                        error: event.error
                     });

                     reject(new _webreaderError2.default('An error has occurred while recognizing your speech'));
                  },
                  noMatch: function noMatch() {
                     console.debug('Recognition ended because of nomatch');

                     data.isRecognizing = false;
                     _eventEmitter2.default.fireEvent(_eventEmitter2.default.namespace + '.recognitionnomatch', document);

                     reject(new _webreaderError2.default('Sorry, I could not find a match'));
                  },
                  end: function end() {
                     console.debug('Recognition ended');

                     data.isRecognizing = false;
                     unbindEvents(data.recognizer, eventsHash);

                     _eventEmitter2.default.fireEvent(_eventEmitter2.default.namespace + '.recognitionend', document);

                     // If the Promise isn't resolved or rejected at this point
                     // the demo is running on Chrome and Windows 8.1 (issue #428873).
                     reject(new _webreaderError2.default('Sorry, I could not recognize your speech'));
                  }
               };

               bindEvents(data.recognizer, eventsHash);

               console.debug('Recognition started');
               data.recognizer.start();
            });
         }
      }, {
         key: 'abort',
         value: function abort() {
            dataMap.get(this).recognizer.abort();
         }
      }], [{
         key: 'isSupported',
         value: function isSupported() {
            return !!getRecognizer();
         }
      }]);

      return Recognizer;
   }();

   exports.default = Recognizer;
   module.exports = exports['default'];
});

},{"../helpers/event-emitter":9,"../webreader-error":17}],15:[function(require,module,exports){
(function (global, factory) {
   if (typeof define === "function" && define.amd) {
      define('WebReader', ['module', 'exports', '../helpers/event-emitter', '../webreader-error'], factory);
   } else if (typeof exports !== "undefined") {
      factory(module, exports, require('../helpers/event-emitter'), require('../webreader-error'));
   } else {
      var mod = {
         exports: {}
      };
      factory(mod, mod.exports, global.eventEmitter, global.webreaderError);
      global.WebReader = mod.exports;
   }
})(this, function (module, exports, _eventEmitter, _webreaderError) {
   'use strict';

   Object.defineProperty(exports, "__esModule", {
      value: true
   });

   var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

   var _webreaderError2 = _interopRequireDefault(_webreaderError);

   function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
         default: obj
      };
   }

   function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
         throw new TypeError("Cannot call a class as a function");
      }
   }

   var _createClass = function () {
      function defineProperties(target, props) {
         for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
         }
      }

      return function (Constructor, protoProps, staticProps) {
         if (protoProps) defineProperties(Constructor.prototype, protoProps);
         if (staticProps) defineProperties(Constructor, staticProps);
         return Constructor;
      };
   }();

   /**
    * Stores the private data of a Speaker instance
    *
    * @type {WeakMap}
    */
   var dataMap = new WeakMap();

   /**
    * @typedef SpeechSynthesisUtteranceHash
    * @type {Object}
    * @property {string} text The text to be synthesized and spoken
    * @property {string} [lang=''] The language of the speech synthesis for the utterance.
    * If unspecified it defaults to the language of the html document root element
    * @property {string} [voice=''] The voice to use
    * @property {number} [volume=1.0] The speaking volume
    * @property {number} [rate=1.0] The speaking rate
    * @property {number} [pitch=1.0] The speaking pitch
    *
    * @see https://dvcs.w3.org/hg/speech-api/raw-file/tip/webspeechapi.html#utterance-attributes
    */

   /**
    * Retrieves the object that allows to speech the text or
    * <code>null</code> if the feature is not supported
    *
    * @returns {speechSynthesis|null}
    */
   function getSpeaker() {
      return window.speechSynthesis || null;
   }

   /**
    * Searches a voice among those provided
    *
    * @param {SpeechSynthesisUtterance[]} voices The voices available
    * @param {string} target The voice to search
    *
    * @return {SpeechSynthesisUtterance|undefined}
    */
   function searchVoice(voices, target) {
      return voices.filter(function (voice) {
         return voice.voiceURI === target;
      }).pop();
   }

   /**
    * Sets the settings for a <code>SpeechSynthesisUtterance</code> object
    *
    * @param {SpeechSynthesisUtterance} utterance The object whose settings will be set
    * @param {SpeechSynthesisUtteranceHash} settings
    * @param {SpeechSynthesisUtterance[]} voices The voices available
    */
   function setUtteranceSettings(utterance, settings, voices) {
      for (var key in settings) {
         if (!settings.hasOwnProperty(key) || utterance[key] === undefined) {
            continue;
         }

         if (key !== 'voice') {
            utterance[key] = settings[key];
            continue;
         }

         var voice = searchVoice(voices, settings[key]);

         if (voice) {
            utterance[key] = voice;
         } else {
            console.debug('The voice selected is not available. Falling back to one available');
            utterance[key] = voices[0];
         }
      }
   }

   /**
    * The class exposing the speaking features of a web page
    *
    * @class
    */

   var Speaker = function () {
      /**
       * Creates a Speaker instance
       *
       * @constructor
       *
       * @param {SpeechSynthesisUtteranceHash} [options={}] The options to customize the voice prompting the texts
       */

      function Speaker() {
         var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

         _classCallCheck(this, Speaker);

         /**
          *
          * @type {speechSynthesis|null}
          */
         var speaker = getSpeaker();

         /**
          *
          * @type {SpeechSynthesisUtteranceHash}
          */
         this.settings = options;

         if (!speaker) {
            throw Error('API not supported');
         }

         dataMap.set(this, {
            speaker: speaker,
            isCancelled: false
         });
      }

      /**
       * Detects if the speech feature is supported
       *
       * @returns {boolean}
       */


      _createClass(Speaker, [{
         key: 'isSpeaking',
         value: function isSpeaking() {
            return dataMap.get(this).speaker.speaking;
         }
      }, {
         key: 'getVoices',
         value: function getVoices() {
            var _this = this;

            return new Promise(function (resolve) {
               var speaker = dataMap.get(_this).speaker;
               var voices = speaker.getVoices();

               if (voices.length > 1) {
                  return resolve(voices);
               } else {
                  speaker.addEventListener('voiceschanged', function onVoicesChanged() {
                     speaker.removeEventListener('voiceschanged', onVoicesChanged);

                     resolve(speaker.getVoices());
                  });
               }
            });
         }
      }, {
         key: 'speak',
         value: function speak(text) {
            var _this2 = this;

            return this.getVoices().then(function (voices) {
               return new Promise(function (resolve, reject) {
                  var speaker = dataMap.get(_this2).speaker;
                  var utterance = new window.SpeechSynthesisUtterance(text);
                  var eventData = Object.assign({
                     text: text
                  }, _this2.settings);

                  setUtteranceSettings(utterance, _this2.settings, voices);

                  utterance.addEventListener('start', function () {
                     console.debug('Synthesizing the text: ' + text);

                     _eventEmitter2.default.fireEvent(_eventEmitter2.default.namespace + '.synthesisstart', document, {
                        data: eventData
                     });
                  });

                  utterance.addEventListener('end', function () {
                     var data = dataMap.get(_this2);

                     console.debug('Synthesis completed');

                     _eventEmitter2.default.fireEvent(_eventEmitter2.default.namespace + '.synthesisend', document, {
                        data: eventData
                     });

                     if (data.isCancelled) {
                        data.isCancelled = false;

                        return reject({
                           error: 'interrupted'
                        });
                     }

                     resolve();
                  });

                  utterance.addEventListener('error', function (event) {
                     console.debug('Synthesis error: ', event.error);

                     _eventEmitter2.default.fireEvent(_eventEmitter2.default.namespace + '.synthesiserror', document, {
                        data: eventData
                     });

                     reject(new _webreaderError2.default('An error has occurred while speaking'));
                  });

                  speaker.speak(utterance);
               });
            });
         }
      }, {
         key: 'cancel',
         value: function cancel() {
            var data = dataMap.get(this);

            if (this.isSpeaking()) {
               data.isCancelled = true;
            }

            data.speaker.cancel();
         }
      }], [{
         key: 'isSupported',
         value: function isSupported() {
            return !!getSpeaker();
         }
      }]);

      return Speaker;
   }();

   exports.default = Speaker;
   module.exports = exports['default'];
});

},{"../helpers/event-emitter":9,"../webreader-error":17}],16:[function(require,module,exports){
(function (global, factory) {
   if (typeof define === "function" && define.amd) {
      define('WebReader', ['module', 'exports', './webreader-error'], factory);
   } else if (typeof exports !== "undefined") {
      factory(module, exports, require('./webreader-error'));
   } else {
      var mod = {
         exports: {}
      };
      factory(mod, mod.exports, global.webreaderError);
      global.WebReader = mod.exports;
   }
})(this, function (module, exports, _webreaderError) {
   'use strict';

   Object.defineProperty(exports, "__esModule", {
      value: true
   });

   var _webreaderError2 = _interopRequireDefault(_webreaderError);

   function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
         default: obj
      };
   }

   function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
         throw new TypeError("Cannot call a class as a function");
      }
   }

   var _createClass = function () {
      function defineProperties(target, props) {
         for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
         }
      }

      return function (Constructor, protoProps, staticProps) {
         if (protoProps) defineProperties(Constructor.prototype, protoProps);
         if (staticProps) defineProperties(Constructor, staticProps);
         return Constructor;
      };
   }();

   var Router = function () {
      function Router() {
         _classCallCheck(this, Router);
      }

      _createClass(Router, null, [{
         key: 'route',
         value: function route(webReader, recognizedCommand) {
            /* jshint -W074 */
            if (recognizedCommand.command === 'READ_ALL_HEADERS') {
               return webReader.readHeaders();
            } else if (recognizedCommand.command === 'READ_ALL_LINKS') {
               return webReader.readLinks();
            } else if (recognizedCommand.command === 'READ_LEVEL_HEADERS') {
               return webReader.readHeaders({
                  level: recognizedCommand.level
               });
            } else if (recognizedCommand.command === 'READ_MAIN') {
               return webReader.readMain();
            } else if (recognizedCommand.command === 'SEARCH_MAIN') {
               return new Promise(function (resolve, reject) {
                  try {
                     resolve(webReader.searchMain());
                  } catch (ex) {
                     reject(ex);
                  }
               });
            } else if (recognizedCommand.command === 'READ_AGAIN') {
               return webReader.readCurrentElement();
            } else if (recognizedCommand.command === 'READ_PREVIOUS') {
               return webReader.readPreviousElement();
            } else if (recognizedCommand.command === 'READ_NEXT') {
               return webReader.readNextElement();
            } else if (recognizedCommand.command === 'READ_PAGE_TITLE') {
               return webReader.readPageTitle();
            } else if (recognizedCommand.command === 'READ_LINKS_IN_ELEMENT') {
               return webReader.readLinks({
                  ancestor: recognizedCommand.element
               });
            } else if (recognizedCommand.command === 'GO_TO_PREVIOUS_PAGE') {
               return webReader.goToPreviousPage();
            } else if (recognizedCommand.command === 'GO_TO_NEXT_PAGE') {
               return webReader.goToNextPage();
            } else if (recognizedCommand.command === 'READ_PAGE_SUMMARY') {
               return webReader.readPageSummary();
            } else if (recognizedCommand.command === 'GO_TO_HOMEPAGE') {
               return Promise.resolve(webReader.goToHomepage());
            } else if (recognizedCommand.command === 'GO_TO_LINK') {
               return new Promise(function (resolve, reject) {
                  try {
                     resolve(webReader.goToLink());
                  } catch (ex) {
                     reject(ex);
                  }
               });
            } else {
               return Promise.reject(new _webreaderError2.default('The command is not supported'));
            }
         }
      }]);

      return Router;
   }();

   exports.default = Router;
   module.exports = exports['default'];
});

},{"./webreader-error":17}],17:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define("WebReader", ["module", "exports"], factory);
  } else if (typeof exports !== "undefined") {
    factory(module, exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod, mod.exports);
    global.WebReader = mod.exports;
  }
})(this, function (module, exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var WebReaderError =
  /**
   * Creates an instance of WebReaderError
   *
   * @constructor
   *
   * @param {string} message The message of the error
   */
  function WebReaderError(message) {
    _classCallCheck(this, WebReaderError);

    /**
     * The name of error
     *
     * @type {string} WebReaderError
     */
    this.name = this.constructor.name;
    /**
     * The message describing the error
     *
     * @type {string}
     */
    this.message = message;
  };

  exports.default = WebReaderError;
  module.exports = exports['default'];
});

},{}]},{},[13])(13)
});


//# sourceMappingURL=web-reader.debug.js.map
