<template>
  <div class="relative min-h-screen w-full overflow-x-hidden flex flex-col sm:flex-row sm:space-x-8 p-4">
    <!-- Journal Input -->
    <div class="sm:w-1/3 w-full mb-4 sm:mb-0">
      <JournalInput @submit-entry="handleNewEntry" />
    </div>

    <!-- Journal Entries View -->
    <div class="sm:w-2/3 w-full overflow-y-auto">
      <JournalEntryView :entries="entries" />
    </div>
  </div>
</template>


<script>
import JournalInput from '../components/JournalInput.vue';
import JournalEntryView from '../components/JournalEntryView.vue';

export default {
  name: 'Home',
  components: {
    JournalInput, 
    JournalEntryView
  },
  data() {
    return {
      entries: [], // Initialize entries as an empty array
    };
  },
  async created() {
    // Fetch the entries from IndexedDB (or localStorage as fallback)
    this.entries = await this.fetchEntries();
  },
  mounted(){
    document.title="Home"
  },
  methods: {
    async fetchEntries() {
      if (Capacitor.isNative) {
        // Fetch entries from IndexedDB if available in a native app
        if (window.indexedDB) {
          try {
            const db = await this.openIndexedDB();
            const transaction = db.transaction('entries', 'readonly');
            const store = transaction.objectStore('entries');
            const allEntries = [];
            store.openCursor().onsuccess = function(event) {
              const cursor = event.target.result;
              if (cursor) {
                allEntries.push(cursor.value);
                cursor.continue();
              }
            };
            await new Promise((resolve, reject) => {
              transaction.oncomplete = resolve;
              transaction.onerror = reject;
            });
            return allEntries;
          } catch (e) {
            console.error("Error fetching from IndexedDB:", e);
            return []; // Return empty array in case of an error
          }
        }
      }
      // Fallback to localStorage if IndexedDB is not available
      return JSON.parse(localStorage.getItem('journalRecords')) || [];
    },

    async handleNewEntry(newEntry) {
      this.entries.push(newEntry);
      // Update localStorage or IndexedDB with the new entry
      if (Capacitor.isNative && window.indexedDB) {
        try {
          const db = await this.openIndexedDB();
          const transaction = db.transaction('entries', 'readwrite');
          const store = transaction.objectStore('entries');
          store.add(newEntry); // Add new entry to IndexedDB

          await new Promise((resolve, reject) => {
            transaction.oncomplete = resolve;
            transaction.onerror = reject;
          });
        } catch (e) {
          console.error("Error adding to IndexedDB:", e);
        }
      } else {
        // Fallback to localStorage
        localStorage.setItem('journalRecords', JSON.stringify(this.entries));
      }
    },

    // Function to open IndexedDB database
    async openIndexedDB() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open('JournalDatabase', 1);
        
        request.onupgradeneeded = function (event) {
          const db = event.target.result;
          if (!db.objectStoreNames.contains('entries')) {
            db.createObjectStore('entries', { keyPath: 'id', autoIncrement: true });
          }
        };

        request.onsuccess = function (event) {
          resolve(event.target.result);
        };

        request.onerror = function (event) {
          reject(event.target.error);
        };
      });
    }
  }
};
</script>

<style scoped>
/* Prevent body overflow */
body, html {
  overflow: hidden;
}
</style>
