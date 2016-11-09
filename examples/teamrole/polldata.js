var langresources = {
    'cz': {
        'Title': 'Moje role v týmu',
        'Questions': 'Otázky',
        'Result': 'Výsledek',
        'Previous': 'Předchozí',
        'Next': 'Další',
        'NoData': 'Bez odpovědí nejsou výsledky.'
    },
    'en': {
        'Title': 'My team roles',
        'NoData': 'No answers no data.'
    }
};
var roledata = [
    { id: 1, cz: 'Realizátor', en: 'Implementer' },
    { id: 2, cz: 'Koordinátor', en: 'Coordinator' },
    { id: 3, cz: 'Formovač', en: 'Former' },
    { id: 4, cz: 'Myslitel', en: 'Thinker' },
    { id: 5, cz: 'Vyhledavač', en: 'Searcher' },
    { id: 6, cz: 'Kontrolor', en: 'Supervisor' },
    { id: 7, cz: 'Týmový hráč', en: 'Team player' },
    { id: 8, cz: 'Kompletovač', en: 'Assembler' }
];
var polldata = [
    {
        cz: "Co podle mého názoru může být mým přínosem pro tým?",
        en: "What in my opinion could be my contribution to the team?",
        answers: [
            {
                role: 5,
                cz: "Myslím si, že dovedu rychle postřehnout a využít nové příležitosti.",
                en: "I think that I can quickly discern and exploit new opportunities."
            },
            {
                role: 7,
                cz: "Dokáži dobře spolupracovat s velikým spektrem lidí.",
                en: "I can work well with a great range of people."
            },
            {
                role: 4,
                cz: "Tvorba nápadů je jednou z mých přirozených kladných stránek.",
                en: "Creating ideas is one of my natural positive aspects."
            },
            {
                role: 2,
                cz: "Jsem schopen dostat z lidí všechno, když zjistím, že mají něco cenného, čím by mohli přispět k cílům skupiny.",
                en: "I'm able to get everything out of people when I find that they have something valuable, what they could contribute to the aims of the group."
            },
            {
                role: 8,
                cz: "Moje schopnost být důsledný velice úzce souvisí s mou osobní efektivitou.",
                en: "My ability to be consistent is closely related to my personal effectiveness."
            },
            {
                role: 3,
                cz: "Jsem ochoten čelit dočasné neoblíbenosti, pokud konečné výsledky stojí zato.",
                en: "I am ready to face temporary unpopularity if the end results are worth it."
            },
            {
                role: 1,
                cz: "Rychle vycítím, co pravděpodobně zabere v situaci, kterou znám.",
                en: "Quickly spot what is likely to take in the situation, I know."
            },
            {
                role: 6,
                cz: "Dokážu předložit opodstatněné důvody pro alternativní směry jednání bez zaujatosti nebo předsudků.",
                en: "I can provide reasonable grounds for an alternative course of action without bias or prejudice."
            }
        ]
    },
    {
        cz: "Mám-li nedostatek týmové práce, je možné, že:",
        en: "If I have a lack of teamwork, it is possible that:",
        answers: [
            {
                role: 1,
                cz: "Nejsem spokojen, když schůze nemají vhodnou strukturu, nejsou řízeny ani všeobecně vedeny.",
                en: "I'm not satisfied, if the meeting not suitable structure not controlled nor universally held."
            },
            {
                role: 2,
                cz: "Mám sklon být příliš dobrosrdečný k lidem, kteří mají platný názor a nebyli přiměřeně vyslechnuti.",
                en: "I tend to be too soft-hearted to people who have a valid opinion and were not adequately heard."
            },
            {
                role: 5,
                cz: "Mám tendenci mnoho povídat, když skupina přejde k novým nápadům.",
                en: "I tend to talk a lot, when the group moves on to new ideas."
            },
            {
                role: 6,
                cz: "Můj objektivní pohled způsobuje, že je pro mě těžké ochotně a s entuziasmem dělat něco společně s kolegy.",
                en: "My objective view makes it hard for me to willingly and enthusiastically to do something together with my colleagues."
            },
            {
                role: 3,
                cz: "Je-li potřebné dosáhnout toho, aby se něco vykonalo, považují mě někdy za příliš důrazného a autoritářského.",
                en: "When is necessary to achieve that something is done, others consider me sometimes too strong and authoritarian."
            },
            {
                role: 7,
                cz: "Považuji za obtížné vést zepředu, snad proto, že jsem příliš citlivý na atmosféru skupiny.",
                en: "I find it difficult to lead from the front, perhaps because I'm too sensitive to the atmosphere of the group."
            },
            {
                role: 4,
                cz: "Mám sklon příliš se zabývat vlastními nápady a ztratit přehled o tom, co se děje.",
                en: "I tend to deal with my own ideas and lose track of what is happening."
            },
            {
                role: 8,
                cz: "Mí kolegové si myslí, že si zbytečně dělám starosti s detaily a s možností, že věci špatně dopadnou.",
                en: "My colleagues think that I'm unnecessarily worried about the details and the possibility that things would end badly."
            }
        ]
    },
    {
        cz: "Když jsem zapojen do projektu s jinými lidmi:",
        en: "When I'm involved in a project with other people:",
        answers: [
            {
                role: 2,
                cz: "Mám schopnost ovlivňovat lidi bez toho, že bych na ně činil nátlak.",
                en: "I have the ability to influence people without putting them under pressure."
            },
            {
                role: 8,
                cz: "Moje všeobecná důkladnost brání tomu, aby se udělaly chyby z nepozornosti, a aby se na něco zapomnělo.",
                en: "My general thoroughness precludes making careless mistakes, and that something was forgotten."
            },
            {
                role: 3,
                cz: "Jsem připravený naléhat, aby se na jednání neztrácel čas, nebo aby se neztratil ze zřetele hlavní cíl.",
                en: "I'm ready to insist not waste time on meeting, or not to lose sight of the main goal."
            },
            {
                role: 4,
                cz: "Lze se mnou počítat, že přispěji něčím originálním.",
                en: "You can count on me to contribute something original."
            },
            {
                role: 7,
                cz: "Jsem vždy ochoten podpořit dobrý návrh ve společném zájmu.",
                en: "I am always willing to support a good suggestion in the common interest."
            },
            {
                role: 5,
                cz: "Dychtivě vyhledávám nejnovější myšlenky a sleduji vývoj.",
                en: "Eagerly seek out the latest ideas and watch developments."
            },
            {
                role: 6,
                cz: "Domnívám se, že mé schopnosti chladného úsudku si ostatní váží.",
                en: "I believe that my ability to cool the judgment of others weigh."
            },
            {
                role: 1,
                cz: "Dá se spolehnout, že dohlédnu na to, aby se zorganizovaly všechny podstatné práce.",
                en: "We can be confident that I will see to it that all the essential work is organized."
            }
        ]
    },
    {
        cz: "Můj přístup ke skupinové práci je charakteristický tím, že:",
        en: "My approach to group work is characterized in that:",
        answers: [
            {
                role: 7,
                cz: "Mám tichý zájem poznat kolegy.",
                en: "I am interested in meeting fellows."
            },
            {
                role: 3,
                cz: "Neváhám vznášet námitky proti názorům jiných lidí nebo zastávat menšinový názor.",
                en: "I do not hesitate to raise objections to the opinions of others or to hold a minority view."
            },
            {
                role: 6,
                cz: "Obvykle najdu řadu argumentů na vyvracení nerozumných návrhů.",
                en: "I can usually find a number of arguments to the rebuttal unreasonable proposals."
            },
            {
                role: 1,
                cz: "Myslím, že mám talent dát věci do pohybu, když se musí realizovat nějaký plán.",
                en: "I think I have talent to get things going when they have to implement a plan."
            },
            {
                role: 4,
                cz: "Mám tendenci vyhýbat se samozřejmým věcem a přicházet s netradičními.",
                en: "I tend to avoid the obvious things and come up with unconventional."
            },
            {
                role: 8,
                cz: "Přináším perfekcionismus do každé týmové práce, na které se podílím.",
                en: "I bring perfection to every team work, which I participate."
            },
            {
                role: 3,
                cz: "Jsem připraven využít kontakty mimo samotné skupiny.",
                en: "I am ready to take advantage of contacts outside the group itself."
            },
            {
                role: 2,
                cz: "I když mám zájem o všechny názory, je-li zapotřebí, umím se bez váhání rozhodnout.",
                en: "Although I am interested in all opinions, if needed, I can decide without hesitation."
            }
        ]
    },
    {
        cz: "Práce mě uspokojuje, protože:",
        en: "The work makes me happy, because:",
        answers: [
            {
                role: 6,
                cz: "Rád analyzuji situaci a zvažuji všechny možnosti.",
                en: "I like to analyze the situation and considering all options."
            },
            {
                role: 1,
                cz: "Mám zájem o nalezení praktických řešení problémů.",
                en: "I am interested in finding practical solutions to problems."
            },
            {
                role: 7,
                cz: "Mám rád pocit, že podporuji dobré pracovní vztahy.",
                en: "I love the feeling that I support a good working relationship."
            },
            {
                role: 3,
                cz: "Mohu mít silný vliv na rozhodování.",
                en: "I can have a strong influence on decision-making."
            },
            {
                role: 5,
                cz: "Setkávám se s lidmi, kteří mohou nabídnout něco nového.",
                en: "I meet with people who can offer something new."
            },
            {
                role: 2,
                cz: "Mohu lidi přesvědčit, abychom se dohodli na potřebných akcích.",
                en: "I can convince people to agree on the necessary actions."
            },
            {
                role: 8,
                cz: "Cítím se ve svém živlu, když mohu věnovat úkolu plnou pozornost.",
                en: "I feel in my element when I can devote full attention to the task."
            },
            {
                role: 4,
                cz: "Rád nacházím oblasti, které rozšiřují moji představivost.",
                en: "I like finding the area, which extends my imagination."
            }
        ]
    },
    {
        cz: "Pokud bych náhle dostal těžký úkol s omezeným časem a neznámými lidmi:",
        en: "If I suddenly got a difficult task with limited time and unfamiliar people:",
        answers: [
            {
                role: 4,
                cz: "Zpočátku bych rád trochu ustoupil, abych vymyslel cestu ze slepé uličky a rozpracoval plán.",
                en: "Initially, I would like a little retreat, I devised a way out of the impasse and developed a plan."
            },
            {
                role: 7,
                cz: "Byl bych ochoten spolupracovat s osobou, která by ukázala nejpozitivnější přístup, bez ohledu na to, jak těžce by se mi s ní vycházelo.",
                en: "I would be willing to cooperate with the person who would show the most positive attitude, no matter how difficult it would be to me it was based."
            },
            {
                role: 2,
                cz: "Našel bych nějaký způsob na zjednodušení úkolu a určil bych, jak mohou nejlépe k jeho řešení přispět různí jedinci.",
                en: "I'd find a way to simplify the task and would determine how they can best contribute to the solution of different individuals."
            },
            {
                role: 8,
                cz: "Můj přirozený smysl pro naléhavé úkoly by mi pomohl zajistit, abychom dodržovali harmonogram.",
                en: "My natural sense of urgent tasks would help me ensure that we comply with the schedule."
            },
            {
                role: 6,
                cz: "Domnívám se, že bych si udržel chladnou mysl a schopnost přímočarého myšlení.",
                en: "I believe that I can keep a cool mind and ability to think rightly."
            },
            {
                role: 1,
                cz: "Navzdory tlakům bych zachovával pevný kurz.",
                en: "Despite the pressures, I maintained a fixed direction."
            },
            {
                role: 3,
                cz: "Kdybych měl pocit, že skupina nepostupuje kupředu, byl bych připraven převzít pozitivní vedení.",
                en: "If I had the feeling that the group does not proceed forward, I would be ready to take positive leadership."
            },
            {
                role: 5,
                cz: "Otevřel bych diskusí se záměrem stimulovat nové myšlenky a uvést věci do pohybu.",
                en: "I opened discussions with the intention of stimulating new ideas and to get things moving."
            }
        ]
    },
    {
        cz: "Pokud jde o problémy kterým jsem vystaven při práci ve skupině",
        en: "Regarding the problems which I am exposed while working in a group",
        answers: [
            {
                role: 3,
                cz: "Jsem schopen projevit netrpělivost, pokud někdo stěžuje pohyb vpřed.",
                en: "I am able to express impatience when someone complains move forward."
            },
            {
                role: 6,
                cz: "Ostatní mě možná kritizují za to, že jsem příliš analytický a málo intuitivní.",
                en: "Others may criticize me for it, I'm too analytical and less intuitive."
            },
            {
                role: 8,
                cz: "Moje touha zabezpečit odpovídající kvalitu přáce může zdržovat postup.",
                en: "My desire to ensure adequate quality of work may delay the process."
            },
            {
                role: 5,
                cz: "Lehce ztratím zájem a spoléhám na jednoho nebo dva stimulující členy skupiny, kteří mě dokáží nadchnout.",
                en: "Easily lose interest and rely on one or two stimulating members of the group who can motivate me."
            },
            {
                role: 1,
                cz: "Považuji za těžké něco začít, pokud cíle nejsou jasné.",
                en: "I find it hard to start when the objectives are not clear."
            },
            {
                role: 4,
                cz: "Někdy nedovedu něco dobře vysvětlit a objasnit složité otázky.",
                en: "Sometimes I can not explain something well and clarify complex issues."
            },
            {
                role: 2,
                cz: "Uvědomuji si, že od jiných žádám věci, které nedovedu udělat sám.",
                en: "I realize that I ask from other things that I can not do it alone."
            },
            {
                role: 7,
                cz: "Váhám při prosazování svých názorů, když narazím na skutečný odpor.",
                en: "I hesitate in promoting my opinions, when encounter real resistance."
            }
        ]
    }
];
