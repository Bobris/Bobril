/// <reference path="bobril.d.ts"/>
/// <reference path="bobril.l10n.d.ts"/>
(function (b, window, document) {
    function jsonp(url) {
        return new Promise(function (r, e) {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.charset = 'utf-8';
            script.onload = function () {
                r();
            };
            script.onerror = function (ev) {
                e('Failed to load ' + url);
            };
            script.src = url;
            document.head.appendChild(script);
        });
    }
    var cfg = {};
    var loadedLocales = Object.create(null);
    var registeredTranslations = Object.create(null);
    var initWasStarted = false;
    var needIntlPolyfill = false;
    var currentLocale = '';
    var currentTranslations = [];
    var currentCachedFormat = [];
    var stringCachedFormats = Object.create(null);
    function currentTranslationMessage(message) {
        var text = currentTranslations[message];
        if (text === undefined) {
            throw new Error('message ' + message + ' is not defined');
        }
        return text;
    }
    function t(message, params, translationHelp) {
        if (currentLocale.length === 0) {
            throw new Error('before using t you need to wait for initialization of l10n');
        }
        var format;
        if (typeof message === 'number') {
            if (params == null) {
                return currentTranslationMessage(message);
            }
            format = currentCachedFormat[message];
            if (format === undefined) {
                format = new IntlMessageFormat(currentTranslationMessage(message), currentLocale);
                currentCachedFormat[message] = format;
            }
        }
        else {
            if (params == null)
                return message;
            format = stringCachedFormats[message];
            if (format === undefined) {
                format = new IntlMessageFormat(message, currentLocale);
                stringCachedFormats[message] = format;
            }
        }
        return format.format(params);
    }
    function initLocalization(config) {
        if (initWasStarted) {
            throw new Error('initLocalization must be called only once');
        }
        cfg = config;
        initWasStarted = true;
        var prom = Promise.resolve(null);
        if (!window.Intl) {
            needIntlPolyfill = true;
            if (config.pathToIntlJs)
                prom = Promise.all([prom, jsonp(config.pathToIntlJs)]);
        }
        if (config.pathToIntlMessageFormatJs) {
            prom = Promise.all([prom, jsonp(config.pathToIntlMessageFormatJs)]);
        }
        prom = prom.then(function () { return setLocale(config.defaultLocale || 'en'); });
        b.setBeforeInit(function (cb) {
            prom.then(cb);
        });
        return prom;
    }
    function setLocale(locale) {
        var prom = Promise.resolve(null);
        if (currentLocale === locale)
            return prom;
        if (!loadedLocales[locale]) {
            loadedLocales[locale] = true;
            prom = Promise.all([
                needIntlPolyfill && cfg.pathToIntlLocaleDataJsonp && jsonp(cfg.pathToIntlLocaleDataJsonp + locale + ".js"),
                cfg.pathToIntlMessageFormatLocaleData && jsonp(cfg.pathToIntlMessageFormatLocaleData + locale.substring(0, 2) + ".js"),
                cfg.pathToTranslation && jsonp(cfg.pathToTranslation(locale))
            ]);
        }
        prom = prom.then(function () {
            currentLocale = locale;
            currentTranslations = registeredTranslations[locale];
            currentCachedFormat = [];
            currentCachedFormat.length = currentTranslations.length;
        });
        return prom;
    }
    function getLocale() {
        return currentLocale;
    }
    function registerTranslations(locale, msgs) {
        registeredTranslations[locale] = msgs;
    }
    b.jsonp = jsonp;
    b.t = t;
    b.initLocalization = initLocalization;
    b.setLocale = setLocale;
    b.getLocale = getLocale;
    b.registerTranslations = registerTranslations;
    window['bobrilRegisterTranslations'] = registerTranslations;
})(b, window, document);
