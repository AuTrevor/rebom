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
            return 'sunny';
        case 2:
            return 'clear';
        case 3:
            return 'partly-cloudy';
        case 4:
            return 'cloudy';
        case 6:
            return 'haze';
        case 8:
            return 'light-rain';
        case 9:
            return 'wind';
        case 10:
            return 'fog';
        case 11:
            return 'showers';
        case 12:
            return 'rain';
        case 13:
            return 'dusty';
        case 14:
            return 'frost';
        case 15:
            return 'snow';
        case 16:
            return 'storm';
        case 17:
            return 'light-showers';
        case 18:
            return 'heavy-showers';
        case 19:
            return 'tropical-cyclone';
        default:
            return 'partly-cloudy'; // Safe default
    }
}
