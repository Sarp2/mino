export interface Font {
    id: string;
    family: string;
    subsets: string[];
    variable: string;
    weight?: string[];
    styles?: string[];
    type: string;
}
