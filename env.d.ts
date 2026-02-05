/// <reference types="@remix-run/cloudflare" />
/// <reference types="vite/client" />

declare module "@remix-run/cloudflare" {
    interface AppLoadContext {
        cloudflare: {
            env: {
                DB: D1Database;
            };
        };
    }
}
