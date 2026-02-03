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
    emit('search', '');
  }
};
</script>

<template>
  <header class="sticky top-0 z-50 flex items-center justify-between px-6 py-4 h-[76px] 
                 bg-zinc-950/80 backdrop-blur-md border-b border-white/5 shadow-sm transition-all duration-300">
    
    <div class="flex-1 relative overflow-hidden h-full flex items-center">
      <Transition name="slide-fade" mode="out-in">
        
        <div v-if="!isSearchActive" class="flex items-center gap-3.5 w-full">
            <div class="flex flex-col">
              <h1 class="text-base font-semibold text-zinc-100 tracking-wide leading-tight group cursor-default">
                Qwen 2.5 <span class="text-zinc-500 font-normal text-xs ml-1">by Sainzlab</span>
              </h1>
            </div>
        </div>

        <div v-else class="w-full pr-4">
            <div class="relative group">
              <i class="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-400 transition-colors duration-300"></i>
              <input 
                  ref="searchInput"
                  v-model="searchQuery"
                  type="text" 
                  placeholder="Cari kata kunci dalam chat..." 
                  class="w-full bg-zinc-900/50 text-white pl-10 pr-10 py-2.5 rounded-xl border border-zinc-700/50 
                         outline-none focus:border-emerald-500/50 focus:bg-zinc-900 focus:ring-4 focus:ring-emerald-500/10 
                         transition-all duration-300 text-sm shadow-inner placeholder:text-zinc-600"
              />
              <button 
                v-if="searchQuery" 
                @click="searchQuery = ''" 
                class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1 rounded-full hover:bg-zinc-800 transition"
              >
                <i class="fas fa-times-circle"></i>
              </button>
            </div>
        </div>

      </Transition>
    </div>
    
    <div class="flex items-center gap-2 pl-2">
      
      <button 
        @click="toggleSearch" 
        class="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 active:scale-95 group"
        :class="isSearchActive 
          ? 'bg-zinc-800 text-white shadow-inner' 
          : 'hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200'"
        title="Cari Chat"
      >
        <i :class="isSearchActive ? 'fas fa-times text-lg' : 'fas fa-search text-lg group-hover:scale-110 transition-transform'"></i>
      </button>
      
      <Transition name="fade">
        <div v-if="!isSearchActive" class="flex items-center gap-2">
            <div class="w-px h-6 bg-zinc-800 mx-1"></div> <button 
              @click="$emit('clear')" 
              class="w-10 h-10 flex items-center justify-center rounded-xl text-zinc-400 hover:bg-red-500/10 hover:text-red-400 hover:border hover:border-red-500/20 transition-all duration-200 active:scale-95 group"
              title="Hapus Semua Chat"
            >
              <i class="fas fa-trash-alt group-hover:shake"></i>
            </button>

            <button 
              class="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/5 text-zinc-300 hover:text-white hover:border-zinc-600 transition-all duration-200 active:scale-95 shadow-lg shadow-black/20"
              title="Profil Pengguna"
            >
              <i class="fas fa-user text-sm"></i>
            </button>
        </div>
      </Transition>

    </div>
  </header>
</template>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes shake {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-10deg); }
  75% { transform: rotate(10deg); }
}
.group-hover\:shake:hover {
  animation: shake 0.3s ease-in-out;
}
</style>