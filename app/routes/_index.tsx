import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { handleLanguageRedirect } from "~/utils/language.server";

/**
 * Root index route (/)
 * Automatically detects user's language and redirects to appropriate language version
 */
export async function loader({ request }: LoaderFunctionArgs) {
    const redirectResponse = await handleLanguageRedirect(request);

    if (redirectResponse) {
        return redirectResponse;
    }

    // This should never happen, but just in case, redirect to English
    return new Response(null, {
        status: 302,
        headers: {
            Location: '/en/',
        },
    });
}
