'use client';

import { usePathname } from 'next/navigation';
import {
    ComponentType,
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

interface DialogState {
    Component: ComponentType<any>;
    props: any;
    size: 'small' | 'large';
    pathname: string;
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

    const isOpen = state !== null && state.pathname === pathname;

    useEffect(() => {
        if (isOpen) {
            dialogRef.current?.showModal();
        } else {
            dialogRef.current?.close();
        }
    }, [isOpen]);

    const close = useCallback(() => {
        dialogRef.current?.close();
        setState(null);
    }, []);

    const open = useCallback(<T,>(Component: ComponentType<T>, props: T, size: 'small' | 'large') => {
        setState({ Component, props, size, pathname: window.location.pathname });
    }, []);

    const contextValue = useMemo(() => ({ open, close }), [open, close]);

    return (
        <DialogContext.Provider value={contextValue}>
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
