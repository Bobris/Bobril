import { IBobrilStyles } from "./core";

type OmitUndefined<T> = T extends undefined ? never : T;
type StringToBoolean<T> = T extends "true" | "false" ? boolean : T;

export type VariantProps<Component extends (...args: any) => any> = Omit<
    OmitUndefined<Parameters<Component>[0]>,
    "style"
>;

type CVAConfigBase = { base?: IBobrilStyles };
type CVAVariantShape = Record<string, Record<string, IBobrilStyles>>;
type CVAVariantSchema<V extends CVAVariantShape> = {
    [Variant in keyof V]?: StringToBoolean<keyof V[Variant]> | undefined;
};
type CVAClassProp = {
    style?: IBobrilStyles;
};

export interface CVA {
    <_ extends "cva's generic parameters are restricted to internal use only.", V>(
        config: V extends CVAVariantShape
            ? CVAConfigBase & {
                  variants?: V;
                  compoundVariants?: (V extends CVAVariantShape
                      ? (
                            | CVAVariantSchema<V>
                            | {
                                  [Variant in keyof V]?:
                                      | StringToBoolean<keyof V[Variant]>
                                      | StringToBoolean<keyof V[Variant]>[]
                                      | undefined;
                              }
                        ) &
                            CVAClassProp
                      : CVAClassProp)[];
                  defaultVariants?: CVAVariantSchema<V>;
              }
            : CVAConfigBase & {
                  variants?: never;
                  compoundVariants?: never;
                  defaultVariants?: never;
              },
    ): (props?: V extends CVAVariantShape ? CVAVariantSchema<V> & CVAClassProp : CVAClassProp) => IBobrilStyles;
}

export const cva: CVA = (config) => {
    const { variants, defaultVariants } = config;
    if (variants == undefined) {
        return (props) => [config.base, props?.style];
    }
    const variantKeys = Object.keys(variants);
    const defaultVariantMap = new Map<string, string | number | boolean>();
    if (defaultVariants) {
        for (const key of variantKeys) {
            defaultVariantMap.set(key, defaultVariants[key] as string | number | boolean);
        }
    }
    return (props) => {
        const variantMap = new Map(defaultVariantMap);
        if (props) {
            for (const key of variantKeys) {
                const value = (props as any)[key];
                if (value != undefined) {
                    variantMap.set(key, value);
                }
            }
        }
        let res: IBobrilStyles[] = [config?.base];
        for (let [key, value] of variantMap) {
            if (typeof value === "boolean") {
                value = value ? "true" : "false";
            }
            const varStyle = (variants as any)[key][value];
            if (varStyle != undefined) {
                res.push(varStyle);
            }
        }

        config.compoundVariants?.forEach(
            (cvConfig) =>
                Object.entries(cvConfig).every(([cvKey, cvSelector]) => {
                    const selector = variantMap.get(cvKey);
                    if (selector == undefined) return true;
                    return Array.isArray(cvSelector) ? cvSelector.includes(selector as any) : selector === cvSelector;
                }) && res.push(cvConfig.style),
        );
        res.push(props?.style);
        return res;
    };
};
