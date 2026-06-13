import { UIDrawContainer } from "./UIDrawContainer";
import { UIElement } from "./UIElement";

export interface Screen extends UIDrawContainer {
    toASCII(): string;
    accept(element: UIElement): void;
}
