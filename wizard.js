// Wizard - Reusable modal wizard for choices
// Supports "get" (auto items), "pickOne" (radio), and "pick" (checkbox) types

window.Wizard = {
  /**
   * Show wizard modal with choices
   * @param {Array} wizardData - Array of wizard entries with type, options, etc.
   * @param {Object} options - Optional config {title: string}
   * @returns {Promise<Array>} Resolves with array of {item, weight} objects, or null if cancelled
   */
  show: function(wizardData, options = {}) {
    return new Promise((resolve) => {
      const modal = this._buildModal(wizardData, options);
      this._setupHandlers(modal, wizardData, resolve);
      document.body.appendChild(modal);
    });
  },

  // Utility: Escape HTML
  _escapeHtml: function(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // Build modal HTML
  _buildModal: function(wizardData, options) {
    const modal = document.createElement('div');
    modal.className = 'gear-wizard-modal';

    // Separate auto-get items from choice items
    const autoItems = [];
    const choiceGroups = [];

    wizardData.forEach((entry, index) => {
      if (entry.type === 'get') {
        // Auto items - you receive these automatically
        entry.options.forEach(opt => {
          autoItems.push(opt);
        });
      } else if (entry.type === 'pickOne' || entry.type === 'pick') {
        // Choice items
        choiceGroups.push({...entry, groupIndex: index});
      }
    });

    // Build auto items section
    let autoItemsHTML = '';
    if (autoItems.length > 0) {
      autoItemsHTML = `
        <div class="gear-wizard-auto-items">
          <h4>You will receive:</h4>
          <ul>
            ${autoItems.map(item => `<li>${this._escapeHtml(item.item)}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    // Build choice groups
    let choicesHTML = '';
    if (choiceGroups.length > 0) {
      choicesHTML = `
        <div class="gear-wizard-choices">
          ${choiceGroups.map(group => {
            const inputType = group.type === 'pickOne' ? 'radio' : 'checkbox';
            const inputName = `wizard_choice_${group.groupIndex}`;

            return `
              <div class="gear-wizard-choice-group">
                <h4>${this._escapeHtml(group.title || 'Choose:')}</h4>
                <div class="gear-wizard-options">
                  ${group.options.map((option, optIndex) => `
                    <div class="gear-wizard-option">
                      <input type="${inputType}"
                             name="${inputName}"
                             value="${optIndex}"
                             id="${inputName}_${optIndex}"
                             data-item="${this._escapeHtml(option.item)}"
                             data-weight="${option.weight || 0}">
                      <label for="${inputName}_${optIndex}">${this._escapeHtml(option.item)}</label>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    modal.innerHTML = `
      <div class="gear-wizard-content">
        <button class="gear-wizard-close" aria-label="Close">&times;</button>
        <h3>${this._escapeHtml(options.title || 'Make Your Selections')}</h3>
        ${autoItemsHTML}
        ${choicesHTML}
        <div class="gear-wizard-actions">
          <button type="button" class="gear-wizard-cancel">Cancel</button>
          <button type="button" class="gear-wizard-ok">OK</button>
        </div>
      </div>
    `;

    return modal;
  },

  // Collect selected items
  _collectSelections: function(modal, wizardData) {
    const results = [];

    wizardData.forEach((entry, index) => {
      if (entry.type === 'get') {
        // Add all auto-get items
        entry.options.forEach(option => {
          results.push({
            item: option.item,
            weight: option.weight || 0
          });
        });
      } else if (entry.type === 'pickOne') {
        // Add selected radio option
        const inputName = `wizard_choice_${index}`;
        const selectedRadio = modal.querySelector(`input[name="${inputName}"]:checked`);
        if (selectedRadio) {
          results.push({
            item: selectedRadio.getAttribute('data-item'),
            weight: parseFloat(selectedRadio.getAttribute('data-weight')) || 0
          });
        }
      } else if (entry.type === 'pick') {
        // Add all checked checkboxes
        const inputName = `wizard_choice_${index}`;
        const selectedCheckboxes = modal.querySelectorAll(`input[name="${inputName}"]:checked`);
        selectedCheckboxes.forEach(checkbox => {
          results.push({
            item: checkbox.getAttribute('data-item'),
            weight: parseFloat(checkbox.getAttribute('data-weight')) || 0
          });
        });
      }
    });

    return results;
  },

  // Setup event handlers
  _setupHandlers: function(modal, wizardData, resolve) {
    // Close button
    const closeBtn = modal.querySelector('.gear-wizard-close');
    closeBtn.addEventListener('click', () => {
      modal.remove();
      resolve(null);
    });

    // Cancel button
    const cancelBtn = modal.querySelector('.gear-wizard-cancel');
    cancelBtn.addEventListener('click', () => {
      modal.remove();
      resolve(null);
    });

    // OK button
    const okBtn = modal.querySelector('.gear-wizard-ok');
    okBtn.addEventListener('click', () => {
      const selections = this._collectSelections(modal, wizardData);
      modal.remove();
      resolve(selections);
    });

    // Background click to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
        resolve(null);
      }
    });

    // Escape key to close
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', escapeHandler);
        resolve(null);
      }
    };
    document.addEventListener('keydown', escapeHandler);
  }
};
