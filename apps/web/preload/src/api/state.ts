import { penpalParent } from '..';

/** Stores the frame id on the window obejct so all preload functions can access with iframe they belong to */
export function setFrameId(frameId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    (window as any)._minoFrameId = frameId;
}

/** Reads the frame id from window. If missing, asks the parent editor via penpal as a fallback */
export function getFrameId(): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    const frameId = (window as any)._minoFrameId;
    if (!frameId) {
        console.warn('Frame id not found');
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        penpalParent?.getFrameId().then((id) => {
            setFrameId(id);
        });
        return '';
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return frameId;
}

/** Stores the branch id on the window object */
export function setBranchId(branchId: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    (window as any)._minoBranchId = branchId;
}

/** Reads the branch id from window. If missing, asks the parent editor via penpal as a fallback */
export function getBranchId(): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    const branchId = (window as any)._minoBranchId;
    if (!branchId) {
        console.warn('Branch id not found');
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        penpalParent?.getBranchId().then((id) => {
            setBranchId(id);
        });

        return '';
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return branchId;
}
