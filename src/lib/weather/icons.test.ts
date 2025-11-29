import { describe, it, expect } from 'vitest';
import { getIconFromCode } from './icons';

describe('getIconFromCode', () => {
    it('should return sunny for code 1 and 2', () => {
        expect(getIconFromCode(1)).toBe('sunny');
        expect(getIconFromCode(2)).toBe('sunny');
    });

    it('should return partly-cloudy for code 3', () => {
        expect(getIconFromCode(3)).toBe('partly-cloudy');
    });

    it('should return cloudy for code 4 and 6', () => {
        expect(getIconFromCode(4)).toBe('cloudy');
        expect(getIconFromCode(6)).toBe('cloudy');
    });

    it('should return rain for rain codes', () => {
        expect(getIconFromCode(8)).toBe('rain');
        expect(getIconFromCode(11)).toBe('rain');
        expect(getIconFromCode(12)).toBe('rain');
        expect(getIconFromCode(17)).toBe('rain');
        expect(getIconFromCode(18)).toBe('rain');
    });

    it('should return storm for storm codes', () => {
        expect(getIconFromCode(16)).toBe('storm');
        expect(getIconFromCode(19)).toBe('storm');
    });

    it('should return cloudy for fog/dust/wind', () => {
        expect(getIconFromCode(10)).toBe('cloudy');
        expect(getIconFromCode(13)).toBe('cloudy');
        expect(getIconFromCode(9)).toBe('cloudy');
    });

    it('should return rain for snow/frost (fallback)', () => {
        expect(getIconFromCode(15)).toBe('rain');
        expect(getIconFromCode(14)).toBe('rain');
    });

    it('should handle string inputs', () => {
        expect(getIconFromCode('1')).toBe('sunny');
        expect(getIconFromCode('16')).toBe('storm');
    });

    it('should return partly-cloudy for unknown codes', () => {
        expect(getIconFromCode(99)).toBe('partly-cloudy');
    });
});
