export interface DomElementStyles {
    defined: Record<string, string>; // Styles from stylesheets or inline
    computed: Record<string, string>; // Browser computed styles
}
