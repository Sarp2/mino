import debounce from 'lodash.debounce';

import type { LayerNode } from '@mino/models';

import { EditorAttributes } from '../constants';
import { isValidHTMLElement } from '../helpers';
import { getInstanceId, getOid, getOrAssignDomId } from '../helpers/ids';
import { publishDomProcessed } from './events/publish';
import { getFrameId } from './state';

export interface ProcessDomResult {
    rootDomId: string;
    layerMap: Array<[string, LayerNode]>;
}

function processDomDebounced(
    root: HTMLElement = document.body,
): ProcessDomResult | null {
    const frameId = getFrameId();
    if (!frameId) {
        console.warn('frameView id not found, skipping dom processing');
        return null;
    }

    const layerMap = buildLayerTree(root);
    if (!layerMap) {
        console.warn('Error building layer tree, root element is null');
        return null;
    }

    const rootDomId = root.getAttribute(EditorAttributes.DATA_MINO_DOM_ID);
    if (!rootDomId) {
        console.warn('Root dom id not found');
        return null;
    }

    const rootNode = layerMap.get(rootDomId);
    if (!rootNode) {
        console.warn('Root node found');
        return null;
    }

    publishDomProcessed(layerMap, rootNode);

    return { rootDomId, layerMap: Array.from(layerMap.entries()) };
}

/** Walks the DOM starting from root (defaults to document.body), builds a layer tree map of all elements, and sends it to the parent editor. Returns null if frameId isn't set yet or if the root element hasn't been assigned a dom id. Debounced by 500ms to avoid excessive processing during rapid DOM changes */
export const processDom = debounce(processDomDebounced, 500);

// Filter conditions for nodes to reject in layer tree.
// TODO: Add more conditions for different frameworks in the future
const FILTER_CONDITIONS = [
    (element: HTMLElement) => {
        const parent = element.parentElement;
        return parent?.tagName.toLowerCase() === 'svg';
    },
    (element: HTMLElement) => {
        return element.tagName.toLowerCase() === 'next-route-announcer';
    },
    (element: HTMLElement) => {
        return element.tagName.toLowerCase() === 'nextjs-portal';
    },
];

/** Creates a flat map of all visible DOM elements as LayerNode objects using TreeWalker. Each node stores its domId, parent, children, tag, oid, visibility, and text content. Filters out SVG children, Next.js portals, and invalid elements. */
export function buildLayerTree(
    root: HTMLElement,
): Map<string, LayerNode> | null {
    if (!isValidHTMLElement(root)) {
        return null;
    }

    const layerMap = new Map<string, LayerNode>();
    const treeWalker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_ELEMENT,
        {
            acceptNode: (node: Node) => {
                const element = node as HTMLElement;

                if (FILTER_CONDITIONS.some((condition) => condition(element))) {
                    return NodeFilter.FILTER_REJECT;
                }

                return isValidHTMLElement(element)
                    ? NodeFilter.FILTER_ACCEPT
                    : NodeFilter.FILTER_SKIP;
            },
        },
    );

    // Process root node
    const rootLayerNode = processNode(root);
    rootLayerNode.children = [];
    layerMap.set(rootLayerNode.domId, rootLayerNode);

    let currentNode: Node | null = treeWalker.nextNode();

    while (currentNode) {
        const layerNode = processNode(currentNode as HTMLElement);
        layerNode.children = [];

        // Get parent's domId
        const parentElement = (currentNode as HTMLElement).parentElement;
        if (parentElement) {
            const parentDomId = parentElement.getAttribute(
                EditorAttributes.DATA_MINO_ID,
            );

            if (parentDomId) {
                layerNode.parent = parentDomId;

                // Add this node's domId to parent's children array
                const parentNode = layerMap.get(parentDomId);
                if (parentNode?.children) {
                    parentNode.children.push(layerNode.domId);
                }
            }
        }

        layerMap.set(layerNode.domId, layerNode);
        currentNode = treeWalker.nextNode();
    }

    return layerMap;
}

/** Extracts metadata from a single DOM element into a LayerNode - domId, oid, instanceId, tag name, text content, visibility, component name */
function processNode(node: HTMLElement): LayerNode {
    const domId = getOrAssignDomId(node);
    const oid = getOid(node);
    const instanceId = getInstanceId(node);
    const textContent = Array.from(node.childNodes)
        .map((node) =>
            node.nodeType === Node.TEXT_NODE ? node.textContent : '',
        )
        .join(' ')
        .trim()
        .slice(0, 500);

    const style = window.getComputedStyle(node);
    const component = node.getAttribute(
        EditorAttributes.DATA_MINO_COMPONENT_NAME,
    );

    const layerNode: LayerNode = {
        domId,
        oid: oid ?? null,
        instanceId: instanceId ?? null,
        textContent: textContent || '',
        tagName: node.tagName.toLowerCase(),
        isVisible: style.visibility !== 'hidden',
        component: component ?? null,
        frameId: getFrameId(),
        children: null,
        parent: null,
        dyanmicType: null,
        coreElementType: null,
    };
    return layerNode;
}
