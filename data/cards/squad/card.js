// Squad card with Wizard integration example
//
// This card demonstrates:
// - Dynamic tables (data-dynamic-table attribute)
// - Tracks (data-track attributes)
// - Basic form inputs (text, radio, checkboxes)
// - Hide-when-untaken visibility (data-hide-when-untaken attribute)
// - Wizard system for preset squad loadouts

// Ensure CardInitializers namespace exists
window.CardInitializers = window.CardInitializers || {};

// Export initialization function for the card system to call
window.CardInitializers.squad = function(container, suffix) {
  const helpers = window.CardHelpers.createScopedHelpers(container, suffix);

  // Preset squad configurations
  const squadPresets = {
    'Assault Squad': [
      { name: 'Sgt. Veteran', role: 'Leader', hp: 15, status: 'Ready' },
      { name: 'Trooper Alpha', role: 'Assault', hp: 12, status: 'Ready' },
      { name: 'Trooper Beta', role: 'Assault', hp: 12, status: 'Ready' },
      { name: 'Trooper Gamma', role: 'Assault', hp: 12, status: 'Ready' }
    ],
    'Scout Squad': [
      { name: 'Scout Leader', role: 'Scout', hp: 10, status: 'Ready' },
      { name: 'Recon Alpha', role: 'Scout', hp: 10, status: 'Ready' },
      { name: 'Recon Beta', role: 'Scout', hp: 10, status: 'Ready' }
    ],
    'Heavy Weapons Squad': [
      { name: 'Gunner Sergeant', role: 'Heavy Gunner', hp: 14, status: 'Ready' },
      { name: 'Loader', role: 'Support', hp: 11, status: 'Ready' },
      { name: 'Spotter', role: 'Support', hp: 11, status: 'Ready' }
    ],
    'Medical Team': [
      { name: 'Chief Medic', role: 'Medic', hp: 10, status: 'Ready' },
      { name: 'Field Medic', role: 'Medic', hp: 10, status: 'Ready' },
      { name: 'Orderly', role: 'Support', hp: 8, status: 'Ready' }
    ]
  };

  // Handle preset squad button click
  helpers.addEventListener('sq_preset_btn', 'click', async () => {
    const wizardData = [
      {
        type: 'pickOne',
        title: 'Choose Squad Type:',
        options: ['Assault Squad', 'Scout Squad', 'Heavy Weapons Squad', 'Medical Team']
      }
    ];

    const result = await window.Wizard.show(wizardData, {
      title: 'Load Preset Squad'
    });

    if (result && result.length > 0) {
      const squadType = result[0];
      const preset = squadPresets[squadType];

      if (preset) {
        // Clear existing members
        helpers.clearTable('sq_members');

        // Set squad name
        const nameInput = helpers.getElement('sq_name');
        if (nameInput) {
          nameInput.value = squadType;
          // Trigger input event to ensure persistence
          nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // Add preset members to table
        preset.forEach(member => {
          helpers.addTableRow('sq_members', member);
        });
      }
    }
  });
};
