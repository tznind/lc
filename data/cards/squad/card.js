// Squad card initialization with dynamic table support
(function() {
  'use strict';

  console.log('Squad card script loading...');

  function initializeSquad(container, suffix) {
    console.log('Initializing squad card...', { container, suffix });

    // Initialize the dynamic table with suffix support
    if (window.DynamicTable) {
      window.DynamicTable.initializeInContainer(container, suffix);
      console.log('Dynamic table initialized for squad card');
    } else {
      console.error('DynamicTable module not found!');
    }

    // You can add additional card-specific logic here
    // For example, auto-populate squad name based on selection, etc.
  }

  // Export initialization function for the card system
  window.CardInitializers = window.CardInitializers || {};
  window.CardInitializers.squad = initializeSquad;
})();
