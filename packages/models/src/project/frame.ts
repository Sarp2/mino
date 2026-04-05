import type { RectDimension, RectPosition } from './rect';

export enum Orientation {
    Portrait = 'Portrait',
    Landscape = 'Landscape',
}

export enum Theme {
    Light = 'light',
    Dark = 'dark',
    System = 'system',
}

export interface Frame {
    // ids
    id: string;
    branchId: string;
    canvasId: string;

    // display data
    position: RectPosition;
    dimension: RectDimension;

    // content
    url: string;
}

export interface WindowMetadata {
    orientation: Orientation;
    aspectRatioLocked: boolean;
    device: string;
    theme: Theme;
    width: number;
    height: number;
}
