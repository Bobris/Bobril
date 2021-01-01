type RuleBehaviourType = "not" | "only";

type MediaType = "all" | "print" | "screen" | "speech";

type LogicalToken = "and" | "or";

type MediaQueryToken = {
    type: MediaType | LogicalToken | RuleBehaviourType;
};

type RangeRuleWithUnitToken = {
    type: "max-height" | "min-height" | "max-width" | "min-width";
    value: number;
    unit: "px" | "em";
};

type RangeRuleToken = {
    type: "min-color";
    value: number;
};

type OrientationRuleToken = {
    type: "orientation";
    value: "landscape" | "portrait";
};

type AspectRuleToken = {
    type: "aspect-ratio";
    height: number;
    width: number;
};

type BoolRuleToken = {
    type: "color";
};

type TokenType = MediaQueryTokens | MediaQueryToken;

export type MediaQueryTokens =
    | RangeRuleWithUnitToken
    | RangeRuleToken
    | OrientationRuleToken
    | AspectRuleToken
    | BoolRuleToken;

interface RuleBuilder {
    rule(behaviour?: RuleBehaviourType, mediaType?: MediaType): RuleEnhancer;
}

interface RuleEnhancer {
    and(mediaRule: MediaQueryTokens): RuleEnhancer;
    or(): RuleBuilder;
    build(): string;
}

class MediaRuleBuilder {
    tokens: TokenType[] = [];

    pushOptionalTokens<T extends RuleBehaviourType>(
        behaviour?: T,
        mediaType?: T extends undefined ? undefined : MediaType
    ) {
        !!behaviour && this.tokens.push({ type: behaviour });
        !!mediaType && this.tokens.push({ type: mediaType });
    }

    rule(behaviour?: RuleBehaviourType, mediaType: MediaType = "all"): RuleEnhancer {
        this.pushOptionalTokens(behaviour, mediaType);
        return this;
    }

    and(mediaRule: MediaQueryTokens): RuleEnhancer {
        this.tokens.push({ type: "and" });
        this.tokens.push(mediaRule);
        return this;
    }

    or(): RuleBuilder {
        this.tokens.push({ type: "or" });
        return this;
    }

    build(): string {
        return this.tokens.reduce(toRule, "");
    }
}

function toRule(buffer: string, token: TokenType) {
    let str: string = "";
    switch (token.type) {
        case "aspect-ratio":
            str = `(${token.type}: ${token.width}/${token.height})`;
            break;
        case "all":
        case "and":
        case "not":
        case "only":
        case "print":
        case "screen":
        case "speech":
            str = `${token.type}`;
            break;
        case "or":
            str = ",";
            break;
        case "color":
            str = `(${token.type})`;
            break;
        case "max-height":
        case "max-width":
        case "min-height":
        case "min-width":
            str = `(${token.type}: ${token.value}${token.unit})`;
            break;
        case "min-color":
        case "orientation":
            str = `(${token.type}: ${token.value})`;
            break;
        default:
            str = emptyQuery(token);
    }

    return buffer + str + " ";
}

function emptyQuery(_token: never) {
    return "";
}

export function createMediaQuery(): RuleBuilder {
    return new MediaRuleBuilder();
}
