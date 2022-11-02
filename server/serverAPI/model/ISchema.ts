export default interface ISchema {
    validate(): Promise<{ [type: string]: string; }[]> ;
}
