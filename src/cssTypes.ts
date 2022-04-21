// CSS Style defs
export type StringHint = string & { zz_ignore_me?: never };

export type NumberHint = number & { zz_ignore_me?: never };

export type CSSValueGeneral = NumberHint | StringHint;

export type CSSGlobalValues =
    | "initial"
    | "inherit"
    | /** combination of `initial` and `inherit` */ "unset"
    | "revert"
    | StringHint;

export type CSSBlendMode =
    | "normal"
    | "multiply"
    | "screen"
    | "overlay"
    | "darken"
    | "lighten"
    | "color-dodge"
    | "color-burn"
    | "hard-light"
    | "soft-light"
    | "difference"
    | "exclusion"
    | "hue"
    | "saturation"
    | "color"
    | "luminosity";

export type CSSBox = "border-box" | "padding-box" | "content-box" | CSSGlobalValues | StringHint;

export type CSSColor = "transparent" | "currentColor" | CSSGlobalValues | StringHint;

export type CSSFlexAlign = "flex-start" | "flex-end" | "center" | "baseline" | "stretch";

export type CSSFontSize =
    | CSSGlobalValues
    | CSSValueGeneral
    | "xx-small"
    | "x-small"
    | "small"
    | "medium"
    | "large"
    | "x-large"
    | "xx-large"
    | "larger"
    | "smaller";

export type CSSLineStyle =
    | StringHint
    | "none"
    | "hidden"
    | "dotted"
    | "dashed"
    | "solid"
    | "double"
    | "groove"
    | "ridge"
    | "inset"
    | "outset";

export type CSSOverflow = "visible" | "hidden" | "scroll" | "clip" | "auto";

export type CSSRepeatStyle = StringHint | "repeat-x" | "repeat-y" | "repeat" | "space" | "round" | "no-repeat";

export type CSSFontWeight =
    | "normal"
    | "bold"
    | "bolder"
    | "lighter"
    | 100
    | 200
    | 300
    | 400
    | 500
    | 600
    | 700
    | 800
    | 900
    | CSSValueGeneral
    | CSSGlobalValues;

export type CSSLazy<T> = T | StringHint | ((styles: CSSInlineStyles, key: string) => T | StringHint);

export type CSSLazyString = CSSLazy<string>;

export type CSSLazyValueGeneral = CSSLazy<CSSValueGeneral>;
/**
 * This interface documents key CSS properties for autocomplete
 */
export interface CSSInlineStyles {
    /**
     * Smooth scrolling on an iPhone. Specifies whether to use native-style scrolling in an element.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-overflow-scrolling
     */
    overflowScrolling?: CSSLazy<"auto" | "touch">;

    /**
     * Aligns a flex container's lines within the flex container when there is extra space in the cross-axis, similar to how justify-content aligns individual items within the main-axis.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/align-content
     */
    alignContent?: CSSLazy<
        "stretch" | "center" | "flex-start" | "flex-end" | "space-between" | "space-around" | "initial" | "inherit"
    >;

    /**
     * Sets the default alignment in the cross axis for all of the flex container's items, including anonymous flex items, similarly to how justify-content aligns items along the main axis.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/align-items
     */
    alignItems?: CSSLazy<CSSFlexAlign>;

    /**
     * Allows the default alignment to be overridden for individual flex items.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/align-self
     */
    alignSelf?: CSSLazy<"auto" | CSSFlexAlign>;

    /**
     * This property allows precise alignment of elements, such as graphics, that do not have a baseline-table or lack the desired baseline in their baseline-table. With the alignment-adjust property, the position of the baseline identified by the alignment-baseline can be explicitly determined. It also determines precisely the alignment point for each glyph within a textual element.
     */
    alignmentAdjust?: CSSLazyValueGeneral;

    /**
     * The alignment-baseline attribute specifies how an object is aligned with respect to its parent.
     * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/alignment-baseline
     */
    alignmentBaseline?: CSSLazy<
        | "auto"
        | "baseline"
        | "before-edge"
        | "text-before-edge"
        | "middle"
        | "central"
        | "after-edge"
        | "text-after-edge"
        | "ideographic"
        | "alphabetic"
        | "hanging"
        | "mathematical"
        | "inherit"
    >;

    /**
     * Shorthand property for animation-name, animation-duration, animation-timing-function, animation-delay,
     * animation-iteration-count, animation-direction, animation-fill-mode, and animation-play-state.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/animation
     */
    animation?: CSSLazyString;

    /**
     * Defines a length of time to elapse before an animation starts, allowing an animation to begin execution some time after it is applied.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/animation-delay
     */
    animationDelay?: CSSLazyValueGeneral;

    /**
     * Defines whether an animation should run in reverse on some or all cycles.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/animation-direction
     */
    animationDirection?: CSSLazy<CSSGlobalValues | "normal" | "alternate" | "reverse" | "alternate-reverse">;

    /**
     * The animation-duration CSS property specifies the length of time that an animation should take to complete one cycle.
     * A value of '0s', which is the default value, indicates that no animation should occur.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/animation-duration
     */
    animationDuration?: CSSLazyString;

    /**
     * Specifies how a CSS animation should apply styles to its target before and after it is executing.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/animation-fill-mode
     */
    animationFillMode?: CSSLazy<"none" | "forwards" | "backwards" | "both">;

    /**
     * Specifies how many times an animation cycle should play.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/animation-iteration-count
     */
    animationIterationCount?: CSSLazy<CSSValueGeneral | "infinite">;

    /**
     * Defines the list of animations that apply to the element.
     * Note: You probably want animationDuration as well
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/animation-name
     */
    animationName?: CSSLazyString;

    /**
     * Defines whether an animation is running or paused.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/animation-play-state
     */
    animationPlayState?: CSSLazyString;

    /**
     * Sets the pace of an animation
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timing-function
     */
    animationTimingFunction?: CSSLazyString;

    /**
     * Allows changing the style of any element to platform-based interface elements or vice versa.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/appearance
     */
    appearance?: CSSLazy<"auto" | "none">;

    /**
     * Determines whether or not the “back” side of a transformed element is visible when facing the viewer.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/backface-visibility
     */
    backfaceVisibility?: CSSLazy<CSSGlobalValues | "visible" | "hidden">;

    /**
     * Shorthand property to set the values for one or more of:
     * background-clip, background-color, background-image,
     * background-origin, background-position, background-repeat,
     * background-size, and background-attachment.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background
     */
    background?: CSSLazyString;

    /**
     * If a background-image is specified, this property determines
     * whether that image's position is fixed within the viewport,
     * or scrolls along with its containing block.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-attachment
     */
    backgroundAttachment?: CSSLazy<"scroll" | "fixed" | "local">;

    /**
     * This property describes how the element's background images should blend with each other and the element's background color.
     * The value is a list of blend modes that corresponds to each background image. Each element in the list will apply to the corresponding element of background-image. If a property doesn’t have enough comma-separated values to match the number of layers, the UA must calculate its used value by repeating the list of values until there are enough.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-blend-mode
     */
    backgroundBlendMode?: CSSLazy<CSSBlendMode>;

    /**
     * Specifies whether an element's background, either the color or image, extends underneath its border.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-clip
     */
    backgroundClip?: CSSLazy<CSSBox | "text">;

    /**
     * Sets the background color of an element.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-color
     */
    backgroundColor?: CSSLazy<CSSColor>;

    /**
     * Sets a compositing style for background images and colors.
     */
    backgroundComposite?: CSSLazyString;

    /**
     * Applies one or more background images to an element. These can be any valid CSS image, including url() paths to image files or CSS gradients.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-image
     */
    backgroundImage?: CSSLazyString;

    /**
     * Specifies what the background-position property is relative to.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-origin
     */
    backgroundOrigin?: CSSLazy<CSSBox>;

    /**
     * Sets the position of a background image.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-position
     */
    backgroundPosition?: CSSLazy<CSSValueGeneral | "top" | "bottom" | "left" | "right" | "center" | CSSGlobalValues>;

    /**
     * Background-repeat defines if and how background images will be repeated after they have been sized and positioned
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-repeat
     */
    backgroundRepeat?: CSSLazy<CSSRepeatStyle>;

    /**
     * Background-size specifies the size of a background image
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-size
     */
    backgroundSize?: CSSLazy<"auto" | "cover" | "contain" | CSSValueGeneral | CSSGlobalValues>;

    /**
     * Shorthand property that defines the different properties of all four sides of an element's border in a single declaration. It can be used to set border-width, border-style and border-color, or a subset of these.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border
     */
    border?: CSSLazyValueGeneral;

    /**
     * Shorthand that sets the values of border-bottom-color,
     * border-bottom-style, and border-bottom-width.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom
     */
    borderBottom?: CSSLazyValueGeneral;

    /**
     * Sets the color of the bottom border of an element.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom-color
     */
    borderBottomColor?: CSSLazy<CSSColor>;

    /**
     * Defines the shape of the border of the bottom-left corner.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom-left-radius
     */
    borderBottomLeftRadius?: CSSLazyValueGeneral;

    /**
     * Defines the shape of the border of the bottom-right corner.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom-right-radius
     */
    borderBottomRightRadius?: CSSLazyValueGeneral;

    /**
     * Sets the line style of the bottom border of a box.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom-style
     */
    borderBottomStyle?: CSSLazy<CSSLineStyle>;

    /**
     * Sets the width of an element's bottom border. To set all four borders, use the border-width shorthand property which sets the values simultaneously for border-top-width, border-right-width, border-bottom-width, and border-left-width.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom-width
     */
    borderBottomWidth?: CSSLazyValueGeneral;

    /**
     * Border-collapse can be used for collapsing the borders between table cells
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-collapse
     */
    borderCollapse?: CSSLazy<"collapse" | "separate" | "inherit">;

    /**
     * The CSS border-color property sets the color of an element's four borders. This property can have from one to four values, made up of the elementary properties:
     *      •       border-top-color
     *      •       border-right-color
     *      •       border-bottom-color
     *      •       border-left-color The default color is the currentColor of each of these values.
     * If you provide one value, it sets the color for the element. Two values set the horizontal and vertical values, respectively. Providing three values sets the top, vertical, and bottom values, in that order. Four values set all for sides: top, right, bottom, and left, in that order.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-color
     */
    borderColor?: CSSLazy<CSSColor>;

    /**
     * Specifies different corner clipping effects, such as scoop (inner curves), bevel (straight cuts) or notch (cut-off rectangles). Works along with border-radius to specify the size of each corner effect.
     */
    borderCornerShape?: CSSLazyValueGeneral;

    /**
     * The property border-image-source is used to set the image to be used instead of the border style. If this is set to none the border-style is used instead.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-image-source
     */
    borderImageSource?: CSSLazyString;

    /**
     * The border-image-width CSS property defines the offset to use for dividing the border image in nine parts, the top-left corner, central top edge, top-right-corner, central right edge, bottom-right corner, central bottom edge, bottom-left corner, and central right edge. They represent inward distance from the top, right, bottom, and left edges.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-image-width
     */
    borderImageWidth?: CSSLazyValueGeneral;

    /**
     * Shorthand property that defines the border-width, border-style and border-color of an element's left border in a single declaration. Note that you can use the corresponding longhand properties to set specific individual properties of the left border — border-left-width, border-left-style and border-left-color.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-left
     */
    borderLeft?: CSSLazyValueGeneral;

    /**
     * The CSS border-left-color property sets the color of an element's left border. This page explains the border-left-color value, but often you will find it more convenient to fix the border's left color as part of a shorthand set, either border-left or border-color.
     * Colors can be defined several ways. For more information, see Usage.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-left-color
     */
    borderLeftColor?: CSSLazy<CSSColor>;

    /**
     * Sets the style of an element's left border. To set all four borders, use the shorthand property, border-style. Otherwise, you can set the borders individually with border-top-style, border-right-style, border-bottom-style, border-left-style.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-left-style
     */
    borderLeftStyle?: CSSLazy<CSSLineStyle>;

    /**
     * Sets the width of an element's left border. To set all four borders, use the border-width shorthand property which sets the values simultaneously for border-top-width, border-right-width, border-bottom-width, and border-left-width.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-left-width
     */
    borderLeftWidth?: CSSLazyValueGeneral;

    /**
     * Allows Web authors to define how rounded border corners are
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-radius
     */
    borderRadius?: CSSLazyValueGeneral;

    /**
     * Shorthand property that defines the border-width, border-style and border-color of an element's right border in a single declaration. Note that you can use the corresponding longhand properties to set specific individual properties of the right border — border-right-width, border-right-style and border-right-color.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-right
     */
    borderRight?: CSSLazyValueGeneral;

    /**
     * Sets the color of an element's right border. This page explains the border-right-color value, but often you will find it more convenient to fix the border's right color as part of a shorthand set, either border-right or border-color.
     * Colors can be defined several ways. For more information, see Usage.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-right-color
     */
    borderRightColor?: CSSLazy<CSSColor>;

    /**
     * Sets the style of an element's right border. To set all four borders, use the shorthand property, border-style. Otherwise, you can set the borders individually with border-top-style, border-right-style, border-bottom-style, border-left-style.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-right-style
     */
    borderRightStyle?: CSSLazy<CSSLineStyle>;

    /**
     * Sets the width of an element's right border. To set all four borders, use the border-width shorthand property which sets the values simultaneously for border-top-width, border-right-width, border-bottom-width, and border-left-width.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-right-width
     */
    borderRightWidth?: CSSLazyValueGeneral;

    /**
     * Specifies the distance between the borders of adjacent cells.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-spacing
     */
    borderSpacing?: CSSLazyValueGeneral;

    /**
     * Sets the style of an element's four borders. This property can have from one to four values. With only one value, the value will be applied to all four borders; otherwise, this works as a shorthand property for each of border-top-style, border-right-style, border-bottom-style, border-left-style, where each border style may be assigned a separate value.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-style
     */
    borderStyle?: CSSLazy<CSSLineStyle>;

    /**
     * Shorthand property that defines the border-width, border-style and border-color of an element's top border in a single declaration. Note that you can use the corresponding longhand properties to set specific individual properties of the top border — border-top-width, border-top-style and border-top-color.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-top
     */
    borderTop?: CSSLazyValueGeneral;

    /**
     * Sets the color of an element's top border. This page explains the border-top-color value, but often you will find it more convenient to fix the border's top color as part of a shorthand set, either border-top or border-color.
     * Colors can be defined several ways. For more information, see Usage.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-top-color
     */
    borderTopColor?: CSSLazy<CSSColor>;

    /**
     * Sets the rounding of the top-left corner of the element.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-top-left-radius
     */
    borderTopLeftRadius?: CSSLazyValueGeneral;

    /**
     * Sets the rounding of the top-right corner of the element.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-top-right-radius
     */
    borderTopRightRadius?: CSSLazyValueGeneral;

    /**
     * Sets the style of an element's top border. To set all four borders, use the shorthand property, border-style. Otherwise, you can set the borders individually with border-top-style, border-right-style, border-bottom-style, border-left-style.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-top-style
     */
    borderTopStyle?: CSSLazy<CSSLineStyle>;

    /**
     * Sets the width of an element's top border. To set all four borders, use the border-width shorthand property which sets the values simultaneously for border-top-width, border-right-width, border-bottom-width, and border-left-width.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-top-width
     */
    borderTopWidth?: CSSLazyValueGeneral;

    /**
     * Sets the width of an element's four borders. This property can have from one to four values. This is a shorthand property for setting values simultaneously for border-top-width, border-right-width, border-bottom-width, and border-left-width.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-width
     */
    borderWidth?: CSSLazyValueGeneral;

    /**
     * This property specifies how far an absolutely positioned box's bottom margin edge is offset above the bottom edge of the box's containing block. For relatively positioned boxes, the offset is with respect to the bottom edges of the box itself (i.e., the box is given a position in the normal flow, then offset from that position according to these properties).
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/bottom
     */
    bottom?: CSSLazyValueGeneral;

    /**
     * Breaks a box into fragments creating new borders, padding and repeating backgrounds or lets it stay as a continuous box on a page break, column break, or, for inline elements, at a line break.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/box-decoration-break
     */
    boxDecorationBreak?: CSSLazy<"slice" | "clone">;

    /**
     * box sizing
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing
     */
    boxSizing?: CSSLazy<CSSGlobalValues | "content-box" | "border-box">;

    /**
     * Box shadow
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow
     */
    boxShadow?: CSSLazyValueGeneral;

    /**
     * The CSS break-after property allows you to force a break on multi-column layouts. More specifically, it allows you to force a break after an element. It allows you to determine if a break should occur, and what type of break it should be. The break-after CSS property describes how the page, column or region break behaves after the generated box. If there is no generated box, the property is ignored.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/break-after
     */
    breakAfter?: CSSLazy<
        | "auto"
        | "avoid"
        | "avoid-page"
        | "page"
        | "left"
        | "right"
        | "recto"
        | "verso"
        | "avoid-column"
        | "column"
        | "avoid-region"
        | "region"
    >;

    /**
     * Control page/column/region breaks that fall above a block of content
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/break-before
     */
    breakBefore?: CSSLazy<
        | "auto"
        | "avoid"
        | "avoid-page"
        | "page"
        | "left"
        | "right"
        | "recto"
        | "verso"
        | "avoid-column"
        | "column"
        | "avoid-region"
        | "region"
    >;

    /**
     * Control page/column/region breaks that fall within a block of content
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/break-inside
     */
    breakInside?: CSSLazy<"auto" | "avoid" | "avoid-page" | "avoid-column" | "avoid-region">;

    /**
     * The caption-side CSS property positions the content of a table's <caption> on the specified side.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/caption-side
     */
    captionSide?: CSSLazy<
        CSSGlobalValues | "top" | "bottom" | "block-start" | "block-end" | "inline-start" | "inline-end"
    >;

    /**
     * The clear CSS property specifies if an element can be positioned next to or must be positioned below the floating elements that precede it in the markup.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/clear
     */
    clear?: CSSLazy<CSSGlobalValues | "none" | "left" | "right" | "both">;

    /**
     * Clipping crops an graphic, so that only a portion of the graphic is rendered, or filled. This clip-rule property, when used with the clip-path property, defines which clip rule, or algorithm, to use when filling the different parts of a graphics.
     * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/clip-rule
     */
    clipRule?: CSSLazyString;

    /**
     * The color property sets the color of an element's foreground content (usually text), accepting any standard CSS color from keywords and hex values to RGB(a) and HSL(a).
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color
     */
    color?: CSSLazy<CSSColor>;

    /**
     * Describes the number of columns of the element.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/column-count
     */
    columnCount?: CSSLazyValueGeneral;

    /**
     * Specifies how to fill columns (balanced or sequential).
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/column-fill
     */
    columnFill?: CSSLazyString;

    /**
     * The column-gap property controls the width of the gap between columns in multi-column elements.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/column-gap
     */
    columnGap?: CSSLazyValueGeneral;

    /**
     * Sets the width, style, and color of the rule between columns.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/column-rule
     */
    columnRule?: CSSLazyString;

    /**
     * Specifies the color of the rule between columns.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/column-rule-color
     */
    columnRuleColor?: CSSLazy<CSSColor>;

    /**
     * Specifies the width of the rule between columns.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/column-rule-width
     */
    columnRuleWidth?: CSSLazyValueGeneral;

    /**
     * The column-span CSS property makes it possible for an element to span across all columns when its value is set to all. An element that spans more than one column is called a spanning element.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/column-span
     */
    columnSpan?: CSSLazyValueGeneral;

    /**
     * Specifies the width of columns in multi-column elements.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/column-width
     */
    columnWidth?: CSSLazyValueGeneral;

    /**
     * This property is a shorthand property for setting column-width and/or column-count.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/columns
     */
    columns?: CSSLazyValueGeneral;

    /**
     * The content property is used with the :before and :after pseudo-elements, to insert generated content.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/content
     */
    content?: CSSLazyString;

    /**
     * The counter-increment property accepts one or more names of counters (identifiers), each one optionally followed by an integer which specifies the value by which the counter should be incremented (e.g. if the value is 2, the counter increases by 2 each time it is invoked).
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/counter-increment
     */
    counterIncrement?: CSSLazyValueGeneral;

    /**
     * The counter-reset property contains a list of one or more names of counters, each one optionally followed by an integer (otherwise, the integer defaults to 0.) Each time the given element is invoked, the counters specified by the property are set to the given integer.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/counter-reset
     */
    counterReset?: CSSLazyValueGeneral;

    /**
     * Specifies the mouse cursor displayed when the mouse pointer is over an element.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/cursor
     */
    cursor?: CSSLazy<
        | CSSGlobalValues
        | StringHint
        | "auto"
        | "default"
        | "none"
        | "context-menu"
        | "help"
        | "pointer"
        | "progress"
        | "wait"
        | "cell"
        | "crosshair"
        | "text"
        | "vertical-text"
        | "alias"
        | "copy"
        | "move"
        | "no-drop"
        | "not-allowed"
        | "e-resize"
        | "n-resize"
        | "ne-resize"
        | "nw-resize"
        | "s-resize"
        | "se-resize"
        | "sw-resize"
        | "w-resize"
        | "ew-resize"
        | "ns-resize"
        | "nesw-resize"
        | "nwse-resize"
        | "col-resize"
        | "row-resize"
        | "all-scroll"
        | "zoom-in"
        | "zoom-out"
        | "grab"
        | "grabbing"
    >;

    /**
     * The direction CSS property specifies the text direction/writing direction. The rtl is used for Hebrew or Arabic text, the ltr is for other languages.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/direction
     */
    direction?: CSSLazy<CSSGlobalValues | "ltr" | "rtl">;

    /**
     * This property specifies the type of rendering box used for an element. It is a shorthand property for many other display properties.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/display
     */
    display?: CSSLazy<
        | CSSGlobalValues
        | StringHint
        | "none"
        | "inline"
        | "block"
        | "inline-block"
        | "contents"
        | "list-item"
        | "inline-list-item"
        | "table"
        | "inline-table"
        | "table-cell"
        | "table-column"
        | "table-column-group"
        | "table-footer-group"
        | "table-header-group"
        | "table-row"
        | "table-row-group"
        | "table-caption"
        | "flex"
        | "inline-flex"
        | "grid"
        | "inline-grid"
        | "ruby"
        | "ruby-base"
        | "ruby-text"
        | "ruby-base-container"
        | "ruby-text-container"
        | "run-in"
    >;

    /**
     * The ‘fill’ property paints the interior of the given graphical element. The area to be painted consists of any areas inside the outline of the shape. To determine the inside of the shape, all subpaths are considered, and the interior is determined according to the rules associated with the current value of the ‘fill-rule’ property. The zero-width geometric outline of a shape is included in the area to be painted.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/fill
     */
    fill?: CSSLazyString;

    /**
     * SVG: Specifies the opacity of the color or the content the current object is filled with.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/fill-opacity
     */
    fillOpacity?: CSSLazyValueGeneral;

    /**
     * The ‘fill-rule’ property indicates the algorithm which is to be used to determine what parts of the canvas are included inside the shape. For a simple, non-intersecting path, it is intuitively clear what region lies "inside"; however, for a more complex path, such as a path that intersects itself or where one subpath encloses another, the interpretation of "inside" is not so obvious.
     * The ‘fill-rule’ property provides two options for how the inside of a shape is determined:
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/fill-rule
     */
    fillRule?: CSSLazyString;

    /**
     * Applies various image processing effects. This property is largely unsupported. See Compatibility section for more information.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/filter
     */
    filter?: CSSLazyString;

    /**
     * Shorthand for `flex-grow`, `flex-shrink`, and `flex-basis`.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/flex
     */
    flex?: CSSLazyValueGeneral;

    /**
     * The flex-basis CSS property describes the initial main size of the flex item before any free space is distributed according to the flex factors described in the flex property (flex-grow and flex-shrink).
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/flex-basis
     */
    flexBasis?: CSSLazyValueGeneral;

    /**
     * The flex-direction CSS property describes how flex items are placed in the flex container, by setting the direction of the flex container's main axis.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/flex-direction
     */
    flexDirection?: CSSLazy<CSSGlobalValues | "row" | "row-reverse" | "column" | "column-reverse">;

    /**
     * The flex-flow CSS property defines the flex container's main and cross axis. It is a shorthand property for the flex-direction and flex-wrap properties.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/flex-flow
     */
    flexFlow?: CSSLazyString;

    /**
     * Specifies the flex grow factor of a flex item.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/flex-grow
     */
    flexGrow?: CSSLazyValueGeneral;

    /**
     * Gets or sets a value that specifies the ordinal group that a flexbox element belongs to. This ordinal value identifies the display order for the group.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/flex-order
     */
    flexOrder?: CSSLazyValueGeneral;

    /**
     * Specifies the flex shrink factor of a flex item.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/flex-shrink
     */
    flexShrink?: CSSLazyValueGeneral;

    /**
     * Specifies whether flex items are forced into a single line or can be wrapped onto multiple lines.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/flex-wrap
     */
    flexWrap?: CSSLazy<CSSGlobalValues | "nowrap" | "wrap" | "wrap-reverse">;

    /**
     * Elements which have the style float are floated horizontally. These elements can move as far to the left or right of the containing element. All elements after the floating element will flow around it, but elements before the floating element are not impacted. If several floating elements are placed after each other, they will float next to each other as long as there is room.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/float
     */
    float?: CSSLazy<CSSGlobalValues | "left" | "right" | "none" | "inline-start" | "inline-end">;

    /**
     * Flows content from a named flow (specified by a corresponding flow-into) through selected elements to form a dynamic chain of layout regions.
     */
    flowFrom?: CSSLazyValueGeneral;

    /**
     * The font property is shorthand that allows you to do one of two things: you can either set up six of the most mature font properties in one line, or you can set one of a choice of keywords to adopt a system font setting.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/font
     */
    font?: CSSLazyString;

    /**
     * The font-family property allows one or more font family names and/or generic family names to be specified for usage on the selected element(s)' text. The browser then goes through the list; for each character in the selection it applies the first font family that has an available glyph for that character.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/font-family
     */
    fontFamily?: CSSLazyString;

    /**
     * The font-kerning property allows contextual adjustment of inter-glyph spacing, i.e. the spaces between the characters in text. This property controls <bold>metric kerning</bold> - that utilizes adjustment data contained in the font. Optical Kerning is not supported as yet.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/font-kerning
     */
    fontKerning?: CSSLazy<CSSGlobalValues | "auto" | "normal" | "none">;

    /**
     * Specifies the size of the font. Used to compute em and ex units.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/font-size
     */
    fontSize?: CSSLazy<CSSFontSize>;

    /**
     * The font-size-adjust property adjusts the font-size of the fallback fonts defined with font-family, so that the x-height is the same no matter what font is used. This preserves the readability of the text when fallback happens.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/font-size-adjust
     */
    fontSizeAdjust?: CSSLazyValueGeneral;

    /**
     * Allows you to expand or condense the widths for a normal, condensed, or expanded font face.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/font-stretch
     */
    fontStretch?: CSSLazy<
        | CSSGlobalValues
        | "normal"
        | "ultra-condensed"
        | "extra-condensed"
        | "condensed"
        | "semi-condensed"
        | "semi-expanded"
        | "expanded"
        | "extra-expanded"
        | "ultra-expanded"
    >;

    /**
     * The font-style property allows normal, italic, or oblique faces to be selected. Italic forms are generally cursive in nature while oblique faces are typically sloped versions of the regular face. Oblique faces can be simulated by artificially sloping the glyphs of the regular face.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/font-style
     */
    fontStyle?: CSSLazy<CSSGlobalValues | "normal" | "italic" | "oblique">;

    /**
     * This value specifies whether the user agent is allowed to synthesize bold or oblique font faces when a font family lacks bold or italic faces.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/font-synthesis
     */
    fontSynthesis?: CSSLazyString;

    /**
     * The font-variant property enables you to select the small-caps font within a font family.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant
     */
    fontVariant?: CSSLazyString;

    /**
     * Fonts can provide alternate glyphs in addition to default glyph for a character. This property provides control over the selection of these alternate glyphs.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-alternates
     */
    fontVariantAlternates?: CSSLazyString;

    /**
     * Specifies the weight or boldness of the font.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight
     */
    fontWeight?: CSSLazy<CSSFontWeight>;

    /**
     * Lays out one or more grid items bound by 4 grid lines. Shorthand for setting grid-column-start, grid-column-end, grid-row-start, and grid-row-end in a single declaration.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/grid-area
     */
    gridArea?: CSSLazyString;

    /**
     * Controls a grid item's placement in a grid area, particularly grid position and a grid span. Shorthand for setting grid-column-start and grid-column-end in a single declaration.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column
     */
    gridColumn?: CSSLazyString;

    /**
     * Controls a grid item's placement in a grid area as well as grid position and a grid span. The grid-column-end property (with grid-row-start, grid-row-end, and grid-column-start) determines a grid item's placement by specifying the grid lines of a grid item's grid area.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column-end
     */
    gridColumnEnd?: CSSLazyValueGeneral;

    /**
     * Determines a grid item's placement by specifying the starting grid lines of a grid item's grid area . A grid item's placement in a grid area consists of a grid position and a grid span. See also ( grid-row-start, grid-row-end, and grid-column-end)
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column-start
     */
    gridColumnStart?: CSSLazyValueGeneral;

    /**
     * Gets or sets a value that indicates which row an element within a Grid should appear in. Shorthand for setting grid-row-start and grid-row-end in a single declaration.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row
     */
    gridRow?: CSSLazyString;

    /**
     * Determines a grid item’s placement by specifying the block-end. A grid item's placement in a grid area consists of a grid position and a grid span. The grid-row-end property (with grid-row-start, grid-column-start, and grid-column-end) determines a grid item's placement by specifying the grid lines of a grid item's grid area.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row-end
     */
    gridRowEnd?: CSSLazyValueGeneral;

    /**
     * Determines a grid item’s start position within the grid row by contributing a line, a span, or nothing (automatic) to its grid placement, thereby specifying the inline-start edge of its grid area.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row-start
     */
    gridRowStart?: CSSLazyValueGeneral;

    /**
     * Specifies a row position based upon an integer location, string value, or desired row size.
     * css/properties/grid-row is used as short-hand for grid-row-position and grid-row-position
     */
    gridRowPosition?: CSSLazyString;

    gridRowSpan?: CSSLazyValueGeneral;

    /**
     * Specifies named grid areas which are not associated with any particular grid item, but can be referenced from the grid-placement properties. The syntax of the grid-template-areas property also provides a visualization of the structure of the grid, making the overall layout of the grid container easier to understand.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-areas
     */
    gridTemplateAreas?: CSSLazyValueGeneral;

    /**
     * Specifies (with grid-template-rows) the line names and track sizing functions of the grid. Each sizing function can be specified as a length, a percentage of the grid container’s size, a measurement of the contents occupying the column or row, or a fraction of the free space in the grid.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-columns
     */
    gridTemplateColumns?: CSSLazyValueGeneral;

    /**
     * Specifies (with grid-template-columns) the line names and track sizing functions of the grid. Each sizing function can be specified as a length, a percentage of the grid container’s size, a measurement of the contents occupying the column or row, or a fraction of the free space in the grid.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-rows
     */
    gridTemplateRows?: CSSLazyValueGeneral;

    /**
     * Sets the height of an element. The content area of the element height does not include the padding, border, and margin of the element.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/height
     */
    height?: CSSLazy<"auto" | CSSValueGeneral | CSSGlobalValues>;

    /**
     * Specifies the minimum number of characters in a hyphenated word
     * @see https://msdn.microsoft.com/en-us/library/hh771865(v=vs.85).aspx
     */
    hyphenateLimitChars?: CSSLazyValueGeneral;

    /**
     * Indicates the maximum number of successive hyphenated lines in an element. The ‘no-limit’ value means that there is no limit.
     * @see https://msdn.microsoft.com/en-us/library/hh771867(v=vs.85).aspx
     */
    hyphenateLimitLines?: CSSLazyValueGeneral;

    /**
     * Specifies the maximum amount of trailing whitespace (before justification) that may be left in a line before hyphenation is triggered to pull part of a word from the next line back up into the current one.
     * @see https://msdn.microsoft.com/en-us/library/hh771869(v=vs.85).aspx
     */
    hyphenateLimitZone?: CSSLazyValueGeneral;

    /**
     * Specifies whether or not words in a sentence can be split by the use of a manual or automatic hyphenation mechanism.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/hyphens
     */
    hyphens?: CSSLazy<CSSGlobalValues | StringHint | "none" | "manual" | "auto">;

    /**
     * Controls the state of the input method editor for text fields.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/ime-mode
     */
    imeMode?: CSSLazy<CSSGlobalValues | "auto" | "normal" | "active" | "inactive" | "disabled">;

    /**
     * Defines how the browser distributes space between and around flex items
     * along the main-axis of their container.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/justify-content
     */
    justifyContent?: CSSLazy<"flex-start" | "flex-end" | "center" | "space-between" | "space-around">;

    layoutGrid?: CSSLazyValueGeneral;

    layoutGridChar?: CSSLazyValueGeneral;

    layoutGridLine?: CSSLazyValueGeneral;

    layoutGridMode?: CSSLazyValueGeneral;

    layoutGridType?: CSSLazyValueGeneral;

    /**
     * Sets the left edge of an element
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/left
     */
    left?: CSSLazy<"auto" | CSSValueGeneral>;

    /**
     * The letter-spacing CSS property specifies the spacing behavior between text characters.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/letter-spacing
     */
    letterSpacing?: CSSLazyValueGeneral;

    lineClamp?: CSSLazyValueGeneral;

    /**
     * Specifies the height of an inline block level element.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/line-height
     */
    lineHeight?: CSSLazyValueGeneral;

    /**
     * Shorthand property that sets the list-style-type, list-style-position and list-style-image properties in one declaration.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/list-style
     */
    listStyle?: CSSLazyString;

    /**
     * This property sets the image that will be used as the list item marker. When the image is available, it will replace the marker set with the 'list-style-type' marker. That also means that if the image is not available, it will show the style specified by list-style-property
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/list-style-image
     */
    listStyleImage?: CSSLazyString;

    /**
     * Specifies if the list-item markers should appear inside or outside the content flow.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/list-style-position
     */
    listStylePosition?: CSSLazy<CSSGlobalValues | "inside" | "outside">;

    /**
     * Specifies the type of list-item marker in a list.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/list-style-type
     */
    listStyleType?: CSSLazyString;

    /**
     * The margin property is shorthand to allow you to set all four margins of an element at once. Its equivalent longhand properties are margin-top, margin-right, margin-bottom and margin-left. Negative values are also allowed.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/margin
     */
    margin?: CSSLazyValueGeneral;

    /**
     * margin-bottom sets the bottom margin of an element.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/margin-bottom
     */
    marginBottom?: CSSLazyValueGeneral;

    /**
     * margin-left sets the left margin of an element.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/margin-left
     */
    marginLeft?: CSSLazyValueGeneral;

    /**
     * margin-right sets the right margin of an element.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/margin-right
     */
    marginRight?: CSSLazyValueGeneral;

    /**
     * margin-top sets the top margin of an element.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/margin-top
     */
    marginTop?: CSSLazyValueGeneral;

    /**
     * This property is shorthand for setting mask-image, mask-mode, mask-repeat, mask-position, mask-clip, mask-origin, mask-composite and mask-size. Omitted values are set to their original properties' initial values.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/mask
     */
    mask?: CSSLazyString;

    /**
     * This property is shorthand for setting mask-border-source, mask-border-slice, mask-border-width, mask-border-outset, and mask-border-repeat. Omitted values are set to their original properties' initial values.
     */
    maskBorder?: CSSLazyString;

    /**
     * This property specifies how the images for the sides and the middle part of the mask image are scaled and tiled. The first keyword applies to the horizontal sides, the second one applies to the vertical ones. If the second keyword is absent, it is assumed to be the same as the first, similar to the CSS border-image-repeat property.
     */
    maskBorderRepeat?: CSSLazyValueGeneral;

    /**
     * This property specifies inward offsets from the top, right, bottom, and left edges of the mask image, dividing it into nine regions: four corners, four edges, and a middle. The middle image part is discarded and treated as fully transparent black unless the fill keyword is present. The four values set the top, right, bottom and left offsets in that order, similar to the CSS border-image-slice property.
     */
    maskBorderSlice?: CSSLazyValueGeneral;

    /**
     * Specifies an image to be used as a mask. An image that is empty, fails to download, is non-existent, or cannot be displayed is ignored and does not mask the element.
     */
    maskBorderSource?: CSSLazyString;

    /**
     * This property sets the width of the mask box image, similar to the CSS border-image-width property.
     */
    maskBorderWidth?: CSSLazyValueGeneral;

    /**
     * Determines the mask painting area, which defines the area that is affected by the mask. The painted content of an element may be restricted to this area.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/mask-clip
     */
    maskClip?: CSSLazyString;

    /**
     * For elements rendered as a single box, specifies the mask positioning area. For elements rendered as multiple boxes (e.g., inline boxes on several lines, boxes on several pages) specifies which boxes box-decoration-break operates on to determine the mask positioning area(s).
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/mask-origin
     */
    maskOrigin?: CSSLazyString;

    /**
     * Sets the maximum height for an element. It prevents the height of the element to exceed the specified value. If min-height is specified and is greater than max-height, max-height is overridden.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/max-height
     */
    maxHeight?: CSSLazyValueGeneral;

    /**
     * Sets the maximum width for an element. It limits the width property to be larger than the value specified in max-width.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/max-width
     */
    maxWidth?: CSSLazyValueGeneral;

    /**
     * Sets the minimum height for an element. It prevents the height of the element to be smaller than the specified value. The value of min-height overrides both max-height and height.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/min-height
     */
    minHeight?: CSSLazyValueGeneral;

    /**
     * Sets the minimum width of an element. It limits the width property to be not smaller than the value specified in min-width.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/min-width
     */
    minWidth?: CSSLazyValueGeneral;

    /**
     * The blend mode defines the formula that must be used to mix the colors with the backdrop
     * @see https://drafts.fxtf.org/compositing-1/#mix-blend-mode
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode
     */
    mixBlendMode?: CSSLazy<CSSBlendMode>;

    /**
     * Specifies the transparency of an element.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/opacity
     */
    opacity?: CSSLazyValueGeneral;

    /**
     * Specifies the order used to lay out flex items in their flex container.
     * Elements are laid out in the ascending order of the order value.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/order
     */
    order?: CSSLazyValueGeneral;

    /**
     * In paged media, this property defines the minimum number of lines in
     * a block container that must be left at the bottom of the page.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/orphans
     */
    orphans?: CSSLazyValueGeneral;

    /**
     * The CSS outline property is a shorthand property for setting one or more of the individual outline properties outline-style, outline-width and outline-color in a single rule. In most cases the use of this shortcut is preferable and more convenient.
     * Outlines differ from borders in the following ways:
     *  • Outlines do not take up space, they are drawn above the content.
     *  • Outlines may be non-rectangular. They are rectangular in Gecko/Firefox. Internet Explorer attempts to place the smallest contiguous outline around all elements or shapes that are indicated to have an outline. Opera draws a non-rectangular shape around a construct.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/outline
     */
    outline?: CSSLazyValueGeneral;

    /**
     * The outline-color property sets the color of the outline of an element. An outline is a line that is drawn around elements, outside the border edge, to make the element stand out.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/outline-color
     */
    outlineColor?: CSSLazy<CSSColor>;

    /**
     * The outline-style property sets the style of the outline of an element.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/outline-style
     */
    outlineStyle?: CSSLazy<
        | CSSGlobalValues
        | "auto"
        | "none"
        | "dotted"
        | "dashed"
        | "solid"
        | "double"
        | "groove"
        | "ridge"
        | "inset"
        | "outset"
    >;

    /**
     * The outline-offset property offsets the outline and draw it beyond the border edge.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/outline-offset
     */
    outlineOffset?: CSSLazyValueGeneral;

    /**
     * The overflow property controls how extra content exceeding the bounding box of an element is rendered. It can be used in conjunction with an element that has a fixed width and height, to eliminate text-induced page distortion.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/overflow
     */
    overflow?: CSSLazy<CSSOverflow>;

    /**
     * Specifies the preferred scrolling methods for elements that overflow.
     */
    overflowStyle?: CSSLazyValueGeneral;

    /**
     * Controls how extra content exceeding the x-axis of the bounding box of an element is rendered.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-x
     */
    overflowX?: CSSLazy<CSSOverflow>;

    /**
     * Controls how extra content exceeding the y-axis of the bounding box of an element is rendered.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-y
     */
    overflowY?: CSSLazy<CSSOverflow>;

    /**
     * The padding optional CSS property sets the required padding space on one to four sides of an element. The padding area is the space between an element and its border. Negative values are not allowed but decimal values are permitted. The element size is treated as fixed, and the content of the element shifts toward the center as padding is increased.
     * The padding property is a shorthand to avoid setting each side separately (padding-top, padding-right, padding-bottom, padding-left).
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/padding
     */
    padding?: CSSLazyValueGeneral;

    /**
     * The padding-bottom CSS property of an element sets the padding space required on the bottom of an element. The padding area is the space between the content of the element and its border. Contrary to margin-bottom values, negative values of padding-bottom are invalid.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/padding-bottom
     */
    paddingBottom?: CSSLazyValueGeneral;

    /**
     * The padding-left CSS property of an element sets the padding space required on the left side of an element. The padding area is the space between the content of the element and its border. Contrary to margin-left values, negative values of padding-left are invalid.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/padding-left
     */
    paddingLeft?: CSSLazyValueGeneral;

    /**
     * The padding-right CSS property of an element sets the padding space required on the right side of an element. The padding area is the space between the content of the element and its border. Contrary to margin-right values, negative values of padding-right are invalid.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/padding-right
     */
    paddingRight?: CSSLazyValueGeneral;

    /**
     * The padding-top CSS property of an element sets the padding space required on the top of an element. The padding area is the space between the content of the element and its border. Contrary to margin-top values, negative values of padding-top are invalid.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/padding-top
     */
    paddingTop?: CSSLazyValueGeneral;

    /**
     * The page-break-after property is supported in all major browsers. With CSS3, page-break-* properties are only aliases of the break-* properties. The CSS3 Fragmentation spec defines breaks for all CSS box fragmentation.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/page-break-after
     */
    pageBreakAfter?: CSSLazy<CSSGlobalValues | "auto" | "always" | "avoid" | "left" | "right" | "recto" | "verso">;

    /**
     * The page-break-before property sets the page-breaking behavior before an element. With CSS3, page-break-* properties are only aliases of the break-* properties. The CSS3 Fragmentation spec defines breaks for all CSS box fragmentation.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/page-break-before
     */
    pageBreakBefore?: CSSLazy<CSSGlobalValues | "auto" | "always" | "avoid" | "left" | "right" | "recto" | "verso">;

    /**
     * Sets the page-breaking behavior inside an element. With CSS3, page-break-* properties are only aliases of the break-* properties. The CSS3 Fragmentation spec defines breaks for all CSS box fragmentation.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/page-break-inside
     */
    pageBreakInside?: CSSLazy<CSSGlobalValues | "auto" | "avoid">;

    /**
     * The perspective property defines how far an element is placed from the view on the z-axis, from the screen to the viewer.
     * Perspective defines how an object is viewed. In graphic arts, perspective is the representation on a flat surface of what the viewer's eye would see in a 3D space. (See Wikipedia for more information about graphical perspective and for related illustrations.)
     * The illusion of perspective on a flat surface, such as a computer screen, is created by projecting points on the flat surface as they would appear if the flat surface were a window through which the viewer was looking at the object. In discussion of virtual environments, this flat surface is called a projection plane.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/perspective
     */
    perspective?: CSSLazyValueGeneral;

    /**
     * The perspective-origin property establishes the origin for the perspective property. It effectively sets the X and Y position at which the viewer appears to be looking at the children of the element.
     * When used with perspective, perspective-origin changes the appearance of an object, as if a viewer were looking at it from a different origin. An object appears differently if a viewer is looking directly at it versus looking at it from below, above, or from the side. Thus, the perspective-origin is like a vanishing point.
     * The default value of perspective-origin is 50% 50%. This displays an object as if the viewer's eye were positioned directly at the center of the screen, both top-to-bottom and left-to-right. A value of 0% 0% changes the object as if the viewer was looking toward the top left angle. A value of 100% 100% changes the appearance as if viewed toward the bottom right angle.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/perspective-origin
     */
    perspectiveOrigin?: CSSLazyValueGeneral;

    /**
     * The pointer-events property allows you to control whether an element can be the target for the pointing device (e.g, mouse, pen) events.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/pointer-events
     */
    pointerEvents?: CSSLazy<
        | CSSGlobalValues
        | "auto"
        | "none"
        | "visiblePainted"
        | "visibleFill"
        | "visibleStroke"
        | "visible"
        | "painted"
        | "fill"
        | "stroke"
        | "all"
    >;

    /**
     * The position property controls the type of positioning used by an element within its parent elements. The effect of the position property depends on a lot of factors, for example the position property of parent elements.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/position
     */
    position?: CSSLazy<CSSGlobalValues | "static" | "relative" | "absolute" | "sticky" | "fixed">;

    /**
     * Sets the type of quotation marks for embedded quotations.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/quotes
     */
    quotes?: CSSLazyValueGeneral;

    /**
     * Controls whether the last region in a chain displays additional 'overset' content according its default overflow property, or if it displays a fragment of content as if it were flowing into a subsequent region.
     */
    regionFragment?: CSSLazyValueGeneral;

    /**
     * The resize CSS property lets you control the resizability of an element.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/resize
     */
    resize?: CSSLazy<CSSGlobalValues | "none" | "both " | "horizontal" | "vertical">;

    /**
     * The rest-after property determines how long a speech media agent should pause after presenting an element's main content, before presenting that element's exit cue sound. It may be replaced by the shorthand property rest, which sets rest time before and after.
     */
    restAfter?: CSSLazyValueGeneral;

    /**
     * The rest-before property determines how long a speech media agent should pause after presenting an intro cue sound for an element, before presenting that element's main content. It may be replaced by the shorthand property rest, which sets rest time before and after.
     */
    restBefore?: CSSLazyValueGeneral;

    /**
     * Specifies the position an element in relation to the right side of the containing element.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/right
     */
    right?: CSSLazy<"auto" | CSSValueGeneral | CSSGlobalValues>;

    /**
     * Specifies the distribution of the different ruby elements over the base.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/ruby-align
     */
    rubyAlign?: CSSLazy<CSSGlobalValues | "start" | "center" | "space-between" | "space-around">;

    /**
     * Specifies the position of a ruby element relatives to its base element. It can be position over the element (over), under it (under), or between the characters, on their right side (inter-character).
     * @see https://developer.mozilla.org/en/docs/Web/CSS/ruby-position
     */
    rubyPosition?: CSSLazy<CSSGlobalValues | "over" | "under" | "inter-character">;

    /**
     * Defines the alpha channel threshold used to extract a shape from an image. Can be thought of as a "minimum opacity" threshold; that is, a value of 0.5 means that the shape will enclose all the pixels that are more than 50% opaque.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/shape-image-threshold
     */
    shapeImageThreshold?: CSSLazyValueGeneral;

    /**
     * A future level of CSS Shapes will define a shape-inside property, which will define a shape to wrap content within the element. See Editor's Draft <http://dev.w3.org/csswg/css-shapes/> and CSSWG wiki page on next-level plans <http://wiki.csswg.org/spec/css-shapes>
     */
    shapeInside?: CSSLazyValueGeneral;

    /**
     * Adds a margin to a shape-outside. In effect, defines a new shape that is the smallest contour around all the points that are the shape-margin distance outward perpendicular to each point on the underlying shape. For points where a perpendicular direction is not defined (e.g., a triangle corner), takes all points on a circle centered at the point and with a radius of the shape-margin distance. This property accepts only non-negative values.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/shape-margin
     */
    shapeMargin?: CSSLazyValueGeneral;

    /**
     * Declares a shape around which text should be wrapped, with possible modifications from the shape-margin property. The shape defined by shape-outside and shape-margin changes the geometry of a float element's float area.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/shape-outside
     */
    shapeOutside?: CSSLazyValueGeneral;

    /**
     * The speak property determines whether or not a speech synthesizer will read aloud the contents of an element.
     */
    speak?: CSSLazyValueGeneral;

    /**
     * The speak-as property determines how the speech synthesizer interprets the content: words as whole words or as a sequence of letters, numbers as a numerical value or a sequence of digits, punctuation as pauses in speech or named punctuation characters.
     */
    speakAs?: CSSLazyValueGeneral;

    /**
     * SVG: Specifies the opacity of the outline on the current object.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/stroke-opacity
     */
    strokeOpacity?: CSSLazyValueGeneral;

    /**
     * SVG: Specifies the width of the outline on the current object.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/stroke-width
     */
    strokeWidth?: CSSLazyValueGeneral;

    /**
     * The tab-size CSS property is used to customise the width of a tab (U+0009) character.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/tab-size
     */
    tabSize?: CSSLazyValueGeneral;

    /**
     * The 'table-layout' property controls the algorithm used to lay out the table cells, rows, and columns.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/table-layout
     */
    tableLayout?: CSSLazyValueGeneral;

    /**
     * The text-align CSS property describes how inline content like text is aligned in its parent block element. text-align does not control the alignment of block elements itself, only their inline content.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/text-align
     */
    textAlign?: CSSLazy<
        CSSGlobalValues | "start" | "end" | "left" | "right" | "center" | "justify" | "justify-all" | "match-parent"
    >;

    /**
     * The text-align-last CSS property describes how the last line of a block element or a line before line break is aligned in its parent block element.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/text-align-last
     */
    textAlignLast?: CSSLazy<CSSGlobalValues | "auto" | "start" | "end" | "left" | "right" | "center" | "justify">;

    /**
     * The text-decoration CSS property is used to set the text formatting to underline, overline, line-through or blink.
     * underline and overline decorations are positioned under the text, line-through over it.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/text-decoration
     */
    textDecoration?: CSSLazyValueGeneral;

    /**
     * Sets the color of any text decoration, such as underlines, overlines, and strike throughs.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/text-decoration-color
     */
    textDecorationColor?: CSSLazy<CSSColor>;

    /**
     * Sets what kind of line decorations are added to an element, such as underlines, overlines, etc.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/text-decoration-line
     */
    textDecorationLine?: CSSLazyValueGeneral;

    textDecorationLineThrough?: CSSLazyValueGeneral;

    textDecorationNone?: CSSLazyValueGeneral;

    textDecorationOverline?: CSSLazyValueGeneral;

    /**
     * Specifies what parts of an element’s content are skipped over when applying any text decoration.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/text-decoration-skip
     */
    textDecorationSkip?: CSSLazyValueGeneral;

    /**
     * This property specifies the style of the text decoration line drawn on the specified element. The intended meaning for the values are the same as those of the border-style-properties.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/text-decoration-style
     */
    textDecorationStyle?: CSSLazy<CSSGlobalValues | "solid" | "double" | "dotted" | "dashed" | "wavy">;

    textDecorationUnderline?: CSSLazyValueGeneral;

    /**
     * The text-emphasis property will apply special emphasis marks to the elements text. Slightly similar to the text-decoration property only that this property can have affect on the line-height. It also is noted that this is shorthand for text-emphasis-style and for text-emphasis-color.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/text-emphasis
     */
    textEmphasis?: CSSLazyValueGeneral;

    /**
     * The text-emphasis-color property specifies the foreground color of the emphasis marks.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/text-emphasis-color
     */
    textEmphasisColor?: CSSLazy<CSSColor>;

    /**
     * The text-emphasis-style property applies special emphasis marks to an element's text.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/text-emphasis-style
     */
    textEmphasisStyle?: CSSLazyValueGeneral;

    /**
     * This property helps determine an inline box's block-progression dimension, derived from the text-height and font-size properties for non-replaced elements, the height or the width for replaced elements, and the stacked block-progression dimension for inline-block elements. The block-progression dimension determines the position of the padding, border and margin for the element.
     */
    textHeight?: CSSLazyValueGeneral;

    /**
     * Specifies the amount of space horizontally that should be left on the first line of the text of an element. This horizontal spacing is at the beginning of the first line and is in respect to the left edge of the containing block box.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/text-indent
     */
    textIndent?: CSSLazyValueGeneral;

    /**
     * The text-overflow shorthand CSS property determines how overflowed content that is not displayed is signaled to the users. It can be clipped, display an ellipsis ('…', U+2026 HORIZONTAL ELLIPSIS) or a Web author-defined string. It covers the two long-hand properties text-overflow-mode and text-overflow-ellipsis
     * @see https://developer.mozilla.org/en/docs/Web/CSS/text-overflow
     */
    textOverflow?: CSSLazy<CSSGlobalValues | "clip" | "ellipsis" | StringHint>;

    /**
     * The text-overline property is the shorthand for the text-overline-style, text-overline-width, text-overline-color, and text-overline-mode properties.
     */
    textOverline?: CSSLazyValueGeneral;

    /**
     * Specifies the line color for the overline text decoration.
     */
    textOverlineColor?: CSSLazy<CSSColor>;

    /**
     * Sets the mode for the overline text decoration, determining whether the text decoration affects the space characters or not.
     */
    textOverlineMode?: CSSLazyValueGeneral;

    /**
     * Specifies the line style for overline text decoration.
     */
    textOverlineStyle?: CSSLazyValueGeneral;

    /**
     * Specifies the line width for the overline text decoration.
     */
    textOverlineWidth?: CSSLazyValueGeneral;

    /**
     * The text-rendering CSS property provides information to the browser about how to optimize when rendering text. Options are: legibility, speed or geometric precision.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/text-rendering
     */
    textRendering?: CSSLazy<CSSGlobalValues | "auto" | "optimizeSpeed" | "optimizeLegibility" | "geometricPrecision">;

    /**
     * The CSS text-shadow property applies one or more drop shadows to the text and <text-decorations> of an element. Each shadow is specified as an offset from the text, along with optional color and blur radius values.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/text-shadow
     */
    textShadow?: CSSLazyValueGeneral;

    /**
     * This property transforms text for styling purposes. (It has no effect on the underlying content.)
     * @see https://developer.mozilla.org/en/docs/Web/CSS/text-transform
     */
    textTransform?: CSSLazy<CSSGlobalValues | "none" | "capitalize" | "uppercase" | "lowercase" | "full-width">;

    /**
     * Unsupported.
     * This property will add a underline position value to the element that has an underline defined.
     */
    textUnderlinePosition?: CSSLazyValueGeneral;

    /**
     * After review this should be replaced by text-decoration should it not?
     * This property will set the underline style for text with a line value for underline, overline, and line-through.
     */
    textUnderlineStyle?: CSSLazyValueGeneral;

    /**
     * This property specifies how far an absolutely positioned box's top margin edge is offset below the top edge of the box's containing block. For relatively positioned boxes, the offset is with respect to the top edges of the box itself (i.e., the box is given a position in the normal flow, then offset from that position according to these properties).
     * @see https://developer.mozilla.org/en/docs/Web/CSS/top
     */
    top?: CSSLazy<"auto" | CSSValueGeneral | CSSGlobalValues>;

    /**
     * Determines whether touch input may trigger default behavior supplied by the user agent, such as panning or zooming.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/touch-action
     */
    touchAction?: CSSLazy<
        | CSSGlobalValues
        | "auto"
        | "none"
        | "pan-x"
        | "pan-left"
        | "pan-right"
        | "pan-y"
        | "pan-up"
        | "pan-down"
        | "manipulation"
    >;

    /**
     * CSS transforms allow elements styled with CSS to be transformed in two-dimensional or three-dimensional space. Using this property, elements can be translated, rotated, scaled, and skewed. The value list may consist of 2D and/or 3D transform values.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/transform
     */
    transform?: CSSLazyString;

    /**
     * This property defines the origin of the transformation axes relative to the element to which the transformation is applied.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/transform-origin
     */
    transformOrigin?: CSSLazyValueGeneral;

    /**
     * This property allows you to define the relative position of the origin of the transformation grid along the z-axis.
     */
    transformOriginZ?: CSSLazyValueGeneral;

    /**
     * This property specifies how nested elements are rendered in 3D space relative to their parent.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/transform-style
     */
    transformStyle?: CSSLazy<CSSGlobalValues | "flat" | "preserve-3d">;

    /**
     * The transition CSS property is a shorthand property for transition-property, transition-duration, transition-timing-function, and transition-delay. It allows to define the transition between two states of an element.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/transition
     */
    transition?: CSSLazyValueGeneral;

    /**
     * The unicode-bidi CSS property specifies the level of embedding with respect to the bidirectional algorithm.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/unicode-bidi
     */
    unicodeBidi?: CSSLazyValueGeneral;

    /**
     * User select
     * @see https://developer.mozilla.org/en/docs/Web/CSS/user-select
     */
    userSelect?: CSSLazy<StringHint | "auto" | "text" | "none" | "contain" | "all">;

    /**
     * The vertical-align property controls how inline elements or text are vertically aligned compared to the baseline. If this property is used on table-cells it controls the vertical alignment of content of the table cell.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/vertical-align
     */
    verticalAlign?: CSSLazy<
        | CSSGlobalValues
        | "baseline"
        | "sub"
        | "super"
        | "text-top"
        | "text-bottom"
        | "middle"
        | "top"
        | "bottom"
        | CSSValueGeneral
    >;

    /**
     * The visibility property specifies whether the boxes generated by an element are rendered.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/visibility
     */
    visibility?: CSSLazy<CSSGlobalValues | "visible" | "hidden" | "collapse">;

    /**
     * The white-space property controls whether and how white space inside the element is collapsed, and whether lines may wrap at unforced "soft wrap" opportunities.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/white-space
     */
    whiteSpace?: CSSLazy<CSSGlobalValues | "normal" | "nowrap" | "pre" | "pre-line" | "pre-wrap">;

    /**
     * In paged media, this property defines the mimimum number of lines
     * that must be left at the top of the second page.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/widows
     */
    widows?: CSSLazyValueGeneral;

    /**
     * Specifies the width of the content area of an element. The content area of the element width does not include the padding, border, and margin of the element.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/width
     */
    width?: CSSLazy<"auto" | CSSValueGeneral | CSSGlobalValues>;

    /**
     * The word-break property is often used when there is long generated content that is strung together without and spaces or hyphens to beak apart. A common case of this is when there is a long URL that does not have any hyphens. This case could potentially cause the breaking of the layout as it could extend past the parent element.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/word-break
     */
    wordBreak?: CSSLazy<CSSGlobalValues | "normal" | "break-all" | "keep-all">;

    /**
     * The word-spacing CSS property specifies the spacing behavior between "words".
     * @see https://developer.mozilla.org/en/docs/Web/CSS/word-spacing
     */
    wordSpacing?: CSSLazy<CSSGlobalValues | "normal" | CSSValueGeneral>;

    /**
     * An alias of css/properties/overflow-wrap, word-wrap defines whether to break words when the content exceeds the boundaries of its container.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/word-wrap
     */
    wordWrap?: CSSLazy<CSSGlobalValues | "normal" | "break-word">;

    /**
     * writing-mode specifies if lines of text are laid out horizontally or vertically, and the direction which lines of text and blocks progress.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/writing-mode
     */
    writingMode?: CSSLazy<
        CSSGlobalValues | "horizontal-tb" | "vertical-rl" | "vertical-lr" | "sideways-rl" | "sideways-lr"
    >;

    /**
     * The z-index property specifies the z-order of an element and its descendants.
     * When elements overlap, z-order determines which one covers the other.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/z-index
     */
    zIndex?: CSSLazy<"auto" | CSSValueGeneral>;

    /**
     * Sets the initial zoom factor of a document defined by @viewport.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/zoom
     */
    zoom?: CSSLazy<"auto" | CSSValueGeneral>;

    [prop: string]: CSSLazyValueGeneral | undefined;
}

export type CSSStylesItem =
    | string // IBobrilStyleDef
    | ((styles: CSSInlineStyles, pseudo: CSSPseudoStyles) => void)
    | Readonly<CSSInlineStyles>
    | boolean
    | null
    | undefined;
export type CSSStyles = CSSStylesItemArray | CSSStylesItem;
export interface CSSStylesItemArray extends Array<CSSStyles> {
    fill: any;
    pop: any;
    push: any;
    concat: any;
    reverse: any;
    shift: any;
    slice: any;
    sort: any;
    splice: any;
    unshift: any;
    indexOf: any;
    lastIndexOf: any;
    every: any;
    some: any;
    forEach: any;
    map: any;
    filter: any;
    reduce: any;
    reduceRight: any;
    find: any;
    findIndex: any;
    [Symbol.iterator]: any;
    entries: any;
    values: any;
    readonly [index: number]: CSSStyles;
}

export type CSSPseudoStyles = {
    active?: CSSStyles;
    checked?: CSSStyles;
    disabled?: CSSStyles;
    enabled?: CSSStyles;
    "first-child"?: CSSStyles;
    focus?: CSSStyles;
    hover?: CSSStyles;
    invalid?: CSSStyles;
    "last-child"?: CSSStyles;
    valid?: CSSStyles;
    visited?: CSSStyles;

    [selector: string]: CSSStyles;
};
