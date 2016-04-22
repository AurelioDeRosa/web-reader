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
 * @return {Object[]}
 */
function createHeadingsStructure(headers) {
   let tree = [];

   (function recurse(headers, index, tree) {
      if (headers.length === 0 || index.index === headers.length) {
         return tree;
      }

      let headerLevel = getHeaderLevel(headers[index.index]);
      let header = {
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
   })(headers, {index: 0}, tree);
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
function getHeaders(filters = {}) {
   let selector;

   filters = Object.assign(
      {
         level: -1,
         text: ''
      },
      filters
   );

   if (filters.level === -1) {
      selector = 'h1, h2, h3, h4, h5, h6';
   } else {
      selector = `h${filters.level}`;
   }

   let filterTextRegExp = new RegExp(`(^|\\b)${filters.text}(\\b|$)`, 'i');
   let headers = Array
      .from(document.querySelectorAll(selector))
      .filter(header => header.textContent.search(filterTextRegExp) >= 0);

   return headers;
}

export {
   createHeadingsStructure,
   getHeaders
}