<script setup>
import { ref, computed, nextTick, onMounted } from 'vue';
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
  content: "Instruksi: Kamu asisten AI. Jawab singkat, padat, jelas. Gunakan Bahasa Indonesia."
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
    msgs = msgs.filter(msg => msg.text.toLowerCase().includes(lowerQ));
  }

  if (!searchText.value) {
      const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;
      const isDuplicate = lastMsg && !lastMsg.isUser && lastMsg.text.trim() === streamingText.value.trim();

      if ((isStreaming.value || streamingText.value) && !isDuplicate) {
        msgs.push({
          text: streamingText.value,
          isUser: false,
          isStreaming: true
        });
      }
  }
  return msgs;
});

const clearChatHistory = async () => {
  if (!confirm("Apakah Anda yakin ingin menghapus SELURUH riwayat chat?")) {
    return;
  }

  try {
    const q = query(collection(db, "chats"));
    const snapshot = await getDocs(q);

    const batch = writeBatch(db);
    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    streamingText.value = "";
    isStreaming.value = false;
    searchText.value = "";
    
  } catch (error) {
    console.error("Gagal menghapus chat:", error);
    alert("Gagal menghapus chat. Cek console.");
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
    streamingText.value += "\n[Koneksi Terputus]";
  } finally {
    isStreaming.value = false;
    streamingText.value = "";
  }
};

const scrollToBottom = async () => {
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollTo({ top: chatContainer.value.scrollHeight, behavior: 'smooth' });
  }
};

const handleAction = (action) => sendMessage(action === 'Summarize' ? 'Ringkas chat di atas.' : 'Jelaskan lebih detail.');
</script>

<template>
  <div class="bg-black w-full h-screen flex flex-col text-zinc-100 overflow-hidden">
      
      <div class="border-b border-zinc-800 bg-black/80 backdrop-blur-md z-20 flex-none">
        <div class="max-w-4xl mx-auto w-full">
           <ChatHeader 
              @search="(val) => searchText = val" 
              @clear="clearChatHistory"
           />
        </div>
      </div>

      <div class="flex-1 overflow-y-auto w-full relative scroll-smooth" ref="chatContainer">
        <div class="max-w-4xl mx-auto w-full p-4 md:p-6 space-y-6 min-h-full flex flex-col justify-end">
          
          <div class="text-center text-xs text-zinc-600 my-4">
             <span v-if="searchText" class="text-green-500">Hasil Pencarian: "{{ searchText }}"</span>
             <span v-else>Riwayat Chat Cloud</span>
          </div>

          <div v-for="(msg, index) in displayMessages" :key="msg.id || index">
             <MessageBubble 
               v-if="msg.text" 
               :text="msg.text" 
               :isUser="msg.isUser" 
             />
          </div>

          <div v-if="searchText && displayMessages.length === 0" class="text-center text-zinc-500 mt-10 opacity-70">
            <i class="fas fa-search mb-2 text-2xl"></i>
            <p>Tidak ditemukan pesan yang cocok.</p>
          </div>

          <div v-if="isStreaming && !streamingText && !searchText" class="flex items-center gap-2 text-zinc-500 text-xs px-2 animate-pulse mb-2">
            <span>AI sedang berpikir...</span>
          </div>

          <div class="h-2"></div>
        </div>
      </div>

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
</template>

<style>
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #000; }
::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
</style>