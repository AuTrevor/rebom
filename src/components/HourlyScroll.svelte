<script lang="ts">
  // Currently static, but ready for props
</script>

<div
  class="lg:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between"
>
  <div>
    <h3 class="font-bold text-slate-800 mb-4">Next 24 Hours</h3>
    <!-- Mock Graph Container -->
    <div
      class="h-32 bg-slate-50 rounded border-b border-slate-100 flex items-end justify-between px-2 pb-2 relative overflow-hidden"
    >
      <div
        class="absolute inset-0 flex items-center justify-center text-slate-400 text-sm italic"
      >
        [Interactive Temperature/Rain Graph Placeholder]
      </div>
      <!-- Mock Bars -->
      <div class="w-2 h-10 bg-blue-200 rounded-t"></div>
      <div class="w-2 h-14 bg-blue-200 rounded-t"></div>
      <div class="w-2 h-8 bg-blue-200 rounded-t"></div>
      <div class="w-2 h-4 bg-blue-200 rounded-t"></div>
      <div class="w-2 h-12 bg-blue-200 rounded-t"></div>
      <div class="w-2 h-20 bg-blue-200 rounded-t"></div>
      <div class="w-2 h-16 bg-blue-200 rounded-t"></div>
      <div class="w-2 h-10 bg-blue-200 rounded-t"></div>
    </div>
  </div>

  <div class="mt-4">
    <div
      class="flex justify-between text-xs text-slate-500 mb-1"
    >
      <span>Sunrise 06:12</span>
      <span>Sunset 19:45</span>
    </div>
    <div
      class="h-2 bg-gradient-to-r from-orange-300 via-yellow-200 to-indigo-900 rounded-full w-full"
    >
    </div>
  </div>
</div>
