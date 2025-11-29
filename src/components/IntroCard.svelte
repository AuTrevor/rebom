<script lang="ts">
  import { slide } from 'svelte/transition';

  let isOpen = true;

  function toggle() {
    isOpen = !isOpen;
  }
</script>

<div class="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden mb-8 transition-all duration-300 hover:shadow-xl">
  <button 
    on:click={toggle}
    class="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 text-left group"
    aria-expanded={isOpen}
  >
    <div class="flex items-center gap-4">
      <div class="bg-white/20 text-white p-2.5 rounded-xl backdrop-blur-sm shadow-inner ring-1 ring-white/30">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <h3 class="font-bold text-white text-xl tracking-tight">Welcome to ReBOM</h3>
        <p class="text-blue-100 text-sm font-medium opacity-90">A semi-satirical take on Government Procurement</p>
      </div>
    </div>
    
    <div class="bg-white/10 p-2 rounded-full group-hover:bg-white/20 transition-colors">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        class="h-5 w-5 text-white transform transition-transform duration-300 {isOpen ? 'rotate-180' : ''}" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </button>

  {#if isOpen}
    <div transition:slide={{ duration: 300 }} class="px-8 py-6 text-slate-600 leading-relaxed bg-slate-50/50">
      <slot>
        <p>
          Welcome to the Re-BoM experience. This project aims to provide a cleaner, faster, and more modern interface for accessing Australia's weather data.
        </p>
        <p class="mt-3">
          <strong>Key Features:</strong>
        </p>
        <ul class="list-disc list-inside mt-2 space-y-1 ml-2">
          <li>Real-time weather updates from BOM feeds</li>
          <li>Interactive weather maps</li>
          <li>Detailed 7-day forecasts</li>
          <li>State-based warning notifications</li>
        </ul>
      </slot>
    </div>
  {/if}
</div>
