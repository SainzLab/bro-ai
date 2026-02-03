<template>
  <div class="w-full mb-2">
    <div class="max-w-4xl mx-auto px-4 md:px-6">
      
      <div 
        class="flex items-center gap-2 overflow-x-auto py-2 no-scrollbar mask-image"
        :class="actions.length > 3 ? 'justify-start md:justify-center' : 'justify-center'"
      >
        
        <button 
          v-for="(item, index) in mappedActions" 
          :key="index"
          @click="$emit('action-click', item.label)"
          class="group flex-shrink-0 relative flex items-center gap-2 px-4 py-2 rounded-full 
                 bg-zinc-900/80 border border-zinc-700/50 backdrop-blur-md 
                 text-xs font-medium text-zinc-400 
                 transition-all duration-300 ease-out whitespace-nowrap
                 hover:bg-zinc-800 hover:text-emerald-400 hover:border-emerald-500/40 
                 hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]
                 active:scale-95 select-none"
        >
          <i 
            :class="item.icon" 
            class="text-[10px] opacity-70 group-hover:opacity-100 transition-opacity duration-300"
          ></i>
          
          <span>{{ item.label }}</span>
          
          <div class="absolute inset-0 rounded-full bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </button>

      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  actions: {
    type: Array,
    default: () => ['Summarize', 'Expand', 'Regenerate'] 
  }
});

defineEmits(['action-click']);

const iconMap = {
  'Summarize': 'fas fa-compress-alt',
  'Expand': 'fas fa-expand-alt',
  'Regenerate': 'fas fa-sync-alt',
  'Explain': 'fas fa-lightbulb',
  'Translate': 'fas fa-language',
  'Fix Grammar': 'fas fa-spell-check'
};

const mappedActions = computed(() => {
  return props.actions.map(label => ({
    label,
    icon: iconMap[label] || 'fas fa-bolt'
  }));
});
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;  
}

.mask-image {
  animation: fadeIn 0.5s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>