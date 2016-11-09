/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.promise.d.ts"/>
/// <reference path="../../src/bobril.l10n.d.ts"/>

module L10nApp {
    b.initLocalization({
        pathToIntlJs: 'Intl.min.js',
        pathToIntlLocaleDataJsonp: 'intldata/',
        pathToIntlMessageFormatJs: 'intl-messageformat.min.js',
        pathToIntlMessageFormatLocaleData: 'intlmfdata/',
        defaultLocale: 'en-US',
        pathToTranslation: (l) => 'translations/' + l + ".js"
    });
    function buttonLocale(name: string) {
        return {
            tag: "button", children: name, component: {
                onClick: () => {
                    b.setLocale(name).then(b.invalidate);
                }
            }
        };
    }
    setInterval(() => b.invalidate(), 1000);
    b.init(() => {
        return [
            { tag: "h1", children: b.t(0) },
            {
                tag: "div", children: b.t(1, {
                    locale: b.getLocale(), time: b.now()
                })
            },
            {
                tag: "div", children: [
                    buttonLocale("en-US"), " ", buttonLocale("cs-CZ")
                ]
            }
        ];
    });
}
