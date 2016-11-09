/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.onchange.d.ts"/>
/// <reference path="../../src/bobril.router.d.ts"/>
/// <reference path="../../src/bobril.mouse.d.ts"/>
/// <reference path="../../src/bobril.vg.d.ts"/>
/// <reference path="polldata.ts"/>
var TeamRolePoll;
(function (TeamRolePoll) {
    function h(tag) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return { tag: tag, children: args };
    }
    var NotFound = {
        render: function (ctx, me) {
            me.tag = "div";
            me.children = h("p", "This page does not exist please continue by clicking links above");
        }
    };
    var PollPage = {
        render: function (ctx, me) {
            me.tag = "div";
            me.children = [
                ctx.data.questions.map(function (question, index) {
                    return h("div", b.link(h("a", question[ctx.cfg.lang]), "question", { idx: '' + index }));
                }),
                h("div", me.data.activeRouteHandler())
            ];
        }
    };
    var OnChangeComponent = {
        onChange: function (ctx, v) {
            ctx.data.onChange(v);
        }
    };
    function rangeInput(value, onChange) {
        return {
            tag: "input",
            //style: 'float:left',
            attrs: { 'type': 'range', min: '0', max: '10', value: value },
            data: { onChange: onChange },
            component: OnChangeComponent
        };
    }
    var Answer = {
        render: function (ctx, me) {
            me.tag = "div";
            me.style = "padding:10px 10px 10px 10px";
            if (ctx.data.isEven)
                me.className = "even";
            me.children = [
                ctx.data.answer, ' [' + ctx.data.value + ']', h("br"),
                rangeInput(ctx.data.value, ctx.data.onChange)
            ];
        }
    };
    function createAnswerKey(qindex, aindex) {
        return 100 * qindex + aindex;
    }
    function createHandler(answers, qindex, aindex) {
        return function (v) {
            answers[createAnswerKey(qindex, aindex)] = v;
            b.invalidate();
        };
    }
    function getAnswerValue(answers, qindex, aindex) {
        var key = createAnswerKey(qindex, aindex);
        if (key in answers)
            return answers[key];
        return 0;
    }
    function evaluteResult(questions, answers) {
        var maxAnswers = 10;
        var rolePoints = ({});
        questions.map(function (q, qidx) {
            var weight = 0;
            for (var aidx = 0; aidx < maxAnswers; aidx++) {
                weight += +getAnswerValue(answers, qidx, aidx);
            }
            weight = weight != 0 ? 10 / weight : 1;
            for (aidx = 0; aidx < maxAnswers; aidx++) {
                var val = +getAnswerValue(answers, qidx, aidx) * weight;
                if (val == 0)
                    continue;
                var role = questions[qidx].answers[aidx].role;
                if (role in rolePoints)
                    rolePoints[role] += val;
                else
                    rolePoints[role] = val;
            }
        });
        var idPointsArray = new Array();
        for (var r in rolePoints) {
            if (rolePoints.hasOwnProperty(r)) {
                idPointsArray.push({ id: r, value: rolePoints[r] });
            }
        }
        return idPointsArray.sort(function (a, b) {
            if (a.value < b.value)
                return 1;
            if (a.valueOf > b.value)
                return -1;
            return 0;
        });
    }
    function localize(key, lang) {
        if (key in langresources[lang])
            return langresources[lang][key];
        return key;
    }
    var QuestionPage = {
        render: function (ctx, me) {
            var idx = +ctx.data.routeParams.idx;
            var question = polldata[idx];
            var lang = ctx.cfg.lang;
            me.tag = "div";
            me.children = [
                h("h3", question[lang]),
                h("ul", question.answers.map(function (ans, ansIdx) {
                    return h("li", {
                        component: Answer,
                        data: {
                            answer: ans[lang],
                            value: getAnswerValue(ctx.data.poll.answers, idx, ansIdx),
                            onChange: createHandler(ctx.data.poll.answers, idx, ansIdx),
                            isEven: (ansIdx % 2 != 0)
                        }
                    });
                })),
                idx > 0
                    ? b.link(h("a", " " + localize('Previous', lang) + " "), "question", { idx: '' + (idx - 1) })
                    : h("span"),
                (idx + 1) < polldata.length
                    ? b.link(h("a", " " + localize('Next', lang) + " "), "question", { idx: '' + (idx + 1) })
                    : b.link(h("a", localize('Result', lang)), "result")
            ];
        }
    };
    function getRoleName(roles, lang, id) {
        for (var idx = 0; idx < roles.length; idx++) {
            if (roles[idx].id == id)
                return roles[idx][lang];
        }
        return "?";
    }
    function createBar(value) {
        return {
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
        };
    }
    var ResultPage = {
        render: function (ctx, me) {
            me.tag = "div";
            var rolepoints = evaluteResult(ctx.data.poll.questions, ctx.data.poll.answers);
            var sum = rolepoints.reduce(function (prev, current) { return (current.value) + prev; }, 0);
            var lang = ctx.cfg.lang;
            if (rolepoints.length == 0)
                me.children = [h("p", localize('NoData', lang))];
            else
                me.children = [
                    h("table", rolepoints.map(function (r) {
                        return h("tr", h("td", getRoleName(ctx.data.poll.role, lang, r.id)), h("td", Math.round(r.value * 100 / sum) + '%'), h("td", createBar(r.value)));
                    }))
                ];
        }
    };
    var ActionButton = {
        render: function (ctx, me) {
            me.tag = "button";
            me.style = ctx.data.active ? 'background-color:#00BB11;' : '';
            me.children = ctx.data.label;
        },
        onClick: function (ctx, event) {
            ctx.data.perform();
            return true;
        }
    };
    var cfg = {
        lang: 'cz'
    };
    function switchLanguage(lang) {
        cfg.lang = lang;
        b.invalidate();
    }
    var App = {
        init: function (ctx) {
            ctx.cfg = cfg;
        },
        render: function (ctx, me) {
            me.tag = "div";
            var lang = ctx.cfg.lang;
            me.children = [
                h("h1", localize('Title', lang)),
                me.data.activeRouteHandler(),
                h("p", b.link(h("a", localize('Questions', lang)), "questions"), " ", b.link(h("a", localize('Result', lang)), "result")),
                {
                    component: ActionButton,
                    data: {
                        label: "CZ",
                        active: lang == "cz",
                        perform: function () { return switchLanguage("cz"); }
                    }
                },
                {
                    component: ActionButton,
                    data: {
                        label: "EN",
                        active: lang == "en",
                        perform: function () { return switchLanguage("en"); }
                    }
                }
            ];
        }
    };
    var pollData = {
        questions: polldata,
        role: roledata,
        answers: {}
    };
    b.routes(b.route({ handler: App, data: { poll: pollData } }, [
        b.route({ name: "questions", data: { questions: pollData.questions }, handler: PollPage }),
        b.route({
            name: "question", url: "/question/:idx", data: { poll: pollData },
            handler: QuestionPage, keyBuilder: function (p) { return p["idx"]; }
        }),
        b.route({ name: "result", data: { poll: pollData }, handler: ResultPage }),
        b.routeDefault({ handler: PollPage, data: { questions: pollData.questions } }),
        b.routeNotFound({ name: "notFound", handler: NotFound })
    ]));
})(TeamRolePoll || (TeamRolePoll = {}));
