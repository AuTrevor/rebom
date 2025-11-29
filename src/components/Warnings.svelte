<script lang="ts">
    export let warnings: any[] = [];

    let isExpanded = false;

    function toggleExpand() {
        isExpanded = !isExpanded;
    }
</script>

{#if warnings && warnings.length > 0}
    <div class="mb-6 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 p-4 rounded shadow-md" role="alert">
        <div class="flex items-center justify-between cursor-pointer" on:click={toggleExpand} on:keydown={(e) => e.key === 'Enter' && toggleExpand()} tabindex="0" role="button" aria-expanded={isExpanded}>
            <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 class="text-lg font-bold">Active Warnings ({warnings.length})</h2>
            </div>
            <button class="focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transform transition-transform duration-200 {isExpanded ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
        </div>
        
        {#if isExpanded}
            <div class="mt-3 space-y-3">
                {#each warnings as warning}
                    <div class="bg-yellow-50 p-3 rounded border border-yellow-200">
                        <div class="flex justify-between items-start">
                            <h3 class="font-bold text-yellow-800">{warning.location_name}</h3>
                            <span class="text-xs font-semibold px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full">{warning.severity}</span>
                        </div>
                        <p class="text-sm mt-1 text-yellow-900 opacity-90">{warning.description}</p>
                        {#if warning.expiry_time}
                            <p class="text-xs mt-2 text-yellow-700">Expires: {new Date(warning.expiry_time * 1000).toLocaleString('en-AU')}</p>
                        {/if}
                    </div>
                {/each}
            </div>
        {/if}
    </div>
{/if}
