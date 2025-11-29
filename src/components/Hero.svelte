<script lang="ts">
  import { onMount } from 'svelte';
  import { formatIssueTime } from '../lib/date-utils';

  export let location: {
    name: string;
    hierarchy: string;
  };
  export let current: {
    temperature: number;
    feelsLike: number;
    description: string;
    windDirection: string;
    windSpeed: number;
    humidity: number;
    pressure: number;
  };
  export let metadata: {
    issueTime: string;
  };
  export let forecast: any[];

  let isFavorite = false;

  function getFavorites(): string[] {
    const match = document.cookie.match(new RegExp('(^| )weather_favorites=([^;]+)'));
    if (match) {
      try {
        return JSON.parse(decodeURIComponent(match[2]));
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  function setFavorites(favorites: string[]) {
    const date = new Date();
    date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 year
    document.cookie = "weather_favorites=" + encodeURIComponent(JSON.stringify(favorites)) + "; expires=" + date.toUTCString() + "; path=/";
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('favoritesUpdated', { detail: favorites }));
  }

  function toggleFavorite() {
    let favorites = getFavorites();
    const index = favorites.indexOf(location.name);
    
    if (index > -1) {
      favorites.splice(index, 1);
      isFavorite = false;
    } else {
      favorites.push(location.name);
      isFavorite = true;
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          message: 'Saved to favourites',
          type: 'success'
        }
      }));
    }
    setFavorites(favorites);
  }

  onMount(() => {
    const favorites = getFavorites();
    isFavorite = favorites.includes(location.name);
  });
</script>

<div
  class="lg:col-span-7 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden"
>
  <!-- Background Decoration -->
  <div
    class="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"
  >
  </div>

  <div class="relative z-10">
    <span class="text-blue-200 text-sm block sm:inline-block">
        {location.hierarchy}
      </span>
    <div class="mb-1"><button
        id="favorite-btn"
        class="inline-block transition-colors duration-200 focus:outline-none {isFavorite ? 'text-yellow-400' : 'text-blue-200 hover:text-yellow-400'}"
        aria-label="Toggle favorite"
        on:click={toggleFavorite}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill={isFavorite ? "currentColor" : "none"} viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
        </svg>
      </button>
      <h1 class="text-3xl font-bold inline-block mr-2">
        {location.name}
      </h1>
      
      
    </div>
    <p class="text-blue-100 text-sm mb-6">
      {current.description}
      {#if metadata.issueTime}
        <span class="block text-xs opacity-75 mt-1">
          Issued: {formatIssueTime(metadata.issueTime)}
        </span>
      {/if}
    </p>

    <div
      class="flex flex-col md:flex-row md:items-end md:justify-between"
    >
      <div>
        <div class="text-7xl font-bold tracking-tighter">
          {current.temperature}°
        </div>
        <div class="text-blue-100 mt-2">
          Feels like {current.feelsLike}° •
          High {forecast[0].maxTemp}° / Low {
            forecast[0].minTemp
          }°
        </div>
      </div>
      <div
        class="mt-6 md:mt-0 grid grid-cols-2 gap-x-8 gap-y-4 text-sm"
      >
        <div class="flex items-center space-x-2">
          <span class="opacity-70">Wind</span>
          <span class="font-bold"
            >{current.windDirection}
            {current.windSpeed}km/h</span
          >
        </div>
        <div class="flex items-center space-x-2">
          <span class="opacity-70">Humidity</span>
          <span class="font-bold"
            >{current.humidity}%</span
          >
        </div>
        <div class="flex items-center space-x-2">
          <span class="opacity-70">UV Index</span>
          <span
            class="font-bold bg-white text-blue-600 px-1.5 rounded text-xs"
            >11+</span
          >
        </div>
        <div class="flex items-center space-x-2">
          <span class="opacity-70">Pressure</span>
          <span class="font-bold"
            >{current.pressure}hPa</span
          >
        </div>
      </div>
    </div>
  </div>
</div>
