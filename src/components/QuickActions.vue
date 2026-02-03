<template>
  <div class="flex justify-end gap-2 px-6 mb-2">
    <button 
      v-for="action in actions" 
      :key="action"
      @click="$emit('action-click', action)"
      class="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs px-4 py-2 rounded-full border border-zinc-700 transition shadow-sm backdrop-blur-sm"
    >
      {{ action }}
    </button>
  </div>
</template>

<script setup>
const actions = ['Summarize', 'Expand'];
defineEmits(['action-click']);
</script>