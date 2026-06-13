import { readScreen } from "../../utils/assets";

/**
 * Lazy, cached loaders for the full-screen ASCII assets, matching the
 * original static accessors.
 */
export class Screens {
    private static _titleScreen?: string;
    private static _characterCreationScreen?: string;
    private static _emptyScreen?: string;
    private static _mapScreen?: string;

    static titleScreen(): string {
        if (this._titleScreen === undefined) {
            this._titleScreen = readScreen("assets/screens/title.txt");
        }
        return this._titleScreen;
    }

    static mapScreen(): string {
        if (this._mapScreen === undefined) {
            this._mapScreen = readScreen("assets/screens/map.txt");
        }
        return this._mapScreen;
    }

    static characterCreationScreen(): string {
        if (this._characterCreationScreen === undefined) {
            this._characterCreationScreen = readScreen("assets/screens/characterCreation.txt");
        }
        return this._characterCreationScreen;
    }

    static emptyScreen(): string {
        if (this._emptyScreen === undefined) {
            this._emptyScreen = readScreen("assets/screens/empty.txt");
        }
        return this._emptyScreen;
    }
}
