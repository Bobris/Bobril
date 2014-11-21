interface IBobrilComponent {
    // called on input element after any change with new value (string|boolean)
    onChange? (ctx: Object, value: any): void;
}
