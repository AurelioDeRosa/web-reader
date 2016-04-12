# Web Reader: a screen reader for everyone, everywhere

[WebReader](https://web-reader.digital-detox.co.uk/) is a free and open source JavaScript library developed for modern
web browsers. Built using emerging functionality, WebReader can be integrated into any web page. Underneath, 
WebReader relies on the [Web Speech API](https://dvcs.w3.org/hg/speech-api/raw-file/tip/webspeechapi.html)
to offer speech recognition and speech synthesis functionality. It integrates a subset of the features provided by 
classic screen readers.

A major advantage of WebReader is that it does not require any additional software to be installed on a user's machine,
apart from a supported web browser.

It is built with the hope to help users with disabilities better interact with web pages. The intention is not to 
replace screen readers, but with basic features embedded into a web page, any user with an internet connection and a 
headset will be able to browse a website. It frees people form constantly looking at the screen which is useful for 
anyone which is on the move.

## How to use WebReader

### Website owners

To start, you have to embed WebReader's JavaScript library in your website. The distribution file is called
`web-reader.min.js`. For better performance, you should include it before the closing `body` tag:

```html
   <script src="path/to/web-reader.min.js"></script>
</body>
```

Then, add a `script` tag after the one referencing the library. Inside it, paste the following lines:

```js
var webReader = new WebReader();

webReader.enableShortcuts();
```

This will rely on the default settings of WebReader. 

The final result should look as follows:

```html
   <script src="path/to/web-reader.min.js"></script>
   <script>
      var webReader = new WebReader();
   
      webReader.enableShortcuts();
   </script>
</body>
```

Congratulations! Your users can now take advantage of all the features provided by WebReader.

### Users

To use WebReader, follow these two simple steps:

1. Press `CTRL` + `SPACE` or touch the floating WebReader icon on the screen. WebReader is now listening. The WebReader
icon will pulse and an audio clue will be provided.
2. Speak a command. WebReader will listen, decipher and respond. You can repeat the interaction to begin a new query
or perform a related query.

## Feedback

We plan to further enrich WebReader’s with more useful features in the months to come.

We welcome [your comments, ideas and feedback]](https://github.com/digital-detox/web-reader/issues). Please help solve
the challenges we have and help us create a truly useful, universal and free resource.

## License

[WebReader](https://github.com/digital-detox/web-reader) is licensed under
[CC BY-NC-ND 4.0](http://creativecommons.org/licenses/by-nc-nd/4.0/).