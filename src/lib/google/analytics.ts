import { BetaAnalyticsDataClient } from '@google-analytics/data';

/**
 * Google Analytics 4 (GA4) Data API Client
 * 
 * To use this, you need:
 * 1. GA_PROPERTY_ID: The ID of your GA4 property
 * 2. GOOGLE_APPLICATION_CREDENTIALS_JSON: A JSON string of your Service Account Key
 */

const propertyId = process.env.GA_PROPERTY_ID;
const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

let analyticsClient: BetaAnalyticsDataClient | null = null;

if (propertyId && credentialsJson) {
    try {
        const credentials = JSON.parse(credentialsJson);
        analyticsClient = new BetaAnalyticsDataClient({
            credentials,
        });
    } catch (error) {
        console.error('Failed to parse Google Analytics credentials:', error);
    }
}

export async function getQuickStats() {
    if (!analyticsClient || !propertyId) {
        return {
            activeUsers: 0,
            screenPageViews: 0,
            activeUsers24h: 0,
        };
    }

    try {
        // Fetch active users (real-time or last 30 mins)
        // Note: For real-time, we'd use a different method, 
        // but for a dashboard summary, last 24h is often better.
        
        const [response] = await analyticsClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [
                {
                    startDate: '1daysAgo',
                    endDate: 'today',
                },
            ],
            metrics: [
                { name: 'activeUsers' },
                { name: 'screenPageViews' },
            ],
        });

        const activeUsers24h = parseInt(response.rows?.[0]?.metricValues?.[0]?.value || '0');
        const screenPageViews = parseInt(response.rows?.[0]?.metricValues?.[1]?.value || '0');

        return {
            activeUsers: activeUsers24h, // Simplification for dashboard
            screenPageViews,
            activeUsers24h,
        };
    } catch (error) {
        console.error('Error fetching Google Analytics data:', error);
        return {
            activeUsers: 0,
            screenPageViews: 0,
            activeUsers24h: 0,
        };
    }
}
