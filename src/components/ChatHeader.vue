<script setup>
import { ref, watch, nextTick } from 'vue';

const emit = defineEmits(['search', 'clear']);

const isSearchActive = ref(false);
const searchQuery = ref('');
const searchInput = ref(null);

watch(searchQuery, (newVal) => {
  emit('search', newVal);
});

const toggleSearch = async () => {
  isSearchActive.value = !isSearchActive.value;
  if (isSearchActive.value) {
    await nextTick();
    searchInput.value?.focus();
  } else {
    searchQuery.value = '';
  }
};
</script>

<template>
  <header class="flex items-center justify-between px-6 py-4 h-[72px]">
    
    <div v-if="!isSearchActive" class="flex items-center gap-3 animate-fade-in">
        <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]"></div>
        <div>
          <h1 class="text-lg font-medium text-white tracking-wide leading-tight">Qwen 2.5 by Sainzlab</h1>
          <p class="text-[10px] text-zinc-500">Online</p>
        </div>
    </div>

    <div v-else class="flex-1 mr-4 animate-fade-in">
        <div class="relative">
          <input 
              ref="searchInput"
              v-model="searchQuery"
              type="text" 
              placeholder="Cari riwayat chat..." 
              class="w-full bg-zinc-900 text-white pl-4 pr-10 py-2 rounded-full border border-zinc-700 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition text-sm"
          />
          <button v-if="searchQuery" @click="searchQuery = ''" class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
            <i class="fas fa-times-circle"></i>
          </button>
        </div>
    </div>
    
    <div class="flex items-center gap-3 text-zinc-400">
      
      <button 
        @click="toggleSearch" 
        class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-800 hover:text-white transition"
        :class="isSearchActive ? 'bg-zinc-800 text-white' : ''"
      >
        <i :class="isSearchActive ? 'fas fa-times' : 'fas fa-search'"></i>
      </button>
      
      <div v-if="!isSearchActive" class="flex gap-2">
          <button 
            @click="$emit('clear')" 
            class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-800 hover:text-red-500 transition"
            title="Hapus Semua Chat"
          >
            <i class="fas fa-trash-alt"></i>
          </button>

          <button class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-800 hover:text-white transition">
            <i class="fas fa-user"></i>
          </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.2s ease-out; }
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>