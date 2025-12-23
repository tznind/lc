// Squad card initialization with dynamic table support
(function() {
  'use strict';

  console.log('Squad card script loading...');

  function initializeSquad(container, suffix) {
    console.log('Initializing squad card...', { container, suffix });

    // Create scoped helpers for this card instance
    const helpers = window.CardHelpers.createScopedHelpers(container, suffix);

    // Add loyalty track with 3 circles using the new helper function
    helpers.addTrack('sq_loyalty_track', [
      {
        name: 'Loyalty',
        max: 3,
        shape: 'circle'
      }
    ]);

    // Radio button names are automatically suffixed - no manual code needed!

    // Initialize the dynamic table
    // Note: Don't pass suffix - the table ID is already suffixed by automatic HTML transformation
    if (window.DynamicTable) {
      window.DynamicTable.initializeInContainer(container);
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
