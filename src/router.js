import WebReaderError from './webreader-error';

/**
 * The class responsible of the routing of the commands
 *
 * @class
 */
export
 default class Router {
   /**
    * Performs an action based on the command recognized
    *
    * @param {WebReader} webReader An instance of WebReader
    * @param {CommandsHash} recognizedCommand The command recognized
    *
    * @return {Promise|WebReaderError|undefined}
    */
   static route(webReader, recognizedCommand) {
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
         return webReader.searchMain();
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
         return webReader.goToHomepage();
      } else if (recognizedCommand.command === 'GO_TO_LINK') {
         return webReader.goToLink();
      } else {
         throw new WebReaderError('The command is not supported');
      }
   }
}