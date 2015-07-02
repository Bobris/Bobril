/// <reference path="bobril.d.ts"/>
/// <reference path="bobril.l10n.d.ts"/>
(function (b, window, document) {
    function jsonp(url) {
        return new Promise(function (r, e) {
            var script = document.createElement('script');
            script.type = 'text/javascript';
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
    function t(message, params, translationHelp) {
        if (currentLocale.length === 0) {
            throw new Error('before using t you need to wait for initialization of l10n');
        }
        var format;
        if (typeof message === 'number') {
            format = currentCachedFormat[message];
            if (format === undefined) {
                var text = currentTranslations[message];
                if (text === undefined) {
                    throw new Error('message ' + message + ' is not defined');
                }
                format = new IntlMessageFormat(text, currentLocale);
                currentCachedFormat[message] = format;
            }
        }
        else {
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
            throw new Error("initLocalization must be called only once");
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
        prom = prom.then(function () { return setLocale(config.defaultLocale || "en"); });
        b.setBeforeInit(function (cb) {
            prom.then(cb);
        });
        return prom;
    }
    function setLocale(locale) {
        var prom = Promise.resolve(null);
        if (loadedLocales[locale])
            return prom;
        loadedLocales[locale] = true;
        prom = Promise.all([
            needIntlPolyfill && cfg.pathToIntlLocaleDataJsonp && jsonp(cfg.pathToIntlLocaleDataJsonp + locale + ".jsonp"),
            cfg.pathToIntlMessageFormatLocaleData && jsonp(cfg.pathToIntlMessageFormatLocaleData + locale.substring(0, 2)),
            cfg.pathToTranslation && jsonp(cfg.pathToTranslation(locale))
        ]);
        return prom;
    }
    function getLocale() {
        return currentLocale;
    }
    function registerTranslations(locale, msgs) {
        registerTranslations[locale] = msgs;
    }
    b.jsonp = jsonp;
    b.t = t;
    b.initLocalization = initLocalization;
    b.setLocale = setLocale;
    b.getLocale = getLocale;
    b.registerTranslations = registerTranslations;
    window.bobrilRegisterTranslations = registerTranslations;
})(b, window, document);
