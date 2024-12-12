<template>
  <div class="mx-auto p-6 bg-white rounded-lg shadow-lg space-y-6" :style="containerStyle">
    <div>
      <label for="journal-text" class="block roboto-medium text-xl font-semibold text-gray-700">Journal Entry</label>
      <textarea
        id="journal-text"
        v-model="journalText"
        placeholder="Write your thoughts..."
        rows="4"
        class="w-full p-3 mt-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      ></textarea>
    </div>

    <div class="flex space-x-4">
      <div class="w-1/2">
        <label for="journal-date" class="block roboto-medium text-sm font-semibold text-gray-700">Date</label>
        <input
          id="journal-date"
          v-model="journalDate"
          type="date"
          :max="currentDate"
          class="w-full p-2 mt-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div class="w-1/2">
        <label for="journal-time" class="block text-sm font-semibold text-gray-700">Time</label>
        <input
          id="journal-time"
          v-model="journalTime"
          type="time"
          :max="currentTime"
          class="w-full p-2 mt-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>

    <button
      @click="submitEntry"
      :disabled="!journalText || !journalDate || !journalTime"
      class="w-full py-3 mt-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
    >
      Submit Entry
    </button>
  </div>
</template>

<script>
import { Capacitor } from '@capacitor/core';

export default {
  name: 'JournalInput',
  data() {
    return {
      journalText: '',
      journalDate: '',
      journalTime: '',
      currentDate: '',  // To hold the current date
      currentTime: '',  // To hold the current time
    };
  },
  created() {
    // Set the current date and time when the component is created
    this.updateCurrentDateTime();
    this.initIndexedDB(); // Initialize IndexedDB when the component is created
  },
  methods: {
    updateCurrentDateTime() {
      const now = new Date();
      this.currentDate = now.toISOString().split('T')[0]; // yyyy-mm-dd format
      this.currentTime = now.toTimeString().split(' ')[0].slice(0, 5); // hh:mm format
    },
    async initIndexedDB() {
      if (!window.indexedDB) {
        console.error("IndexedDB is not supported in this browser.");
        return;
      }

      // Open or create the database
      const request = indexedDB.open('JournalDatabase', 1);

      request.onupgradeneeded = function (event) {
        const db = event.target.result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains('entries')) {
          const store = db.createObjectStore('entries', { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp');
        }
      };

      request.onerror = function (event) {
        console.error("Error opening IndexedDB:", event.target.error);
      };

      request.onsuccess = function (event) {
        this.db = event.target.result; // Save the database reference
      }.bind(this);
    },
    async submitEntry() {
      // Format date and time correctly
      const dateTime = `${this.journalDate}T${this.journalTime}:00${this.userTimezone}`;

      const journalEntry = {
        text: this.journalText,
        date: this.journalDate,
        time: this.journalTime,
        timestamp: dateTime,
      };

      try {
        if (Capacitor.isNative && this.db) {
          await this.saveToIndexedDB(journalEntry);
          alert("Entry saved to IndexedDB.");
        } else {
          // Fallback to localStorage if IndexedDB isn't available (or Capacitor is not in use)
          this.saveToLocalStorage(journalEntry);
          alert("Entry saved to localStorage.");
        }

        // Clear the form fields after submission
        this.journalText = '';
        this.journalDate = '';
        this.journalTime = '';
      } catch (error) {
        console.error("Error saving entry:", error);
        alert("Error saving entry.");
      }
    },
    async saveToIndexedDB(journalEntry) {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['entries'], 'readwrite');
        const store = transaction.objectStore('entries');
        const request = store.add(journalEntry);

        request.onsuccess = function () {
          resolve();
        };

        request.onerror = function (event) {
          reject(event.target.error);
        };
      });
    },
    saveToLocalStorage(journalEntry) {
      const journalRecords = JSON.parse(localStorage.getItem('journalRecords')) || [];
      journalRecords.push(journalEntry);
      localStorage.setItem('journalRecords', JSON.stringify(journalRecords));
    },
  },
  computed: {
    userTimezone() {
      const offset = new Date().getTimezoneOffset();
      const sign = offset > 0 ? '-' : '+';
      const hours = Math.floor(Math.abs(offset) / 60);
      const minutes = Math.abs(offset) % 60;
      return `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    },
  },
};
</script>

<style scoped>
/* No additional styles needed as everything is handled by TailwindCSS */
</style>
