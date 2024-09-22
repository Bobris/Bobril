import { cva, style, VariantProps } from "../index";

describe("cva", () => {
    it("simple string case", () => {
        const spec = cva({
            base: "base",
            variants: {
                size: {
                    small: "size-small",
                    medium: "size-medium",
                    large: "size-large",
                },
            },
            defaultVariants: {
                size: "medium",
            },
        });
        expect(style({}, spec()).className).toBe("base size-medium");
        expect(style({}, spec({ size: undefined })).className).toBe("base size-medium");
        expect(style({}, spec({ size: "medium" })).className).toBe("base size-medium");
        expect(style({}, spec({ size: "small" })).className).toBe("base size-small");
        expect(style({}, spec({ size: "large" })).className).toBe("base size-large");
        expect(style({}, spec({ style: "my" })).className).toBe("base size-medium my");
    });

    it("simple boolean case", () => {
        const spec = cva({
            base: "base",
            variants: {
                disabled: {
                    true: "disabled",
                },
            },
            defaultVariants: {
                disabled: false,
            },
        });
        expect(style({}, spec()).className).toBe("base");
        expect(style({}, spec({ disabled: undefined })).className).toBe("base");
        expect(style({}, spec({ disabled: false })).className).toBe("base");
        expect(style({}, spec({ disabled: true })).className).toBe("base disabled");
    });

    it("string and number case", () => {
        const spec = cva({
            base: "base",
            variants: {
                size: {
                    small: "size-small",
                    medium: "size-medium",
                    large: "size-large",
                },
                width: {
                    100: "width-10",
                    200: "width-20",
                },
            },
            defaultVariants: {
                size: "medium",
                width: 100,
            },
        });
        expect(style({}, spec()).className).toBe("base size-medium width-10");
        expect(style({}, spec({ size: undefined })).className).toBe("base size-medium width-10");
        expect(style({}, spec({ width: undefined })).className).toBe("base size-medium width-10");
        expect(style({}, spec({ size: "medium" })).className).toBe("base size-medium width-10");
        expect(style({}, spec({ width: 100 })).className).toBe("base size-medium width-10");
        expect(style({}, spec({ size: "small" })).className).toBe("base size-small width-10");
        expect(style({}, spec({ width: 200 })).className).toBe("base size-medium width-20");
        expect(style({}, spec({ size: "large" })).className).toBe("base size-large width-10");
        expect(style({}, spec({ size: "large", width: 200 })).className).toBe("base size-large width-20");
    });

    it("compound case", () => {
        const spec = cva({
            base: "base",
            variants: {
                size: {
                    small: "size-small",
                    medium: "size-medium",
                    large: "size-large",
                },
                width: {
                    100: "width-10",
                    200: "width-20",
                },
            },
            compoundVariants: [
                {
                    size: "small",
                    width: 200,
                    style: "small-width-20",
                },
                {
                    size: ["medium", "large"],
                    width: 100,
                    style: "medium-or-large-width-10",
                },
            ],
            defaultVariants: {
                size: "medium",
                width: 100,
            },
        });
        expect(style({}, spec()).className).toBe("base size-medium width-10 medium-or-large-width-10");
        expect(style({}, spec({ size: "small" })).className).toBe("base size-small width-10");
        expect(style({}, spec({ width: 200 })).className).toBe("base size-medium width-20");
        expect(style({}, spec({ size: "small", width: 200 })).className).toBe(
            "base size-small width-20 small-width-20",
        );
        expect(style({}, spec({ size: "large", width: 100 })).className).toBe(
            "base size-large width-10 medium-or-large-width-10",
        );
        expect({ size: "large", width: 100 } satisfies VariantProps<typeof spec>).toBeTruthy();
    });
});
