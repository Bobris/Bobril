/// <reference path="bobril.promise.d.ts"/>

interface IL10NConfig {
    defaultLocale?: string;
    pathToIntlJs?: string;
    pathToIntlLocaleDataJsonp?: string;
    pathToIntlMessageFormatJs?: string;
    pathToIntlMessageFormatLocaleData?: string;
    pathToTranslation?: (locale: string) => string;
}

interface IBobrilStatic {
    t?(message: string | number, params?: Object, translationHelp?: string): string;
    // This must be called before b.init or b.routes
    initLocalization?(config?: IL10NConfig): Promise<any>;
    setLocale?(locale: string): Promise<any>;
    getLocale?(): string;
    registerTranslations?(locale: string, msgs: string[]): void;
    jsonp?(url: string): Promise<any>;
}
