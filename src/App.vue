<script setup>
import { ref, computed, nextTick, onMounted, watch } from 'vue';
import ChatHeader from './components/ChatHeader.vue';
import MessageBubble from './components/MessageBubble.vue';
import QuickActions from './components/QuickActions.vue';
import ChatInput from './components/ChatInput.vue';
import { db } from './firebase'; 
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, getDocs, writeBatch } from "firebase/firestore";

const API_URL = 'http://100.87.176.80:11434/api/chat';
const MODEL_NAME = 'qwen2.5:3b';

const savedMessages = ref([]); 
const streamingText = ref(""); 
const isStreaming = ref(false); 
const searchText = ref(""); 
const chatContainer = ref(null);
let abortController = null;

const systemPrompt = {
  role: 'system',
  content: "Instruksi: Kamu adalah asisten AI yang cerdas, sopan, dan membantu. Jawab dengan format Markdown yang rapi. Gunakan Bahasa Indonesia."
};

onMounted(() => {
  const q = query(collection(db, "chats"), orderBy("createdAt", "asc"));
  
  onSnapshot(q, (snapshot) => {
    savedMessages.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    if (!searchText.value) scrollToBottom();
  });
});

const displayMessages = computed(() => {
  let msgs = [...savedMessages.value];

  if (searchText.value) {
    const lowerQ = searchText.value.toLowerCase();
    return msgs.filter(msg => msg.text.toLowerCase().includes(lowerQ));
  }

  const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;
  const isDuplicate = lastMsg && !lastMsg.isUser && lastMsg.text.trim() === streamingText.value.trim();

  if ((isStreaming.value || streamingText.value) && !isDuplicate) {
    msgs.push({
      text: streamingText.value,
      isUser: false,
      isStreaming: true
    });
  }
  return msgs;
});

const clearChatHistory = async () => {
  if (!confirm("Hapus semua ingatan chat ini?")) return;

  try {
    const q = query(collection(db, "chats"));
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    streamingText.value = "";
    isStreaming.value = false;
    searchText.value = "";
    
  } catch (error) {
    console.error("Gagal menghapus chat:", error);
  }
};

const sendMessage = async (text) => {
  if (!text.trim()) return;
  searchText.value = ""; 

  await addDoc(collection(db, "chats"), {
    text: text,
    isUser: true,
    createdAt: serverTimestamp()
  });

  isStreaming.value = true;
  streamingText.value = "";
  scrollToBottom();

  const apiMessages = [systemPrompt, ...savedMessages.value.map(msg => ({
    role: msg.isUser ? 'user' : 'assistant',
    content: msg.text
  }))];
  apiMessages.push({ role: 'user', content: text });

  abortController = new AbortController();

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: MODEL_NAME, messages: apiMessages, stream: true }),
      signal: abortController.signal
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const json = JSON.parse(line);
          if (json.message?.content) {
            streamingText.value += json.message.content;
            scrollToBottom();
          }
        } catch (e) {}
      }
    }

    if (streamingText.value.trim()) {
      await addDoc(collection(db, "chats"), {
        text: streamingText.value,
        isUser: false,
        createdAt: serverTimestamp()
      });
    }

  } catch (error) {
    console.error("Error:", error);
    streamingText.value += "\n\n⚠️ *Koneksi ke AI terputus atau dibatalkan.*";
  } finally {
    isStreaming.value = false;
    streamingText.value = "";
  }
};

const scrollToBottom = async () => {
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollTo({ 
      top: chatContainer.value.scrollHeight, 
      behavior: 'smooth' 
    });
  }
};

const handleAction = (action) => {
  const prompts = {
    'Summarize': 'Buatkan ringkasan singkat dari percakapan kita di atas.',
    'Expand': 'Jelaskan poin terakhir dengan lebih detail dan contoh.',
    'Regenerate': 'Coba jawab ulang pertanyaan terakhir dengan sudut pandang berbeda.',
    'Explain': 'Jelaskan istilah teknis yang ada di pesan terakhir secara sederhana.',
    'Translate': 'Terjemahkan pesan terakhir ke Bahasa Inggris.',
    'Fix Grammar': 'Perbaiki tata bahasa dari pesan terakhir saya.'
  };
  sendMessage(prompts[action] || action);
};
</script>

<template>
  <div class="bg-zinc-950 w-full h-[100dvh] flex flex-col text-zinc-100 overflow-hidden relative font-sans">
      
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none z-0"></div>

      <div class="z-30 w-full flex-none">
        <div class="max-w-5xl mx-auto w-full">
           <ChatHeader 
              @search="(val) => searchText = val" 
              @clear="clearChatHistory"
           />
        </div>
      </div>

      <div class="flex-1 overflow-y-auto w-full relative z-10 custom-scrollbar" ref="chatContainer">
        <div class="max-w-4xl mx-auto w-full px-4 md:px-6 py-6 min-h-full flex flex-col">
          
          <div v-if="displayMessages.length === 0 && !searchText" class="flex-1 flex flex-col items-center justify-center opacity-40 select-none pb-20">
            <div class="w-24 h-24 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 shadow-2xl">
               <i class="fas fa-robot text-5xl text-emerald-600/50"></i>
            </div>
          </div>

          <div v-if="searchText" class="sticky top-0 z-20 flex justify-center mb-6">
             <span class="bg-zinc-800/90 backdrop-blur text-emerald-400 border border-emerald-500/20 text-xs px-4 py-1.5 rounded-full shadow-lg">
                <i class="fas fa-search mr-2"></i>Hasil: "{{ searchText }}"
             </span>
          </div>

          <div class="flex-1 flex flex-col justify-end space-y-2 pb-4">
             <div v-for="(msg, index) in displayMessages" :key="msg.id || index">
               <MessageBubble 
                 v-if="msg.text" 
                 :text="msg.text" 
                 :isUser="msg.isUser" 
               />
             </div>
          </div>

          <div v-if="isStreaming && !streamingText" class="flex items-center gap-1.5 px-4 py-3 ml-1">
            <div class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div class="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
          </div>

          <div class="h-2"></div> 
        </div>
      </div>

      <div class="flex-none z-30 w-full relative">
        <div class="absolute bottom-0 left-0 w-full h-[180%] bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent pointer-events-none -z-10"></div>
        
        <div class="flex-none bg-gradient-to-t from-black via-black to-transparent pt-6 pb-4 z-20 w-full px-4">
          <div class="max-w-4xl mx-auto w-full">
            <QuickActions @action-click="handleAction" />
            <ChatInput @send="sendMessage" />
            <p class="text-center text-[10px] text-zinc-700 mt-3 font-mono">
              Powered by Ollama | Tuning by Sainzlab
            </p>
          </div>
        </div>
      </div>

  </div>
</template>

<style>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #3f3f46; 
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #52525b; 
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>