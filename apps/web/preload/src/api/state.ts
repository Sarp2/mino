// TODO: change this after building penpal directory
export const penpalParent: unknown = null;

/** Stores the frame id on the window obejct so all preload functions can access with iframe they belong to */
export function setFrameId(frameId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    (window as any)._minoFrameId = frameId;
}

/** Reads the frame id from window. If missing, asks the parent editor via penpal as a fallback */
export function getFrameId(): string {
    // TODO: build it when penpal directory ready
    return 'unimplemented';
}

/** Stores the branch id on the window object */
export function setBranchId(branchId: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    (window as any)._minoBranchId = branchId;
}

/** Reads the branch id from window. If missing, asks the parent editor via penpal as a fallback */
export function getBranchId(): string {
    // TODO: build it when penpal directory ready
    return 'unimplemented';
}
