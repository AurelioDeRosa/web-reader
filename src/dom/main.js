/**
 * Searches for potential main element in the page. If only one element
 * is found, it is returned; otherwise <code>null</code> is returned
 *
 * @return {HTMLElement|null}
 */
function getPotentialMain() {
   let potentialMain = document.querySelectorAll('#main-content, .main-content, #main, .main');

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
   let main = document.querySelectorAll('main, [role="main"]');

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

export {
   getMain
};