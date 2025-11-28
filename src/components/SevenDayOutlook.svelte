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

  </script>

  <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
    <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h2 class="font-bold text-lg text-slate-800">7-Day Outlook</h2>
        <span class="text-xs text-slate-500 font-medium bg-slate-200 px-2 py-1 rounded">Next 7 Days</span>
    </div>

    <div class="divide-y divide-slate-100">
      {#each forecast as day, i}
        <div class="group">
            <!-- Row Header -->
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
                class="flex flex-col sm:flex-row sm:items-center px-4 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
                on:click={() => toggleDay(i)}
            >
                <!-- Column 1: Day & Icon -->
                <div class="flex items-center w-full sm:w-1/4 mb-2 sm:mb-0">
                    <div class="w-12 text-slate-500 font-medium flex-shrink-0">{day.dayName}</div>
                    <div class="w-8 h-8 mx-2 text-2xl flex items-center justify-center">
                        <!-- Simple Icon Mapping (SVG) -->
                        {#if day.icon === 'sunny'}
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-orange-400">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                              </svg>
                        {/if}
                        {#if day.icon === 'partly-cloudy'}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-slate-400">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" />
                              </svg>
                        {/if}
                        {#if day.icon === 'cloudy'}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-slate-600">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" />
                            </svg>
                        {/if}
                        {#if day.icon === 'rain'}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-blue-500">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" />
                                <path stroke-linecap="round" stroke-linejoin="round" d="m15 15-1.5 1.5M9 15l-1.5 1.5M12 15l-1.5 1.5" />
                              </svg>
                        {/if}
                        {#if day.icon === 'storm'}
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-purple-600">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                              </svg>
                        {/if}
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
                    <span class="text-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
                          </svg>
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
                    <span class="mr-1 text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                          </svg>
                    </span>
                    <span>{day.windDirection} {day.windSpeedRange}</span>
                 </div>

                 <!-- Expand Arrow -->
                 <div class="hidden sm:block ml-4 text-slate-300 transform transition-transform duration-200 {expandedDayIndex === i ? 'rotate-180' : ''}">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                 </div>
            </div>

            <!-- Expanded Details -->
            {#if expandedDayIndex === i}
                <div transition:slide class="bg-slate-50 px-6 py-4 border-t border-slate-100">
                    <p class="text-sm text-slate-700 mb-4 font-medium">{day.summary}</p>

                    <!-- 3-Hourly Breakdown -->
                    <div class="grid grid-cols-4 sm:grid-cols-8 gap-2">
                        {#each day.hourlyBreakdown as hour}
                            <div class="flex flex-col items-center p-2 bg-white rounded border border-slate-100 shadow-sm">
                                <span class="text-xs text-slate-400 mb-1">{hour.time}</span>
                                <span class="mb-1 text-slate-600">
                                    {#if hour.icon === 'sunny'}
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-orange-400">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                                        </svg>
                                    {/if}
                                    {#if hour.icon === 'rain'}
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-blue-500">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" d="m15 15-1.5 1.5M9 15l-1.5 1.5M12 15l-1.5 1.5" />
                                        </svg>
                                    {/if}
                                    {#if hour.icon === 'partly-cloudy'}
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-slate-400">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" />
                                        </svg>
                                    {/if}
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
  </div>
