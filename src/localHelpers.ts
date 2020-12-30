export function noop(): undefined {
    return undefined;
}

export function newHashObj(): { [name: string]: any } {
    return Object.create(null);
}
