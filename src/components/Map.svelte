<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import 'leaflet/dist/leaflet.css';

    export let lat: number;
    export let lon: number;
    export let zoom: number = 13;
    export let locationName: string;

    let mapElement: HTMLElement;
    let map: any;

    onMount(async () => {
        if (typeof window !== 'undefined') {
            const L = (await import('leaflet')).default;

            map = L.map(mapElement).setView([lat, lon], zoom);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            L.marker([lat, lon]).addTo(map)
                .bindPopup(locationName)
                .openPopup();
        }
    });

    onDestroy(() => {
        if (map) {
            map.remove();
        }
    });

    // React to prop changes
    $: if (map && lat && lon) {
        map.setView([lat, lon], zoom);
        // Update marker? For simplicity, we just re-center. 
        // Ideally we'd keep a reference to the marker and update it.
    }
</script>

<div bind:this={mapElement} class="w-full h-full rounded-2xl z-0"></div>

<style>
    /* Ensure map container has height */
    div {
        min-height: 300px;
    }
</style>
