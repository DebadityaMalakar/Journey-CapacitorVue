<template>
    <div class="settings-container p-6 sm:p-4">
      <h1 class="text-2xl sm:text-xl font-bold mb-4">Settings</h1>
  
      <!-- Button to delete all stored data -->
      <div class="delete-data-section p-4 sm:p-3">
        <p class="text-xl sm:text-lg mb-2">Warning: Deleting all stored data is irreversible.</p>
        <button
          @click="deleteAllData"
          class="delete-button w-full sm:w-auto p-3 sm:p-2 text-lg sm:text-base"
        >
          Delete All Stored Data
        </button>
      </div>
    </div>
  </template>
  
  <script>
  import { Capacitor } from '@capacitor/core';
  
  export default {
    name: 'Settings',
    mounted() {
      document.title = "Settings";
    },
    methods: {
      async deleteAllData() {
        if (confirm("Are you sure you want to delete all stored data?")) {
          try {
            if (Capacitor.isNative) {
              if (window.indexedDB) {
                const db = await this.openIndexedDB();
                const transaction = db.transaction('entries', 'readwrite');
                const store = transaction.objectStore('entries');
                store.clear(); // Remove all entries
                await new Promise((resolve, reject) => {
                  transaction.oncomplete = resolve;
                  transaction.onerror = reject;
                });
                alert("All stored data has been deleted from IndexedDB.");
              } else {
                localStorage.clear();
                alert("All stored data has been deleted from localStorage.");
              }
            } else {
              localStorage.clear();
              alert("All stored data has been deleted from localStorage.");
            }
          } catch (e) {
            console.error("Error deleting data:", e);
            alert("An error occurred while deleting data.");
          }
          location.reload(); // Reload the page to reflect the changes
        }
      },
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
  .settings-container {
    max-width: 600px;
    margin: 0 auto;
  }
  
  .delete-data-section {
    background-color: #f8d7da;
    border-radius: 8px;
  }
  
  .delete-button {
    background-color: #dc3545;
    color: white;
    padding: 12px 20px;
    font-size: 1rem;
    border-radius: 8px;
    transition: background-color 0.3s ease;
  }
  
  .delete-button:hover {
    background-color: #c82333;
  }
  
  /* Tailwind-based responsive styling */
  @media (max-width: 768px) {
    .settings-container {
      padding: 10px;
    }
  
    .delete-button {
      font-size: 1.2rem;
      padding: 15px;
    }
  
    .delete-data-section p {
      font-size: 1.1rem;
    }
  }
  
  </style>
  