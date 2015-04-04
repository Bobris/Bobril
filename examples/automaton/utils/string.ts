module StringExt {
    export function format(str: string, ...args: any[]): string {
        return str.replace(/{(\d+)}/g, (match: string, num: number) => typeof args[num] !== 'undefined' ? args[num] : match);
    };
}
