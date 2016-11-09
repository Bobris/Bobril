/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.onchange.d.ts"/>
/// <reference path="../../src/bobril.router.d.ts"/>
/// <reference path="../../src/bobril.mouse.d.ts"/>
/// <reference path="../../src/bobril.vg.d.ts"/>
/// <reference path="polldata.ts"/>

module TeamRolePoll {
    function h(tag: string, ...args: any[]) {
        return { tag: tag, children: args };
    }

    var NotFound: IBobrilComponent = {
        render(ctx: any, me: IBobrilNode) {
            me.tag = "div";
            me.children = h("p", "This page does not exist please continue by clicking links above");
        }
    }

    var PollPage: IBobrilComponent = {
        render(ctx: any, me: IBobrilNode) {
            me.tag = "div";
            me.children = [
                ctx.data.questions.map((question: any, index: number) => {
                    return h("div", b.link(h("a", question[ctx.cfg.lang]), "question", { idx: '' + index }));
                }),
                h("div", me.data.activeRouteHandler())
            ];
        }
    }

    interface IOnChangeData {
        onChange: (value: any) => void;
    }

    interface IOnChangeCtx {
        data: IOnChangeData;
    }

    var OnChangeComponent: IBobrilComponent = {
        onChange(ctx: IOnChangeCtx, v: any): void {
            ctx.data.onChange(v);
        }
    }

    function rangeInput(value: any, onChange: (value: number) => void): IBobrilNode {
        return {
            tag: "input",
            //style: 'float:left',
            attrs: { 'type': 'range', min: '0', max: '10', value: value },
            data: { onChange: onChange },
            component: OnChangeComponent
        };
    }

    var Answer: IBobrilComponent = {
        render(ctx: any, me: IBobrilNode) {
            me.tag = "div";
            me.style = "padding:10px 10px 10px 10px";
            if (ctx.data.isEven)
                me.className = "even";

            me.children = [
                ctx.data.answer, ' [' + ctx.data.value + ']', h("br"),
                rangeInput(ctx.data.value, ctx.data.onChange)
            ];
        }
    }

    function createAnswerKey(qindex: number, aindex: number) {
        return 100 * qindex + aindex;
    }

    function createHandler(answers: any, qindex: number, aindex: number): (v: number) => void {
        return (v) => {
            answers[createAnswerKey(qindex, aindex)] = v;
            b.invalidate();
        }
    }

    function getAnswerValue(answers: any, qindex: number, aindex: number): number {
        var key = createAnswerKey(qindex, aindex);
        if (key in answers)
            return answers[key];
        return 0;
    }

    function evaluteResult(questions: any, answers: any): Array<any> { //return array roleid:points
        var maxAnswers = 10;
        var rolePoints = <any>({});

        questions.map((q: any, qidx: number) => {
            var weight = 0;
            for (var aidx = 0; aidx < maxAnswers; aidx++) {
                weight += +getAnswerValue(answers, qidx, aidx);
            }
            weight = weight != 0 ? 10 / weight : 1;
            for (aidx = 0; aidx < maxAnswers; aidx++) {
                var val = +getAnswerValue(answers, qidx, aidx) * weight;
                if (val == 0) continue;
                var role = questions[qidx].answers[aidx].role;
                if (role in rolePoints)
                    rolePoints[role] += val;
                else
                    rolePoints[role] = val;
            }
        });

        var idPointsArray = new Array<any>();
        for (var r in rolePoints) {
            if (rolePoints.hasOwnProperty(r)) {
                idPointsArray.push({ id: r, value: rolePoints[r] });
            }
        }
        return idPointsArray.sort((a, b) => {
            if (a.value < b.value)
                return 1;
            if (a.valueOf > b.value)
                return -1;
            return 0;
        });
    }

    function localize(key: string, lang: string) {
        if (key in (<any>langresources)[lang])
            return (<any>langresources)[lang][key];
        return key;
    }

    var QuestionPage: IBobrilComponent = {
        render(ctx: any, me: IBobrilNode) {
            var idx = +ctx.data.routeParams.idx;
            var question = <any>polldata[idx];
            var lang = ctx.cfg.lang;
            me.tag = "div";
            me.children = [
                h("h3", question[lang]),
                h("ul",
                    question.answers.map((ans: any, ansIdx: number) =>
                        h("li",
                            {
                                component: Answer,
                                data: {
                                    answer: ans[lang],
                                    value: getAnswerValue(ctx.data.poll.answers, idx, ansIdx),
                                    onChange: createHandler(ctx.data.poll.answers, idx, ansIdx),
                                    isEven: (ansIdx % 2 != 0)
                                }
                            }))),
                idx > 0
                    ? b.link(h("a", " " + localize('Previous', lang) + " "), "question", { idx: '' + (idx - 1) })
                    : h("span"),
                (idx + 1) < polldata.length
                    ? b.link(h("a", " " + localize('Next', lang) + " "), "question", { idx: '' + (idx + 1) })
                    : b.link(h("a", localize('Result', lang)), "result")
            ];
        }
    }

    function getRoleName(roles: any, lang: string, id: number): string {
        for (var idx = 0; idx < roles.length; idx++) {
            if (roles[idx].id == id)
                return roles[idx][lang];
        }
        return "?";
    }

    function createBar(value: number): IBobrilNode {
        return <any>{
            component: b.vg,
            data: { width: "150px", height: "30px" },
            children: [
                {
                    data: {
                        path: ["rect", 0, 0, 3 * value, 20],
                        fill: "#00BB11",
                    }
                }
            ]
        }
    }

    var ResultPage: IBobrilComponent = {
        render(ctx: any, me: IBobrilNode) {
            me.tag = "div";
            var rolepoints = evaluteResult(ctx.data.poll.questions, ctx.data.poll.answers);
            var sum = rolepoints.reduce((prev, current) => (current.value) + prev, 0);
            var lang = ctx.cfg.lang;
            if (rolepoints.length == 0)
                me.children = [h("p", localize('NoData', lang))];
            else
                me.children = [
                    h("table", rolepoints.map(r =>
                        h("tr",
                            h("td", getRoleName(ctx.data.poll.role, lang, r.id)),
                            h("td", Math.round(r.value * 100 / sum) + '%'),
                            h("td", createBar(r.value)))))
                ];
        }
    }

    interface IButtonData {
        label: string;
        perform: () => void;
        active: boolean;
    }

    interface IButtonCtx {
        data: IButtonData;
    }

    var ActionButton: IBobrilComponent = {
        render(ctx: IButtonCtx, me: IBobrilNode): void {
            me.tag = "button";
            me.style = ctx.data.active ? 'background-color:#00BB11;' : '';
            me.children = ctx.data.label;
        },

        onClick(ctx: IButtonCtx, event: IBobrilMouseEvent) {
            ctx.data.perform();
            return true;
        }
    }

    interface IPollData {
        role: any;
        poll: any;
        answers: any;
    }

    var cfg = {
        lang: 'cz'
    }

    function switchLanguage(lang: string) {
        cfg.lang = lang;
        b.invalidate();
    }

    var App: IBobrilComponent = {
        init(ctx: any) {
            ctx.cfg = cfg;
        },

        render(ctx: any, me: IBobrilNode) {
            me.tag = "div";
            var lang = ctx.cfg.lang;
            me.children = [
                h("h1", localize('Title', lang)),
                me.data.activeRouteHandler(),
                h("p",
                    b.link(h("a", localize('Questions', lang)), "questions"), " ",
                    b.link(h("a", localize('Result', lang)), "result")),
                {
                    component: ActionButton,
                    data: {
                        label: "CZ",
                        active: lang == "cz",
                        perform: () => switchLanguage("cz")
                    }
                },
                {
                    component: ActionButton,
                    data: {
                        label: "EN",
                        active: lang == "en",
                        perform: () => switchLanguage("en")
                    }
                }
            ];
        }
    }

    var pollData = {
        questions: polldata,
        role: roledata,
        answers: {}
    };

    b.routes(b.route({ handler: App, data: { poll: pollData }}, [
        b.route({ name: "questions", data: { questions: pollData.questions }, handler: PollPage }),
        b.route({
            name: "question", url: "/question/:idx", data: { poll: pollData },
            handler: QuestionPage, keyBuilder(p: Params) { return p["idx"]; }
        }),
        b.route({ name: "result", data: { poll: pollData }, handler: ResultPage }),
        b.routeDefault({ handler: PollPage, data: { questions: pollData.questions }}),
        b.routeNotFound({ name: "notFound", handler: NotFound })
    ]));
}
