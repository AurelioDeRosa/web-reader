/**
 * Returns the main element of the page.
 * If the element is not found, an heuristic is employed to find a possible
 * main element. If the heuristic approach fails, <code>null</code> is returned
 *
 * @return {HTMLElement|null}
 */
function getMain() {
   let main = document.querySelector('main') ||
              document.querySelector('[role="main"]');

   // If a main has not been found, let's use an heuristic to find
   // a possible main content that has not been marked as such.
   if (!main) {
      let possibleMain = document.querySelectorAll('#main-content, .main-content, #main, .main');

      // If only one element is found, it's highly possible
      // that it's the true main content of the page.
      if (possibleMain.length === 1) {
         main = possibleMain[0];
      }
   }

   return main;
}

export {
   getMain
}