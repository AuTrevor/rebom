import { XMLParser } from 'fast-xml-parser';

/**
 * Type-safe interfaces based on BOM product.xsd schema
 */

// AMOC Metadata interfaces
export interface AmocMetadata {
    source: {
        sender: string;
        region: string;
        office: string;
        copyright: string;
        disclaimer: string;
    };
    identifier: string;
    'issue-time-utc': string;
    'issue-time-local': {
        '#text': string;
        '@_tz': string;
    };
    'sent-time': string;
    'expiry-time': string;
    'validity-bgn-time-local': {
        '#text': string;
        '@_tz': string;
    };
    'validity-end-time-local': {
        '#text': string;
        '@_tz': string;
    };
    'next-routine-issue-time-utc': string;
    'next-routine-issue-time-local': {
        '#text': string;
        '@_tz': string;
    };
    status: string;
    service: string;
    'sub-service': string;
    'product-type': string;
    phase: string;
}

// Forecast element interface
export interface ForecastElement {
    '@_type': string;
    '@_units'?: string;
    '@_instance'?: string;
    '@_sequence'?: number;
    '@_duration'?: number;
    '@_time-utc'?: string;
    '@_time-local'?: string;
    '@_start-time-utc'?: string;
    '@_start-time-local'?: string;
    '@_end-time-utc'?: string;
    '@_end-time-local'?: string;
    '#text': string | number;
}

// Forecast text interface
export interface ForecastText {
    '@_type': string;
    '#text': string;
}

// Forecast period interface
export interface ForecastPeriod {
    '@_index'?: number;
    '@_end-index'?: number;
    '@_index-tag'?: string;
    '@_start-time-utc'?: string;
    '@_start-time-local': string;
    '@_end-time-utc'?: string;
    '@_end-time-local': string;
    '@_end-date-local'?: string;
    element?: ForecastElement | ForecastElement[];
    text?: ForecastText | ForecastText[];
}

// Area interface
export interface ForecastArea {
    '@_aac': string;
    '@_parent-aac'?: string;
    '@_description': string;
    '@_type': string;
    'forecast-period'?: ForecastPeriod | ForecastPeriod[];
}

// Forecast interface
export interface Forecast {
    area: ForecastArea | ForecastArea[];
}

// Product interface
export interface Product {
    amoc: AmocMetadata;
    forecast?: Forecast;
}

// Parsed data structure
export interface ParsedBomData {
    metadata: AmocMetadata;
    areas: ForecastArea[];
}

/**
 * BOM Precis Data Handler
 * Parses and extracts data from BOM Precis forecast XML files
 */
export class BomPrecisDataHandler {
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

    /**
     * Parse the XML data
     */
    parse(): void {
        this.parsedData = this.parser.parse(this.xmlData);
    }

    /**
     * Extract AMOC metadata from parsed XML
     */
    extractAmocMetadata(): AmocMetadata {
        if (!this.parsedData) {
            throw new Error('XML data not parsed. Call parse() first.');
        }

        const amoc = this.parsedData.product?.amoc;
        if (!amoc) {
            throw new Error('No AMOC metadata found in XML');
        }

        return amoc;
    }

    /**
     * Extract all areas from forecast section
     * Returns flat array of all areas (regions, districts, and locations)
     */
    extractAreas(): ForecastArea[] {
        if (!this.parsedData) {
            throw new Error('XML data not parsed. Call parse() first.');
        }

        const forecast = this.parsedData.product?.forecast;
        if (!forecast || !forecast.area) {
            return [];
        }

        // Normalize to array
        return Array.isArray(forecast.area) ? forecast.area : [forecast.area];
    }

    /**
     * Extract areas grouped by hierarchy level
     */
    extractAreasByLevel(): {
        regions: ForecastArea[];
        districts: ForecastArea[];
        locations: ForecastArea[];
    } {
        const allAreas = this.extractAreas();

        return {
            regions: allAreas.filter(area => area['@_type'] === 'region'),
            districts: allAreas.filter(area => area['@_type'] === 'public-district'),
            locations: allAreas.filter(area => area['@_type'] === 'location')
        };
    }

    /**
     * Extract forecast periods for a specific area
     */
    extractForecastPeriods(area: ForecastArea): ForecastPeriod[] {
        const periods = area['forecast-period'];
        if (!periods) {
            return [];
        }

        return Array.isArray(periods) ? periods : [periods];
    }

    /**
     * Extract all elements from a forecast period
     */
    extractElements(period: ForecastPeriod): ForecastElement[] {
        const elements = period.element;
        if (!elements) {
            return [];
        }

        return Array.isArray(elements) ? elements : [elements];
    }

    /**
     * Extract all text elements from a forecast period
     */
    extractTexts(period: ForecastPeriod): ForecastText[] {
        const texts = period.text;
        if (!texts) {
            return [];
        }

        return Array.isArray(texts) ? texts : [texts];
    }

    /**
     * Helper: Get specific element value by type
     */
    getElementValue(period: ForecastPeriod, type: string): string | number | null {
        const elements = this.extractElements(period);
        const element = elements.find(el => el['@_type'] === type);
        return element ? element['#text'] : null;
    }

    /**
     * Helper: Get specific text value by type
     */
    getTextValue(period: ForecastPeriod, type: string): string | null {
        const texts = this.extractTexts(period);
        const text = texts.find(txt => txt['@_type'] === type);
        return text ? text['#text'] : null;
    }

    /**
     * Convert elements array to JSON object for storage
     */
    elementsToJSON(period: ForecastPeriod): string {
        const elements = this.extractElements(period);
        const elementsObj: Record<string, any> = {};

        for (const element of elements) {
            const type = element['@_type'];
            elementsObj[type] = {
                value: element['#text'],
                ...(element['@_units'] && { units: element['@_units'] }),
                ...(element['@_instance'] && { instance: element['@_instance'] }),
                ...(element['@_sequence'] !== undefined && { sequence: element['@_sequence'] }),
                ...(element['@_duration'] && { duration: element['@_duration'] }),
                ...(element['@_time-utc'] && { timeUtc: element['@_time-utc'] }),
                ...(element['@_time-local'] && { timeLocal: element['@_time-local'] }),
                ...(element['@_start-time-utc'] && { startTimeUtc: element['@_start-time-utc'] }),
                ...(element['@_start-time-local'] && { startTimeLocal: element['@_start-time-local'] }),
                ...(element['@_end-time-utc'] && { endTimeUtc: element['@_end-time-utc'] }),
                ...(element['@_end-time-local'] && { endTimeLocal: element['@_end-time-local'] })
            };
        }

        return JSON.stringify(elementsObj);
    }

    /**
     * Convert texts array to JSON object for storage
     */
    textsToJSON(period: ForecastPeriod): string {
        const texts = this.extractTexts(period);
        const textsObj: Record<string, string> = {};

        for (const text of texts) {
            textsObj[text['@_type']] = text['#text'];
        }

        return JSON.stringify(textsObj);
    }

    /**
     * Get complete parsed data
     */
    getParsedData(): ParsedBomData {
        return {
            metadata: this.extractAmocMetadata(),
            areas: this.extractAreas()
        };
    }
}
