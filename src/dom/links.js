function isScreenReaderVisible(element) {
   return window.getComputedStyle(element).display !== 'none' &&
          element.getAttribute('aria-hidden') !== 'true';
}

/**
 * Returns all the links of a page.
 *
 * @param {Object} [filters={}] An object used to filters the links to return
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