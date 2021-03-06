import Jed from 'jed';
import jedGettextParser from 'jed-gettext-parser';

export default class Translator {
  /* Returns a Promise */
  constructor(locale) {
    this.locale = locale || 'en';
    this.jed = undefined;
  }

  load() {
    const defaultTranslationData = {
      messages: {
        '': {
          domain: 'messages',
          lang: 'en',
          plural_forms: 'nplurals=2; plural=(n != 1);'
        }
      }
    };

    let translationDataPromise;
    if (this.locale === 'en') {
      /* Just resolve to an empty data set. */
      translationDataPromise = Promise.resolve(defaultTranslationData);
    } else {
      const url = `http://loot/l10n/${this.locale}/LC_MESSAGES/loot.mo`;
      translationDataPromise = fetch(url)
        .then(response => {
          if (response.ok) {
            return response.arrayBuffer();
          }
          throw new Error(response.statusText);
        })
        .then(jedGettextParser.mo.parse);
    }

    return translationDataPromise
      .catch(error => {
        console.error(`Error loading translation data: ${error.message}`); // eslint-disable-line no-console
        return defaultTranslationData;
      })
      .then(result => {
        this.jed = new Jed({
          locale_data: result,
          domain: 'messages'
        });
      });
  }

  translate(text) {
    return this.translateFormatted(text);
  }

  translateFormatted(text, ...substitutions) {
    if (text === undefined) {
      return '';
    }
    if (this.jed === undefined) {
      return text;
    }
    return this.jed.translate(text).fetch(...substitutions);
  }
}
