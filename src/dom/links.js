/**
 * Determines if a link would be read or not by a classic screen reader
 *
 * @param {HTMLElement} element The element to test
 *
 * @return {boolean}
 */
function isScreenReaderVisible(element) {
   return window.getComputedStyle(element).display !== 'none' &&
          element.getAttribute('aria-hidden') !== 'true';
}

/**
 * Returns all the links of a page, optionally filtered
 *
 * @param {Object} [filters={}] An object used to filters the links
 * @param {(HTMLElement|HTMLDocument)} [filters.ancestor=document] The ancestor of the links to retrieve
 *
 * @return {HTMLElement[]}
 */
function getLinks(filters = {}) {
   filters = Object.assign(
      {
         ancestor: document
      },
      filters
   );

   let links = filters.ancestor.querySelectorAll('a');

   return Array
      .from(links)
      .filter(element => isScreenReaderVisible(element));
}

export {
   getLinks
}