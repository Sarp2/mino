import type { LayerNode } from '@mino/models';

export interface WindowMutatedData {
    added: Record<string, LayerNode>;
    removed: Record<string, LayerNode>;
}

export interface DomProcessedData {
    layerMap: Record<string, LayerNode>;
    rootNode: LayerNode;
}

type WindowResizedData = object;

export type AutonomousEventData =
    | WindowMutatedData
    | DomProcessedData
    | WindowResizedData;
