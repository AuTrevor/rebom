import { XMLParser } from 'fast-xml-parser';

export interface BomWarning {
    id: string;
    location_name: string;
    description: string;
    expiry_time: number;
    severity: string;
    created_at: number;
}

interface RssItem {
    title: string;
    link: string;
    pubDate: string;
    guid: string | { '#text': string };
    description?: string;
}

export class BomWarningDataHandler {
    private parser: XMLParser;
    private xmlData: string;
    private parsedData: any;

    constructor(xmlData: string) {
        this.xmlData = xmlData;
        this.parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '@_',
            parseAttributeValue: true,
            trimValues: true
        });
        this.parsedData = null;
    }

    parse(): void {
        this.parsedData = this.parser.parse(this.xmlData);
    }

    extractWarnings(): BomWarning[] {
        if (!this.parsedData) {
            throw new Error('XML data not parsed. Call parse() first.');
        }

        const channel = this.parsedData.rss?.channel;
        if (!channel || !channel.item) {
            return [];
        }

        const items: RssItem[] = Array.isArray(channel.item) ? channel.item : [channel.item];
        const warnings: BomWarning[] = [];
        const now = Math.floor(Date.now() / 1000);

        for (const item of items) {
            // Filter out summary items or non-warning items if possible
            // For now, we assume all items are warnings or cancellations

            // Extract location from title (e.g., "Cancellation of Severe Weather Warning for East Gippsland...")
            // or "Severe Thunderstorm Warning for Narooma"
            let location = "Unknown Location";
            let severity = "Unknown";

            if (item.title.includes("for")) {
                const parts = item.title.split("for");
                if (parts.length > 1) {
                    location = parts[1].trim();
                }
            }

            // Determine severity based on title
            if (item.title.toLowerCase().includes("severe")) {
                severity = "Severe";
            } else if (item.title.toLowerCase().includes("warning")) {
                severity = "Warning";
            } else if (item.title.toLowerCase().includes("cancellation")) {
                severity = "Cancellation";
            }

            // Generate a unique ID based on the link or guid
            let id: string;
            if (typeof item.guid === 'object' && item.guid !== null) {
                id = (item.guid as any)['#text'];
            } else {
                id = (item.guid as string) || item.link;
            }

            // Default expiry to 24 hours from now as it's not in the RSS item
            // Ideally we would fetch the link to get the full details including expiry
            const expiry = now + 24 * 60 * 60;

            warnings.push({
                id: id,
                location_name: location,
                description: item.title, // Use title as description for now
                expiry_time: expiry,
                severity: severity,
                created_at: now
            });
        }

        return warnings;
    }
}
