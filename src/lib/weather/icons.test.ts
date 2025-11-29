import { describe, it, expect } from 'vitest';
import { getIconFromCode } from './icons';

describe('getIconFromCode', () => {
    it('should return sunny for code 1 and clear for 2', () => {
        expect(getIconFromCode(1)).toBe('sunny');
        expect(getIconFromCode(2)).toBe('clear');
    });

    it('should return partly-cloudy for code 3', () => {
        expect(getIconFromCode(3)).toBe('partly-cloudy');
    });

    it('should return cloudy for code 4 and haze for 6', () => {
        expect(getIconFromCode(4)).toBe('cloudy');
        expect(getIconFromCode(6)).toBe('haze');
    });

    it('should return specific rain codes', () => {
        expect(getIconFromCode(8)).toBe('light-rain');
        expect(getIconFromCode(11)).toBe('showers');
        expect(getIconFromCode(12)).toBe('rain');
        expect(getIconFromCode(17)).toBe('light-showers');
        expect(getIconFromCode(18)).toBe('heavy-showers');
    });

    it('should return specific storm codes', () => {
        expect(getIconFromCode(16)).toBe('storm');
        expect(getIconFromCode(19)).toBe('tropical-cyclone');
    });

    it('should return specific codes for fog/dust/wind', () => {
        expect(getIconFromCode(10)).toBe('fog');
        expect(getIconFromCode(13)).toBe('dusty');
        expect(getIconFromCode(9)).toBe('wind');
    });

    it('should return specific codes for snow/frost', () => {
        expect(getIconFromCode(15)).toBe('snow');
        expect(getIconFromCode(14)).toBe('frost');
    });

    it('should handle string inputs', () => {
        expect(getIconFromCode('1')).toBe('sunny');
        expect(getIconFromCode('16')).toBe('storm');
    });

    it('should return partly-cloudy for unknown codes', () => {
        expect(getIconFromCode(99)).toBe('partly-cloudy');
    });
});
