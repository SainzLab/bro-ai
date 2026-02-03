<template>
  <div class="w-full bg-transparent">
    <div class="relative flex items-end gap-3">
      
      <div class="flex-1 bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center px-4 py-3 min-h-[56px] shadow-lg focus-within:ring-1 focus-within:ring-zinc-600 transition-all">

        <input 
          v-model="inputValue"
          @keyup.enter="handleSend"
          type="text" 
          placeholder="Ketik pesan..." 
          class="bg-transparent text-white w-full text-base outline-none placeholder-zinc-600"
        />

      </div>

      <button 
        @click="handleSend"
        class="w-[56px] h-[56px] rounded-full bg-white hover:bg-gray-200 text-black flex items-center justify-center shadow-lg transition transform active:scale-95 flex-shrink-0">
        <i class="fas fa-arrow-right text-lg"></i>
      </button>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const inputValue = ref('');
const emit = defineEmits(['send']);

const handleSend = () => {
  if (!inputValue.value.trim()) return;
  emit('send', inputValue.value);
  inputValue.value = '';
};
</script>