# AusWeather Core Roadmap

This document outlines the planned features and improvements for AusWeather Core, following the initial release of the 7-Day Outlook.

## Phase 1: Core Functionality (Current Focus)
- [x] Project Setup (Astro, Svelte, Tailwind, D1 Schema)
- [x] 7-Day Outlook (Interactive List View)
- [x] Basic Shell (Header, Footer)
- [x] Mock Data Layer

## Phase 2: The Command Center
- [ ] Interactive Vector Maps (Leaflet/Mapbox)
- [ ] Overlays: Rain Radar, Satellite, Lightning, Wind, Fire Hotspots
- [ ] Timeline Playback Controls

## Phase 3: Specialized Intelligence
- [ ] Marine & Coast Card (Tides, Swell, Warnings)
- [ ] Agriculture & Land Card (Soil moisture, Evapotranspiration, Frost)
- [ ] Catchments & Rivers Card (River heights, Dam capacity)
- [ ] Long-Range Outlook Card (La Niña/El Niño, Rainfall prob)
- [ ] User-customizable dashboard tiles (reordering)

## Phase 4: User Profile & Personalization
- [ ] User Authentication (Cloudflare Access or similar)
- [ ] "Sticky" location preferences (saved in D1)
- [ ] Multiple saved locations
- [ ] Unit preferences persistence

## Phase 5: Advanced UI/UX
- [ ] Dark Mode toggle (currently system preference or future toggle)
- [ ] "Commuter" View ("Will I get wet?")
- [ ] Emergency & Warnings Banner system
- [ ] Hero Section refinements (Animations)

## Phase 6: Real Data Integration
- [ ] Replace MockProvider with RealProvider (BOM API, OpenWeather, etc.)
- [ ] Implement caching strategy in D1/KV
