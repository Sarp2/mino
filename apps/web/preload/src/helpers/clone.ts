/** Deep clones any object by serializing to JSON and back. Stips, functions, undefined values, and class instances */
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
export const jsonClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));
