<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { DailyForecast } from '../lib/weather/types';
    import { slide } from 'svelte/transition';

    export let forecast: DailyForecast[] = [];

    let expandedDayIndex: number | null = null;

    function toggleDay(index: number) {
      if (expandedDayIndex === index) {
        expandedDayIndex = null;
      } else {
        expandedDayIndex = index;
      }
    }

    // Helper to determine bar color based on temp
    function getTempColor(temp: number): string {
        if (temp < 10) return 'bg-blue-500';
        if (temp < 20) return 'bg-teal-400';
        if (temp < 30) return 'bg-orange-400';
        return 'bg-red-500';
    }

    // Helper for rain
    function getRainColor(prob: number): string {
        if (prob < 20) return 'text-slate-400';
        if (prob < 50) return 'text-blue-400';
        return 'text-blue-600 font-bold';
    }

    function handleKeydown(event: KeyboardEvent, index: number) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleDay(index);
        }
    }
    // Map internal icon names to Material Symbols
    const iconMap: Record<string, string> = {
        'sunny': 'sunny',
        'clear': 'clear_day', // or nightlight_round if we had night info
        'partly-cloudy': 'partly_cloudy_day',
        'cloudy': 'cloud',
        'haze': 'mist',
        'light-rain': 'rainy',
        'wind': 'air',
        'fog': 'foggy',
        'showers': 'rainy',
        'rain': 'rainy',
        'dusty': 'lens_blur', // approximate
        'frost': 'ac_unit',
        'snow': 'weather_snowy',
        'storm': 'thunderstorm',
        'light-showers': 'rainy',
        'heavy-showers': 'rainy', // could use a heavier rain icon if available
        'tropical-cyclone': 'cyclone'
    };

    function getMaterialIcon(iconName: string): string {
        return iconMap[iconName] || 'help_outline';
    }

    function getIconColorClass(iconName: string): string {
        switch (iconName) {
            case 'sunny':
            case 'clear':
                return 'text-orange-400';
            case 'rain':
            case 'light-rain':
            case 'showers':
            case 'light-showers':
            case 'heavy-showers':
            case 'frost':
            case 'snow':
                return 'text-blue-500';
            case 'storm':
            case 'tropical-cyclone':
                return 'text-purple-600';
            case 'partly-cloudy':
                return 'text-slate-400';
            default:
                return 'text-slate-600';
        }
    }
  </script>

  <section class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden" aria-label="7-Day Weather Outlook">
    <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h2 class="font-bold text-lg text-slate-800">7-Day Outlook</h2>
        <span class="text-xs text-slate-500 font-medium bg-slate-200 px-2 py-1 rounded">Next 7 Days</span>
    </div>

    <div class="divide-y divide-slate-100">
      {#each forecast as day, i}
        <div class="group">
            <!-- Row Header -->
            <button
                class="w-full text-left flex flex-col sm:flex-row sm:items-center px-4 py-4 cursor-pointer hover:bg-slate-50 transition-colors focus:outline-none focus:bg-slate-50 focus:ring-2 focus:ring-inset focus:ring-blue-500"
                on:click={() => toggleDay(i)}
                on:keydown={(e) => handleKeydown(e, i)}
                aria-expanded={expandedDayIndex === i}
                aria-controls="details-{i}"
            >
                <!-- Column 1: Day & Icon -->
                <div class="flex items-center w-full sm:w-1/4 mb-2 sm:mb-0">
                    <div class="w-12 text-slate-500 font-medium flex-shrink-0">{day.dayName}</div>
                    <div class="w-8 h-8 mx-2 text-2xl flex items-center justify-center">
                        <span class="material-symbols-outlined {getIconColorClass(day.icon)} text-3xl">
                            {getMaterialIcon(day.icon)}
                        </span>
                    </div>
                    <div class="text-sm text-slate-400 sm:hidden ml-2 truncate">{day.summary}</div>
                </div>

                <!-- Column 2: Temps (Visual Bar) -->
                <div class="flex-1 px-4 flex items-center space-x-3 w-full sm:w-auto mb-2 sm:mb-0">
                    <span class="text-sm text-slate-500 w-8 text-right">{day.minTemp}°</span>
                    <div class="flex-1 h-2 bg-slate-100 rounded-full relative mx-2 min-w-[60px]">
                        <!-- Visual representation of range relative to a fixed scale (e.g. 0 to 40) -->
                        <div
                            class="absolute top-0 bottom-0 rounded-full opacity-80 {getTempColor(day.maxTemp)}"
                            style="left: {Math.max(0, (day.minTemp) * 2.5)}%; width: {Math.max(5, (day.maxTemp - day.minTemp) * 2.5)}%;"
                        ></div>
                    </div>
                    <span class="text-sm text-slate-900 font-bold w-8">{day.maxTemp}°</span>
                </div>

                <!-- Column 3: Rain -->
                <div class="w-full sm:w-1/5 flex items-center sm:justify-center mb-1 sm:mb-0 space-x-2 sm:space-x-0">
                    <span class="text-blue-500 flex items-center">
                        <span class="material-symbols-outlined text-xl">water_drop</span>
                    </span>
                    <div class="flex flex-col ml-1">
                        <span class="text-sm {getRainColor(day.rainProbability)}">{day.rainProbability}%</span>
                        {#if day.rainProbability > 0}
                             <span class="text-xs text-slate-400">{day.rainAmountRange}</span>
                        {/if}
                    </div>
                </div>

                <!-- Column 4: Wind -->
                 <div class="w-full sm:w-1/5 flex items-center sm:justify-end text-sm text-slate-600">
                    <span class="mr-1 text-slate-400 flex items-center">
                        <span class="material-symbols-outlined text-xl">air</span>
                    </span>
                    <span>{day.windDirection} {day.windSpeedRange}</span>
                 </div>

                 <!-- Expand Arrow -->
                 <div class="hidden sm:block ml-4 text-slate-300 transform transition-transform duration-200 {expandedDayIndex === i ? 'rotate-180' : ''} flex items-center">
                    <span class="material-symbols-outlined">expand_more</span>
                 </div>
            </button>

            <!-- Expanded Details -->
            {#if expandedDayIndex === i}
                <div
                    id="details-{i}"
                    transition:slide
                    class="bg-slate-50 px-6 py-4 border-t border-slate-100"
                >
                    <p class="text-sm text-slate-700 mb-4 font-medium">{day.summary}</p>

                    <!-- 3-Hourly Breakdown -->
                    <div class="grid grid-cols-4 sm:grid-cols-8 gap-2">
                        {#each day.hourlyBreakdown as hour}
                            <div class="flex flex-col items-center p-2 bg-white rounded border border-slate-100 shadow-sm">
                                <span class="text-xs text-slate-400 mb-1">{hour.time}</span>
                                <span class="mb-1 text-slate-600">
                                    <span class="material-symbols-outlined {getIconColorClass(hour.icon)} text-2xl">
                                        {getMaterialIcon(hour.icon)}
                                    </span>
                                </span>
                                <span class="text-sm font-bold text-slate-800">{hour.temp}°</span>
                                {#if hour.rainProbability > 0}
                                    <span class="text-[10px] text-blue-500 mt-1">{hour.rainProbability}%</span>
                                {/if}
                            </div>
                        {/each}
                    </div>
                </div>
            {/if}
        </div>
      {/each}
    </div>
  </section>
