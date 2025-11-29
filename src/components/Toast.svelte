<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { fade, fly } from 'svelte/transition';

  interface ToastMessage {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
  }

  let toasts: ToastMessage[] = [];
  let counter = 0;

  function addToast(event: CustomEvent) {
    const { message, type = 'success', duration = 3000 } = event.detail;
    const id = counter++;
    
    toasts = [...toasts, { id, message, type }];

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }

  function removeToast(id: number) {
    toasts = toasts.filter(t => t.id !== id);
  }

  onMount(() => {
    window.addEventListener('show-toast', addToast as EventListener);
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('show-toast', addToast as EventListener);
    }
  });
</script>

<div class="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
  {#each toasts as toast (toast.id)}
    <div
      in:fly={{ y: 20, duration: 300 }}
      out:fade={{ duration: 200 }}
      class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white min-w-[300px]
        {toast.type === 'success' ? 'bg-gray-900' : 
         toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}"
    >
      {#if toast.type === 'success'}
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
      {:else if toast.type === 'error'}
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
      {/if}
      <span class="font-medium text-sm">{toast.message}</span>
    </div>
  {/each}
</div>
