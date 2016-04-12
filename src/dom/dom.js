import {getTitle} from './document'
import {getHeaders} from './headers'
import {getLinks} from './links'
import {getMain} from './main'

function highlightElement(element) {
   if (!element instanceof HTMLElement) {
      return;
   }

   element.innerHTML = `<mark>${element.innerHTML}</mark>`;
}

function unhighlightElement(element) {
   if (!element instanceof HTMLElement) {
      return;
   }

   element.innerHTML = element.innerHTML
      .replace(/^<mark>/, '')
      .replace(/<\/mark>$/, '');
}

export default {
   getHeaders,
   getLinks,
   getMain,
   getTitle,
   highlightElement,
   unhighlightElement
};