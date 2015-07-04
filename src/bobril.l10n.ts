/// <reference path="bobril.d.ts"/>
/// <reference path="bobril.l10n.d.ts"/>

interface IIntlMessageFormat {
    format(params?: Object): string;
}

declare const IntlMessageFormat: any;

((b: IBobrilStatic, window: Window, document: Document) => {
    function jsonp(url: string): Promise<any> {
        return new Promise((r, e) => {
            let script = document.createElement('script');
            script.type = 'text/javascript';
            script.charset = 'utf-8';
            script.onload = () => {
                r();
            };
            script.onerror = (ev) => {
                e('Failed to load ' + url);
            };
            script.src = url;
            document.head.appendChild(script);
        });
    }

    let cfg: IL10NConfig = {};
    let loadedLocales: { [name: string]: boolean } = Object.create(null);
    let registeredTranslations: { [name: string]: string[] } = Object.create(null);
    let initWasStarted = false;
    let needIntlPolyfill = false;
    let currentLocale = '';
    let currentTranslations: string[] = [];
    let currentCachedFormat: IIntlMessageFormat[] = [];
    let stringCachedFormats: { [input: string]: IIntlMessageFormat } = Object.create(null);

    function currentTranslationMessage(message: number): string {
        let text = currentTranslations[message];
        if (text === undefined) {
            throw new Error('message ' + message + ' is not defined');
        }
        return text;
    }

    function t(message: string | number, params?: Object, translationHelp?: string): string {
        if (currentLocale.length === 0) {
            throw new Error('before using t you need to wait for initialization of l10n');
        }
        let format: IIntlMessageFormat;
        if (typeof message === 'number') {
            if (params == null) {
                return currentTranslationMessage(message);
            }
            format = currentCachedFormat[message];
            if (format === undefined) {
                format = new IntlMessageFormat(currentTranslationMessage(message), currentLocale);
                currentCachedFormat[message] = format;
            }
        } else {
            if (params == null) return message;
            format = stringCachedFormats[message];
            if (format === undefined) {
                format = new IntlMessageFormat(message, currentLocale);
                stringCachedFormats[message] = format;
            }
        }
        return format.format(params);
    }

    function initLocalization(config?: IL10NConfig): Promise<any> {
        if (initWasStarted) {
            throw new Error('initLocalization must be called only once');
        }
        cfg = config;
        initWasStarted = true;
        var prom = Promise.resolve<any>(null);
        if (!(<any>window).Intl) {
            needIntlPolyfill = true;
            if (config.pathToIntlJs) prom = Promise.all<any>([prom, jsonp(config.pathToIntlJs)]);
        }
        if (config.pathToIntlMessageFormatJs) {
            prom = Promise.all<any>([prom, jsonp(config.pathToIntlMessageFormatJs)]);
        }
        prom = prom.then(() => setLocale(config.defaultLocale || 'en'));
        b.setBeforeInit((cb) => {
            prom.then(cb);
        });
        return prom;
    }

    function setLocale(locale: string): Promise<any> {
        let prom = Promise.resolve(null);
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
        prom = prom.then(() => {
            currentLocale = locale;
            currentTranslations = registeredTranslations[locale];
            currentCachedFormat = [];
            currentCachedFormat.length = currentTranslations.length;
        });
        return prom;
    }

    function getLocale(): string {
        return currentLocale;
    }

    function registerTranslations(locale: string, msgs: string[]): void {
        registeredTranslations[locale] = msgs;
    }

    b.jsonp = jsonp;
    b.t = t;
    b.initLocalization = initLocalization;
    b.setLocale = setLocale;
    b.getLocale = getLocale;
    b.registerTranslations = registerTranslations;
    (<any>window)['bobrilRegisterTranslations'] = registerTranslations;
})(b, window, document);
