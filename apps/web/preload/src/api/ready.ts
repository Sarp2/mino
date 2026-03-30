import { processDom } from './dom';
import { listenForDomChanges } from './events';

/** Called by the parent via penpal once connected. Starts DOM listeners, update polling, and injects default mino styles.  */
export function handleBodyReady() {
    listenForDomChanges();
    keepDomUpdated();
    // TODO: Uncomment it out when cssManager is wrriten
    // cssManager.injectDefaultStyles();
}

let domUpdateInterval: ReturnType<typeof setInterval> | null = null;

/** Polls processDom() every 5 second until the layer tree builds successfully, then clears itself. */
function keepDomUpdated() {
    if (domUpdateInterval !== null) {
        clearInterval(domUpdateInterval);
        domUpdateInterval = null;
    }

    const interval = setInterval(() => {
        try {
            if (processDom() !== null) {
                clearInterval(interval);
                domUpdateInterval = null;
            }
        } catch (error) {
            clearInterval(interval);
            domUpdateInterval = null;
            console.warn('Error in keepDomUpdated: ', error);
        }
    }, 5000);

    domUpdateInterval = interval;
}

/** Polls every 300ms until document.body exists, then calls handleBodyReady(). Also attaches window.onerror for early error capture. */
const handleDocumentBody = setInterval(() => {
    window.onerror = function logError(errorMsg, url, lineNumber) {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
        console.log(`Unhandled error: ${errorMsg} ${url} ${lineNumber}`);
    };

    if (window?.document?.body) {
        clearInterval(handleDocumentBody);
        try {
            handleBodyReady();
        } catch (error) {
            console.log('Error in documentBodyInit: ', error);
        }
    }
}, 300);
