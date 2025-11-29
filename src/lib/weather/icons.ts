/**
 * Maps BOM forecast icon codes to internal icon names.
 * Based on standard BOM icon codes.
 */
export function getIconFromCode(code: number | string): string {
    const iconCode = typeof code === 'string' ? parseInt(code, 10) : code;

    // Standard BOM Icon Codes Mapping
    // 1: Sunny
    // 2: Clear
    // 3: Partly cloudy
    // 4: Cloudy
    // 6: Haze
    // 8: Light rain
    // 9: Wind
    // 10: Fog
    // 11: Showers
    // 12: Rain
    // 13: Dusty
    // 14: Frost
    // 15: Snow
    // 16: Storm
    // 17: Light showers
    // 18: Heavy showers
    // 19: Tropical cyclone

    switch (iconCode) {
        case 1:
        case 2:
            return 'sunny';
        case 3:
            return 'partly-cloudy';
        case 4:
        case 6: // Haze treated as cloudy/partly cloudy usually, but let's map to cloudy
            return 'cloudy';
        case 8: // Light rain
        case 11: // Showers
        case 17: // Light showers
            return 'rain'; // We can distinguish later if we have more icons
        case 12: // Rain
        case 18: // Heavy showers
            return 'rain';
        case 16: // Storm
        case 19: // Cyclone
            return 'storm';
        case 10: // Fog
        case 13: // Dusty
        case 9: // Wind
            return 'cloudy'; // Fallback for now
        case 15: // Snow
        case 14: // Frost
            return 'rain'; // Fallback as we don't have snow icon yet
        default:
            return 'partly-cloudy'; // Safe default
    }
}
