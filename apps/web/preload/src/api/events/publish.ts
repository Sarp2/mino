import { penpalParent } from '../..';

/** Sends the processed layer tree map and root node to the parent editor via penpal. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function publishDomProcessed(layerMap: Map<string, any>, rootNode: any) {
    if (!penpalParent) return;

    penpalParent
        .onDomProccesed({
            layerMap: Object.fromEntries(layerMap),
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            rootNode,
        })
        .catch((error: Error) => {
            console.log('Failed to send DOM processed event: ', error);
        });
}
