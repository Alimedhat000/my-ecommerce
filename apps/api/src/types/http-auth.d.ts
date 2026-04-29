declare module 'http-auth' {
    import type { RequestHandler } from 'express';

    export type AuthCheck = (
        username: string,
        password: string,
        callback: (result: boolean) => void
    ) => void;

    export interface BasicOptions {
        realm?: string;
        file?: string;
        msg401?: string;
        msg407?: string;
        contentType?: string;
    }

    export interface Basic {
        check: AuthCheck;
    }

    export function basic(options: BasicOptions, check: AuthCheck): Basic;

    // The missing connect method
    export function connect(auth: Basic): RequestHandler;
}
