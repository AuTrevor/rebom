import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SevenDayOutlook from './SevenDayOutlook.svelte';
import type { DailyForecast } from '../lib/weather/types';

// Mock Web Animations API
beforeEach(() => {
    // @ts-ignore
    window.Element.prototype.animate = vi.fn().mockImplementation(() => ({
        finished: Promise.resolve(),
        onfinish: null,
        cancel: vi.fn(),
        play: vi.fn(),
        pause: vi.fn(),
    }));
});

afterEach(() => {
    cleanup();
});

// Mock data
const mockForecast: DailyForecast[] = [
    {
        date: '2023-10-27',
        dayName: 'Today',
        icon: 'sunny',
        minTemp: 15,
        maxTemp: 25,
        rainProbability: 0,
        rainAmountRange: '0mm',
        windSpeedRange: '10-15km/h',
        windDirection: 'SE',
        summary: 'Sunny day',
        hourlyBreakdown: [
            { time: '09:00', temp: 18, icon: 'sunny', rainProbability: 0 },
            { time: '12:00', temp: 24, icon: 'sunny', rainProbability: 0 }
        ]
    },
    {
        date: '2023-10-28',
        dayName: 'Mon',
        icon: 'rain',
        minTemp: 14,
        maxTemp: 20,
        rainProbability: 80,
        rainAmountRange: '5-10mm',
        windSpeedRange: '15-25km/h',
        windDirection: 'S',
        summary: 'Rainy day',
        hourlyBreakdown: []
    }
];

describe('SevenDayOutlook', () => {
    it('renders the title', () => {
        render(SevenDayOutlook, { forecast: mockForecast });
        expect(screen.getByText('7-Day Outlook')).toBeInTheDocument();
    });

    it('renders all forecast days', () => {
        render(SevenDayOutlook, { forecast: mockForecast });
        expect(screen.getAllByText('Today').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Mon').length).toBeGreaterThan(0);
    });

    it('expands details on click', async () => {
        render(SevenDayOutlook, { forecast: mockForecast });

        // Initial state
        const detailsId = 'details-0';
        expect(document.getElementById(detailsId)).toBeNull();

        // Click the first day row (button)
        const button = screen.getAllByRole('button', { expanded: false })[0];
        await fireEvent.click(button);

        // Expect details to be visible
        await waitFor(() => {
             expect(document.getElementById(detailsId)).toBeInTheDocument();
        });

        // Check for specific content
        expect(screen.getAllByText('Sunny day').length).toBeGreaterThan(0);
    });

    it('has accessible attributes', async () => {
        // Render with a fresh component
        const { getAllByRole } = render(SevenDayOutlook, { forecast: mockForecast });
        const buttons = getAllByRole('button');
        const firstButton = buttons[0];

        // Check length
        expect(buttons.length).toBe(2);

        // Check initial state
        const expanded = firstButton.getAttribute('aria-expanded');
        expect(expanded).toBe('false');

        await fireEvent.click(firstButton);

        await waitFor(() => {
             expect(firstButton).toHaveAttribute('aria-expanded', 'true');
        });
    });
});
