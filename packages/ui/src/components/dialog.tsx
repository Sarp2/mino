import * as React from 'react';
import { XIcon } from 'lucide-react';
import { Dialog as DialogPrimitive } from 'radix-ui';

import { cn } from '../lib/utils';
import { Button } from './button';

/**
 * Renders a Radix Dialog root wrapper that sets data-slot="dialog" and forwards all props.
 *
 * @returns A DialogPrimitive.Root element with `data-slot="dialog"` and the forwarded props
 */
function Dialog({
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
    return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

/**
 * Renders a dialog trigger element that forwards props to Radix UI's Trigger and sets data-slot="dialog-trigger".
 *
 * @returns A trigger element with `data-slot="dialog-trigger"` and the provided props applied.
 */
function DialogTrigger({
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
    return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

/**
 * Renders a Radix UI Portal configured for dialog content with a `data-slot="dialog-portal"` attribute.
 *
 * @param props - Props forwarded to the underlying `DialogPrimitive.Portal` component
 * @returns A Portal element that hosts dialog content and applies `data-slot="dialog-portal"`
 */
function DialogPortal({
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
    return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

/**
 * Wrapper around Radix Dialog Close that forwards props and adds `data-slot="dialog-close"`.
 *
 * @param props - Props forwarded to DialogPrimitive.Close
 * @returns A DialogPrimitive.Close element with the provided props applied.
 */
function DialogClose({
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
    return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

/**
 * Renders the dialog's overlay with default backdrop, positioning, and animation classes.
 *
 * @param className - Optional additional class names appended to the overlay's default styles
 * @returns The overlay element for the dialog
 */
function DialogOverlay({
    className,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
    return (
        <DialogPrimitive.Overlay
            data-slot="dialog-overlay"
            className={cn(
                'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50',
                className,
            )}
            {...props}
        />
    );
}

/**
 * Renders the dialog surface inside a portal, including an overlay and an optional built-in close button.
 *
 * @param showCloseButton - `true` to render a close button in the content's top-right corner, `false` to omit it
 * @returns The dialog content element (positioned surface plus overlay) ready to be mounted in the portal
 */
function DialogContent({
    className,
    children,
    showCloseButton = true,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
    showCloseButton?: boolean;
}) {
    return (
        <DialogPortal data-slot="dialog-portal">
            <DialogOverlay />
            <DialogPrimitive.Content
                data-slot="dialog-content"
                className={cn(
                    'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 outline-none sm:max-w-lg',
                    className,
                )}
                {...props}
            >
                {children}
                {showCloseButton && (
                    <DialogPrimitive.Close
                        data-slot="dialog-close"
                        className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                    >
                        <XIcon />
                        <span className="sr-only">Close</span>
                    </DialogPrimitive.Close>
                )}
            </DialogPrimitive.Content>
        </DialogPortal>
    );
}

/**
 * Renders the dialog header container with layout classes and a `data-slot="dialog-header"` attribute.
 *
 * @returns The header element for a dialog, sized and aligned for typical dialog layouts.
 */
function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="dialog-header"
            className={cn(
                'flex flex-col gap-2 text-center sm:text-left',
                className,
            )}
            {...props}
        />
    );
}

/**
 * Footer layout for a dialog that aligns action controls and can optionally render a Close button.
 *
 * @param showCloseButton - If true, includes an outlined "Close" button that triggers the dialog close action.
 * @returns The dialog footer element containing `children` and the optional Close action.
 */
function DialogFooter({
    className,
    showCloseButton = false,
    children,
    ...props
}: React.ComponentProps<'div'> & {
    showCloseButton?: boolean;
}) {
    return (
        <div
            data-slot="dialog-footer"
            className={cn(
                'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
                className,
            )}
            {...props}
        >
            {children}
            {showCloseButton && (
                <DialogPrimitive.Close asChild>
                    <Button variant="outline">Close</Button>
                </DialogPrimitive.Close>
            )}
        </div>
    );
}

/**
 * Renders a dialog title element with consistent typography and slot attributes.
 *
 * @param className - Additional CSS classes appended to the default title styles
 * @returns The DialogPrimitive.Title element with `data-slot="dialog-title"` and combined classes
 */
function DialogTitle({
    className,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
    return (
        <DialogPrimitive.Title
            data-slot="dialog-title"
            className={cn('text-lg leading-none font-semibold', className)}
            {...props}
        />
    );
}

/**
 * Renders a dialog description element with muted, smaller text and optional additional classes.
 *
 * @returns The `DialogPrimitive.Description` element with `data-slot="dialog-description"` and a merged `className`.
 */
function DialogDescription({
    className,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
    return (
        <DialogPrimitive.Description
            data-slot="dialog-description"
            className={cn('text-muted-foreground text-sm', className)}
            {...props}
        />
    );
}

export {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogPortal,
    DialogTitle,
    DialogTrigger,
};