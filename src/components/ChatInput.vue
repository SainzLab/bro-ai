<template>
  <div class="w-full px-4 pb-6 pt-4 bg-zinc-950/80 backdrop-blur-xl border-t border-white/5 transition-all duration-300">
    
    <div class="max-w-4xl mx-auto relative flex items-end gap-3">
      
      <div class="flex-1 relative group">
        <div class="absolute -inset-0.5 bg-emerald-500/20 rounded-3xl opacity-0 group-focus-within:opacity-100 transition duration-500 blur"></div>
        
        <div class="relative bg-zinc-900 border border-zinc-800 group-focus-within:border-emerald-500/50 rounded-3xl flex items-center px-5 py-3 min-h-[52px] shadow-lg transition-all duration-300">
          <input 
            v-model="inputValue"
            @keyup.enter="handleSend"
            type="text" 
            placeholder="Ketik pesan untuk Qwen..." 
            class="bg-transparent text-zinc-100 w-full text-[15px] outline-none placeholder-zinc-500"
            autocomplete="off"
          />
        </div>
      </div>

      <button 
        @click="handleSend"
        :disabled="!inputValue.trim()"
        class="w-[52px] h-[52px] rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 transform active:scale-95 flex-shrink-0 border border-transparent"
        :class="inputValue.trim() 
          ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20 translate-x-0' 
          : 'bg-zinc-800 text-zinc-600 cursor-not-allowed border-zinc-700/50'"
      >
        <i class="fas fa-paper-plane text-lg" :class="{ 'translate-x-0.5 -translate-y-0.5': inputValue.trim() }"></i>
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