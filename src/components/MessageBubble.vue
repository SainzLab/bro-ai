<template>
  <div class="flex w-full mb-2" :class="isUser ? 'justify-end' : 'justify-start'">
    <div 
      class="max-w-[80%] px-4 py-3 text-sm leading-relaxed relative shadow-md break-words whitespace-pre-wrap"
      :class="isUser 
        ? 'bg-zinc-200 text-black rounded-2xl rounded-tr-sm' 
        : 'bg-zinc-800 text-zinc-200 rounded-2xl rounded-tl-sm'"
    >
      {{ text }}
    </div>
  </div>
</template>

<script setup>
defineProps({ text: String, isUser: Boolean });
</script>