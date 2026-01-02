interface Env {
}

export const onRequest: PagesFunction<Env> = async (context) => {
    const response = await context.next();
    const contentType = response.headers.get("Content-Type");

    // Only run on HTML requests to avoid slowing down images/js/etc
    if (contentType && contentType.startsWith("text/html")) {

        const FIREBASE_PROJECT_ID = "portfolio-cms-18f16";
        const FIREBASE_API_KEY = "AIzaSyC-JZrio92RycE7Hios7TvUr_xRcUG9s0A";
        const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/portfolio/content_home?key=${FIREBASE_API_KEY}`;

        let ogImageUrl = "";
        let siteTitle = "";
        let siteDesc = "";

        try {
            const firestoreRes = await fetch(FIRESTORE_URL);
            if (firestoreRes.ok) {
                const data = await firestoreRes.json() as any;
                const fields = data.fields || {};

                // Extract fields safely
                ogImageUrl = fields.ogImageUrl?.stringValue || "";
                siteTitle = fields.siteTitle?.stringValue || "";

                if (fields.profile?.mapValue?.fields?.tagline?.stringValue) {
                    siteDesc = fields.profile.mapValue.fields.tagline.stringValue;
                }
            }
        } catch (e) {
            // If Firestore fails, just return the original response
            // console.error(e); 
            return response;
        }

        // Rewrite the HTML stream
        return new HTMLRewriter()
            .on('meta[property="og:image"]', {
                element(element) {
                    if (ogImageUrl) element.setAttribute("content", ogImageUrl);
                },
            })
            .on('meta[property="twitter:image"]', {
                element(element) {
                    if (ogImageUrl) element.setAttribute("content", ogImageUrl);
                }
            })
            .on('meta[itemprop="image"]', {
                element(element) {
                    if (ogImageUrl) element.setAttribute("content", ogImageUrl);
                }
            })
            .on('meta[property="og:title"]', {
                element(element) {
                    if (siteTitle) element.setAttribute("content", siteTitle);
                }
            })
            .on('meta[property="twitter:title"]', {
                element(element) {
                    if (siteTitle) element.setAttribute("content", siteTitle);
                }
            })
            .on('meta[property="og:description"]', {
                element(element) {
                    if (siteDesc) element.setAttribute("content", siteDesc);
                }
            })
            .on('title', {
                element(element) {
                    if (siteTitle) element.setInnerContent(siteTitle);
                }
            })
            .transform(response);
    }

    return response;
};
