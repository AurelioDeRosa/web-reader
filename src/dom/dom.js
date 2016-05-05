import {getTitle} from './document';
import {getHeaders} from './headers';
import {getLinks} from './links';
import {getMain} from './main';

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

   element.innerHTML = `<mark>${element.innerHTML}</mark>`;
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

   element.innerHTML = element.innerHTML
      .replace(/^<mark>/, '')
      .replace(/<\/mark>$/, '');
}

export
 default {
   getHeaders,
   getLinks,
   getMain,
   getTitle,
   highlightElement,
   unhighlightElement
};