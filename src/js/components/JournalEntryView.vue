<template>
  <div>
    <!-- Button for small devices to open Journal Entries -->
    <div class="roboto-medium roboto-regular sm:hidden fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50">
      <button
        @click="showModal = true"
        class="bg-blue-500 text-white px-6 py-3 rounded-full shadow-lg w-full max-w-xs text-center"
      >
        View Journal Entries
      </button>
    </div>

    <!-- Modal for Journal Entries -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center"
    >
      <div class="bg-white p-8 rounded-lg w-full max-w-md">
        <h2 class="text-2xl font-bold mb-4 roboto-medium">Journal Entries</h2>
        <div v-if="!entries.length" class="roboto-regular text-center text-gray-500">
          <p>No journal entries yet.</p>
        </div>
        <div v-else>
          <div
            v-for="(entry, index) in entries.reverse()"
            :key="index"
            class="border-b pb-4 last:border-none"
          >
            <p class="font-semibold text-lg">{{ entry.date }} - {{ entry.time }}</p>
            <p class="mt-2">{{ entry.text }}</p>
          </div>
        </div>
        <button
          @click="showModal = false"
          class="mt-4 text-blue-500 hover:underline"
        >
          Close
        </button>
      </div>
    </div>

    <!-- Journal Entry View (Hidden on small devices) -->
    <div class="hidden sm:block fixed bottom-10 left-1/2 transform -translate-x-1/2 w-full max-w-md z-50">
      <!-- Card View -->
      <div
        class="bg-white rounded-lg shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
        :class="{
          'h-60': !isTimelineOpen,
          'h-[calc(100vh-100px)]': isTimelineOpen
        }"
      >
        <!-- Expandable Handle -->
        <div class="bg-gray-200 h-2 w-16 mx-auto my-2 rounded-full"></div>

        <!-- Make the content scrollable if it exceeds the container height -->
        <div class="overflow-y-auto max-h-[calc(100vh-100px)] p-6">
          <!-- No Entries State -->
          <div v-if="!entries.length" class="text-center text-gray-500">
            <p>No journal entries yet.</p>
            <p>Start journaling to see your memories!</p>
          </div>

          <!-- Compact View: Last Few Entries -->
          <div v-else-if="!isTimelineOpen">
            <div
              v-for="(entry, index) in entries.slice(-3).reverse()"
              :key="index"
              class="border-b pb-4 last:border-none"
            >
              <p class="font-semibold text-lg">{{ entry.date }} - {{ entry.time }}</p>
              <p class="mt-2 truncate">{{ entry.text }}</p>
            </div>
          </div>

          <!-- Full Timeline View -->
          <div v-if="isTimelineOpen" class="space-y-6">
            <h2 class="text-2xl font-bold text-center mb-6">My Journal Entries</h2>
            <div
              v-for="(entry, index) in entries.slice().reverse()"
              :key="entry.timestamp"
              class="relative pl-8 border-l-4 border-blue-500"
            >
              <div class="absolute -left-2.5 w-4 h-4 bg-blue-500 rounded-full mt-1"></div>
              <div class="ml-4">
                <p class="font-semibold text-lg">{{ entry.date }} - {{ entry.time }}</p>
                <p class="mt-2 text-gray-700">{{ entry.text }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'JournalEntryView',
  props: {
    entries: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      isTimelineOpen: false,
      showModal: false,  // Track modal visibility
    };
  },
  methods: {
    toggleTimeline() {
      this.isTimelineOpen = !this.isTimelineOpen;
    }
  }
};
</script>

<style scoped>
/* Custom scrollbar for overlay */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #3b82f6;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background-color: #f1f1f1;
}
</style>
