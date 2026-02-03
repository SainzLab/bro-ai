<template>
  <div 
    class="flex w-full mb-6 gap-3 animate-slide-up" 
    :class="isUser ? 'flex-row-reverse' : 'flex-row'"
  >
    
    <div 
      class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg mt-1"
      :class="isUser ? 'bg-zinc-800 border border-zinc-700' : 'bg-emerald-500/10 border border-emerald-500/20'"
    >
      <i v-if="isUser" class="fas fa-user text-xs text-zinc-400"></i>
      <i v-else class="fas fa-robot text-xs text-emerald-400"></i>
    </div>

    <div class="flex flex-col max-w-[85%] lg:max-w-[75%]">
      
      <span class="text-[10px] text-zinc-500 mb-1 px-1" :class="isUser ? 'text-right' : 'text-left'">
        {{ isUser ? 'You' : 'Qwen 2.5' }}
      </span>

      <div 
        class="px-4 py-3 text-[15px] leading-relaxed relative shadow-md break-words transition-all hover:shadow-lg"
        :class="bubbleClasses"
      >
        <div v-if="isUser" class="whitespace-pre-wrap">{{ text }}</div>
        <div v-else v-html="renderedMarkdown" class="markdown-content"></div>

        </div>

      <div v-if="!isUser" class="flex items-center gap-2 mt-2 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button 
          @click="copyText" 
          class="text-zinc-500 hover:text-white text-xs flex items-center gap-1 transition"
        >
          <i class="fas fa-copy"></i> <span v-if="copied" class="text-emerald-500">Disalin!</span>
        </button>
        <button class="text-zinc-500 hover:text-white text-xs transition">
          <i class="fas fa-redo"></i>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { marked } from 'marked';

const props = defineProps({ 
  text: String, 
  isUser: Boolean 
});

const copied = ref(false);

const bubbleClasses = computed(() => {
  return props.isUser
    ? 'bg-gradient-to-br from-emerald-600 to-emerald-500 text-white rounded-2xl rounded-tr-sm border border-emerald-400/20' 
    : 'bg-zinc-800/80 backdrop-blur-sm text-zinc-200 rounded-2xl rounded-tl-sm border border-white/5 group'; 
});

const renderedMarkdown = computed(() => {
  if (!props.text) return '';
  return marked.parse(props.text);
});

const copyText = () => {
  navigator.clipboard.writeText(props.text);
  copied.value = true;
  setTimeout(() => copied.value = false, 2000);
};
</script>

<style>

.markdown-content {
  font-family: inherit;
}

.markdown-content p:last-child {
  margin-bottom: 0;
}

.markdown-content p {
  margin-bottom: 0.75em;
}

.markdown-content strong {
  font-weight: 700;
  color: inherit;
}

.markdown-content ul {
  list-style-type: disc;
  padding-left: 1.25em;
  margin-bottom: 0.75em;
}

.markdown-content ol {
  list-style-type: decimal;
  padding-left: 1.25em;
  margin-bottom: 0.75em;
}

.markdown-content li {
  margin-bottom: 0.25em;
}

.markdown-content pre {
  background-color: rgba(0, 0, 0, 0.3);
  padding: 0.75em;
  border-radius: 0.5em;
  overflow-x: auto;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.markdown-content code {
  font-family: 'Courier New', monospace;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 0.1em 0.3em;
  border-radius: 0.25em;
  font-size: 0.9em;
}

.markdown-content pre code {
  background-color: transparent;
  padding: 0;
}

.animate-slide-up {
  animation: slideUp 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

@keyframes slideUp {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}
</style>