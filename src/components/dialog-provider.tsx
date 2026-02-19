'use client';

import { usePathname } from 'next/navigation';
import { ComponentType, createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';

interface DialogState {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Component: ComponentType<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    props: any;
    size: 'small' | 'large';
}

interface DialogContextType {
    open: <T>(Component: ComponentType<T>, props: T, size: 'small' | 'large') => void;
    close: () => void;
}

const DialogContext = createContext<DialogContextType | null>(null);

export function useDialog(): DialogContextType {
    const ctx = useContext(DialogContext);
    if (!ctx) {
        throw new Error('useDialog must be used inside DialogProvider');
    }
    return ctx;
}

export default function DialogProvider({ children }: { children: ReactNode }) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [state, setState] = useState<DialogState | null>(null);
    const pathname = usePathname();
    const prevPathnameRef = useRef(pathname);

    function open<T>(Component: ComponentType<T>, props: T, size: 'small' | 'large') {
        setState({ Component, props, size });
    }

    function close() {
        dialogRef.current?.close();
        setState(null);
    }

    useEffect(() => {
        if (state) {
            dialogRef.current?.showModal();
        }
    }, [state]);

    useEffect(() => {
        if (prevPathnameRef.current !== pathname) {
            prevPathnameRef.current = pathname;
            close();
        }
    }, [pathname]);

    return (
        <DialogContext.Provider value={{ open, close }}>
            {children}

            <dialog
                ref={dialogRef}
                onClose={() => setState(null)}
                className={`glass-dialog ${state?.size === 'large' ? 'dialog-large' : 'dialog'}`}
            >
                {state && <state.Component {...state.props} />}
            </dialog>
        </DialogContext.Provider>
    );
}
