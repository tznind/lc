# Cookbook

This comprehensive guide covers creating roles, moves, and cards for the Rogue Trader character system.

## Table of Contents
- [Help Buttons](#help-buttons)
- [Customizing Stats](#customizing-stats)
  - [Stat Track Counters](#stat-track-counters)
  - [Clock Stats](#clock-stats)
- [Creating Roles](#creating-roles)
- [Text Formatting](#text-formatting)
- [Basic Moves](#basic-moves)
- [Advanced Move Types](#advanced-move-types)
  - [Pick One Moves (Radio Buttons)](#pick-one-moves-radio-buttons)
  - [Pick Multiple Moves (Checkboxes)](#pick-multiple-moves-checkboxes)
  - [Take From Other Roles](#take-from-other-roles)
  - [Move Categories](#move-categories)
  - [Track Counter Moves](#track-counter-moves)
  - [Moves That Grant Cards](#moves-that-grant-cards)
- [Cards System](#cards-system)

---

## Help Buttons

Add contextual help anywhere in your HTML with automatic popup modals:

```html
<button type="button" class="help-icon"
        data-help-title="Weakened"
        data-help-text="Disadvantage on Strength and Dexterity">?</button>
```

The system automatically handles clicks, keyboard (Escape to close), and display. No additional JavaScript needed.

---

## Customizing Stats

Each game system typically has its own set of character statistics. The example system uses five core stats, but you can customize these for your own game.

### Modifying Stats

Stats are defined in [stats.json](./data/stats.json). Each stat has an `id` (used internally) and a `title` (displayed to players):

```json
[
  {
    "id": "mettle",
    "title": "METTLE"
  },
  {
    "id": "physique", 
    "title": "PHYSIQUE"
  },
  {
    "id": "influence",
    "title": "INFLUENCE"
  },
  {
    "id": "expertise",
    "title": "EXPERTISE"
  },
  {
    "id": "conviction",
    "title": "CONVICTION"
  }
]
```

### Stat Track Counters

**When to use:** For stats that have associated resources that need tracking (like Armor, Wounds, Focus, etc.).

Stats can include track counters that appear below the stat hexagon. These work identically to move track counters and support multiple shapes.

```json
[
  {
    "id": "mettle",
    "title": "METTLE",
    "tracks": [
      {
        "name": "Armor",
        "max": 3,
        "shape": "hexagon"
      }
    ]
  },
  {
    "id": "physique",
    "title": "PHYSIQUE",
    "tracks": [
      {
        "name": "Wounds",
        "max": 6,
        "shape": "circle"
      }
    ]
  }
]
```

**Key Features:**
- `tracks` array supports multiple counters per stat
- `shape` options: "square" (default), "circle", "triangle", "hexagon"
- `name` is optional - omit it to show just the shapes without a label
- `max` defaults to 5 if not specified
- Click shapes to increment/decrement current value
- Values persist in URL automatically
- Appears centered below the stat title

**Example without labels:**
```json
{
  "id": "expertise",
  "title": "EXPERTISE",
  "tracks": [
    {
      "max": 4,
      "shape": "circle"
    }
  ]
}
```

### Clock Stats

**When to use:** For stats that track progress or countdowns using visual clock faces (like prophecies, doom tracks, project completion, etc.).

Clocks display SVG images that advance when clicked, cycling through different visual states. They're perfect for tracking progress that doesn't fit a simple number.

```json
{
  "id": "prophecy",
  "title": "PROPHECY",
  "shape": "clock",
  "clock": {
    "type": "quarter_twelfths",
    "faces": 6
  },
  "tracks": [
    {
      "name": "Signs",
      "max": 3,
      "shape": "circle"
    }
  ]
}
```

**Key Features:**
- `shape: "clock"` designates this as a clock stat
- `clock.type` specifies the folder name in `clocks/` containing the SVG images
- `clock.faces` defines how many faces (0 through N) the clock has
- Click the clock to advance it (cycles back to 0 after the last face)
- `title` is optional - can be omitted for clocks without labels
- Can still include `tracks` for additional counters below the clock
- Values persist in URL automatically (e.g., `prophecy-value=4`)
- Fully keyboard accessible (Tab to focus, Space/Enter to advance)
- Responsive sizing on mobile devices

**Creating Custom Clock Types:**

1. Create a folder in `clocks/` (e.g., `clocks/my-clock-type/`)
2. Add numbered SVG files: `0.svg`, `1.svg`, `2.svg`, etc.
3. Reference it in stats.json:

```json
{
  "id": "doom",
  "title": "DOOM",
  "shape": "clock",
  "clock": {
    "type": "my-clock-type",
    "faces": 4
  }
}
```

The clock will load `clocks/my-clock-type/0.svg` through `clocks/my-clock-type/4.svg`.

---

## Creating Roles

To add a new role with moves:

1. Create a JSON file in `data/moves/` (e.g., `data/moves/new-role.json`)
2. Add the role to `data/availability.json` with a `_movesFile` property:

```diff
...

  "Lord Commander": {
    "_movesFile": "data/moves/lord-commander.json",
    "cards": ["ship"],
    "l1a2b3": false
-  }
+  },
+ "New Role": {
+  "_movesFile": "data/moves/new-role.json",
+  "move1": true,
+  "move2": false
+}
}
```
_/data/availability.json_

Moves marked `true` are always enabled for the role and cannot be disabled.

You can start with an empty json file for the moves:

```json
[
]
```
_/data/moves/new-role.json_

---

## Text Formatting

All text fields in moves and role descriptions support basic markdown-style formatting:

- **Bold text:** Wrap text in double asterisks: `**bold text**`
- *Italic text:* Wrap text in single asterisks: `*italic text*`
- **Line breaks:** Use `\n` for a line break or `\n\n` for a paragraph break

**Example:**
```json
{
  "id": "example",
  "title": "Example Move",
  "description": "When you act with **decisive force** or *careful precision*, roll +METTLE.\n\nYou may add your **Influence** to the roll if you're inspiring others.",
  "outcomes": [
    {
      "range": "≥ 10",
      "text": "You succeed **completely** and may choose *one extra benefit*."
    }
  ],
  "pick": [
    "**Area** - affects multiple targets",
    "*Messy* - leaves collateral damage"
  ]
}
```

**Role Description Example:**
```json
"Navigator": {
  "description": "Expert in charting courses through unknown space.\n\nNavigators possess a **third eye** that allows them to perceive the warp."
}
```

---

## Basic Moves

Basic moves are actions that can have different outcomes based on dice rolls or player choices. They form the core of character abilities.

**When to use:** For any action that involves rolling dice, making choices, or has variable outcomes.

### Structure

<table>
<tr>
<td>
<pre>
{
  "id": "unique_id",
  "title": "Move Name (+Stat)",
  "description": "Optional detailed description",
  "outcomes": [
    {
      "range": "≥ 10",
      "text": "Full success description",
      "bullets": []
    },
    {
      "range": "7–9",
      "text": "Partial success, choose one:",
      "bullets": [
        "Option 1 consequence",
        "Option 2 consequence",
        "Option 3 consequence"
      ]
    },
    {
      "range": "≤ 6",
      "text": "Failure description:",
      "bullets": [
        "Bad outcome 1",
        "Bad outcome 2",
        "Bad outcome 3"
      ]
    }
  ]
}
</pre>
</td> <td> <img src="https://github.com/user-attachments/assets/ce52e203-b5b8-442f-8477-f5c6e189e5ac"> </td> </tr> </table>


**Note:** The example above shows a common three-outcome structure, but you can use any number of outcomes or ranges that make sense for your game. You could have just two outcomes (success/failure), or more complex breakdowns. The `range` field is displayed as-is to players, so write it in whatever way makes sense for your system.

---

## Advanced Move Types

Beyond basic roll-based moves, the system supports several specialized move types for different gameplay needs.

### Pick One Moves (Radio Buttons)

**When to use:** For moves where the character must choose exactly one option from a list.

#### Structure



<table>
<tr>
<td>
<pre>
{
  "id": "move_id",
  "title": "Move Name",
  "description": "When you take this move, choose one of the following",
  "pickOne": [
    "Option 1",
    "Option 2", 
    "Option 3"
  ]
}
</pre>
</td> <td> <img src="https://github.com/user-attachments/assets/b59a9714-a0ec-47ec-805f-178e06a9eca4"> </td> </tr> </table>

**Key Features:**
- `pickOne` creates radio buttons (only one selection allowed)
- Can combine with `multiple` to allow user to take the same move multiple times
- `multiplePick` creates separate columns for multiple independent choices

### Pick Multiple Moves (Checkboxes)

**When to use:** For moves that let characters select multiple benefits or properties.

#### Structure

<table>
<tr>
<td>
<pre>
{
  "id": "multipicksdsd",
  "title": "Move Name",
  "description": "Each time you take this move, pick 2:",
  "multiple": 2,
  "pick": [
    "First Option",
    "Second Option",
    "Third Option",
    "Fourth Option",
    "Fifth Option"
  ]
}
</pre>
</td> <td> <img alt="image" src="https://github.com/user-attachments/assets/0b4198d4-3f20-4af4-858c-d5b535724d07" /> </td> </tr> </table>

**Key Features:**
- `pick` creates checkboxes (multiple selections allowed)
- Can combine `pick` and `pickOne` in the same move
- Often combined with `multiple` for repeated taking

### Take From Other Roles

**When to use:** If a move allows you to pick a move from another role.

The `takeFrom` system supports powerful filtering options that can be combined for fine-grained control over which moves are available for selection.

#### Basic Structure

<table>
<tr>
<td>
<pre>
{
  "id": "takeFrom1",
  "title": "Cross-Training Move Name",
  "description": "Take a move from an unused role",
  "takeFrom": ["Lord Commander", "Mech Adept"]
}
</pre>
</td> <td> <img alt="image" src="https://github.com/user-attachments/assets/1747a931-4fd0-4d84-af96-30bc370f70b7" /> </td> </tr> </table>

**Key Features:**
- `takeFrom` lists roles this character can learn from
- Creates dropdown menus populated with moves from those roles
- Allows character versatility and cross-class abilities
- Supports wildcard patterns and advanced filtering

#### Advanced Filtering

All three filter types can be combined to create precisely targeted move selections:

**1. Role Filtering (`takeFrom`)**

`takeFrom` accepts an array of role names and supports wildcard patterns:

```json
{
  "id": "versatile",
  "title": "Versatile Training",
  "takeFrom": ["*"]  // All roles
}
```

```json
{
  "id": "combat_training",
  "title": "Combat Training",
  "takeFrom": ["Lord Commander", "Mech Adept", "Navigator"]  // Specific roles
}
```

```json
{
  "id": "void_training",
  "title": "Void Training",
  "takeFrom": ["Void*"]  // All roles starting with "Void"
}
```

**2. Category Filtering (`takeCategory`)**

Narrow down moves by their category. Moves without an explicit `category` are treated as "Moves":

```json
{
  "id": "adapt1",
  "title": "Adaptable",
  "takeFrom": ["*"],
  "takeCategory": ["Moves"]  // Only moves in the "Moves" category
}
```

```json
{
  "id": "gear_expert",
  "title": "Gear Expert",
  "takeFrom": ["*"],
  "takeCategory": ["Equipment", "Advancement"]  // Multiple categories
}
```

**3. Specific Move Filtering (`takeMove`)**

For the finest control, specify exact move IDs:

```json
{
  "id": "limited_training",
  "title": "Limited Training",
  "takeFrom": ["Lord Commander"],
  "takeMove": ["l1a2b3", "inspire1"]  // Only these specific moves
}
```

#### Combined Filtering Examples

**Example 1: Combat moves from any role**
```json
{
  "id": "combat_specialist",
  "title": "Combat Specialist",
  "description": "Learn a combat technique from any role",
  "takeFrom": ["*"],
  "takeCategory": ["Moves"]
}
```

**Example 2: Specific moves from specific roles**
```json
{
  "id": "elite_training",
  "title": "Elite Training",
  "description": "Learn one of the signature moves from the Lord Commander",
  "takeFrom": ["Lord Commander"],
  "takeMove": ["l1a2b3", "l4c5d6", "l7e8f9"]
}
```

**Example 3: Equipment from void-related roles**
```json
{
  "id": "void_gear",
  "title": "Void Gear Specialist",
  "description": "Acquire equipment from void specialists",
  "takeFrom": ["Void*", "Navigator"],
  "takeCategory": ["Equipment"]
}
```

**Example 4: Multiple instances with different filters**
```json
{
  "id": "multi_train",
  "title": "Diverse Training",
  "description": "Learn multiple techniques",
  "multiple": 3,
  "takeFrom": ["*"],
  "takeCategory": ["Moves", "Advancement"]
}
```

#### Filter Priority

Filters work together with AND logic:
1. **Role filter** (`takeFrom`): Move must be from one of these roles
2. **Move filter** (`takeMove`): If specified, move must be in this list (most specific)
3. **Category filter** (`takeCategory`): Move must be in one of these categories
4. **Exclusions**: Moves already available to current roles are automatically excluded

#### Notes

- All filter arrays support multiple values
- Filters are optional - omit them to not apply that filter
- The `*` wildcard in `takeFrom` matches all available roles
- Wildcard patterns support prefix matching: `"Void*"` matches "Void Walker", "Voidmaster", etc.
- Roles already possessed by the character are automatically excluded from `takeFrom`
- The "Everyone" role is never included in `takeFrom` lists

### Move Categories

**When to use:** To organize moves into logical groups on the character sheet.

#### Structure

```
{
  "id": "move_id",
  "title": "Move Name",
  "category": "Equipment",
  // ... rest of move definition
}
```

**Key Features:**
- Moves without `category` appear under the default "Moves" section
- Categories appear as separate sections on the character sheet
- Common categories: `"Advancement"`, `"Equipment"`, `"Companion"`

### Hidden Checkbox Moves

**When to use:** For moves that should appear as part of the character sheet layout rather than selectable options.

#### Structure

```json
{
  "id": "background",
  "title": "Background",
  "category": "Character Details",
  "hideCheckbox": true,
  "details": true,
  "outcomes": [
    {
      "range": "",
      "text": "Describe your character's background and history."
    }
  ]
}
```

In `availability.json`, set the move to `true` to force it always on:

```json
{
  "Navigator": {
    "_movesFile": "data/moves/navigator.json",
    "background": true
  }
}
```

**Key Features:**
- `hideCheckbox: true` hides the checkbox when the move is force-ticked (set to `true` in availability.json)
- The move content remains visible without the checkbox
- Perfect for character sheet elements like backgrounds, notes, or permanent features
- Works great with `category` to organize character sheet sections
- Can be combined with `details: true` for freeform text input

### Track Counter Moves

**When to use:** For moves that grant temporary points that can be spent for various effects (like Inspire, Hold, Focus, etc.).

#### Structure

<table>
<tr>
<td>
<pre>
{
  "id": "track_move",
  "title": "Move Name (+Stat)",
  "tracks": [
    {
      "name": "Resource",
      "max": 3,
      "shape": "triangle"
    },
    {
      "name": "Special",
      "max": 2,
      "shape": "hexagon"
    }
  ],
  "outcomes": [
    {
      "range": "≥ 10",
      "text": "Success. Gain 2 Resource. Spend Resource to:",
      "bullets": [
        "Spend 1: Effect option",
        "Spend 2: Better effect",
        "Special: Major effect"
      ]
    }
  ]
}
</pre>
    },
    {
      "range": "≤ 6",
      "text": "Your attempt falls flat - choose",
      "bullets": ["Bad outcome 1", "Bad outcome 2"]
    }
  ]
}
</pre>
</td> <td> <img alt="image" src="https://github.com/user-attachments/assets/0636c795-4522-427a-85de-a2cdeeb4f8c3" />
 </td> </tr> </table>

**Key Features:**
- `tracks` array supports multiple counters (or single `track` for one)
- **Few tracks (1-3)**: Appear horizontally in the title area, right to left
- **Many tracks (4+)**: Automatically switch to a flexible flow layout below the title, perfect for inventory-style moves
- `shape` options: "square" (default), "circle", "triangle", "hexagon"
- `dynamic: true` adds a "max..." button to adjust maximum via prompt
- Click shapes to increment/decrement current value
- Values persist in URL (current value: `track_{id}`, max: `track_{id}_max`)
- Max can be set via URL: `track_inspire1_0_max=5` shows 5 shapes
- Values reset when move unchecked
- Flow layout adapts to track size: items with 1-2 points are narrow, items with 6+ points are wider

### Moves That Grant Cards

**When to use:** When a move should give the character a new card interface for tracking complex information.  For example 'gain a crew...'.

This allows you to create completely bespoke elements in the character sheet.

#### Structure

<table>
<tr>
<td>
<pre>
{
  "id": "cardmove1",
  "title": "Move Name",
  "grantsCard": "card-name",
  "outcomes": [
    {
      "range": "",
      "text": "Description of what you gain"
    }
  ]
}
</pre>
</td> <td> <img alt="image" src="https://github.com/user-attachments/assets/adadfbc1-6556-4930-9d1d-ce1664153f87" />
 </td> </tr> </table>

In order to work a card must have a corresponding card.json and card.html in the [cards](./data/cards) folder:

```json
{
  "id": "card-name",
  "title": "Example Card Title",
  "path": "data/cards/card-name",
  "description": "Simple example card",
  "version": "2.0.0",
  "author": "Thomas",
  "files": {
    "html": "card.html"
  }
}
```
_card.json_

And html for the card itself:

```html
<p>Example Card</p>
<label for="example-card-input">
Type some text<input type="text" id="example-card-input" />
</label>
```
_card.html_

As long as the inputs in the html have ids then they will be automatically persisted without any additional requirements.

File structure for a new card and move
```
/data
  /cards
    /new-card-name
      card.html
      card.json
 /moves
    /your-role.json (add move here) 
```

Cards can also be added directly to roles (i.e. if a move is not required and role always has it):

```diff
"New Role": {
  "_movesFile": "data/moves/new-role.json",
+  "cards": ["card-name"],
  "aaabvb": false,
```

**Key Features:**
- `grantsCard` references a card by its folder name
- The card must exist in `data/cards/[card-name]/`
- Cards appear inline when the move is selected

### Categorized Cards

**When to use:** To organize cards under specific category sections instead of at the top of the character sheet.

Cards can be assigned to categories by adding a `category` field to their `card.json` definition. Categorized cards:
- Appear under their assigned category header in the moves section
- Are NOT individually collapsible (the category itself provides collapsibility)
- Are mixed with moves in the same category
- Perfect for organizing equipment, companions, or other thematic groupings

#### Example: Equipment Card

```json
{
  "id": "weapons",
  "title": "Weapons & Gear",
  "path": "data/cards/weapons",
  "description": "Track your weapons and equipment",
  "version": "1.0.0",
  "author": "Your Name",
  "category": "Equipment",
  "files": {
    "html": "card.html"
  }
}
```
_data/cards/weapons/card.json_

```html
<div class="card weapons-card">
  <h3>Weapons & Gear</h3>
  <div class="form-field">
    <label for="weapon_primary">Primary Weapon:</label>
    <input type="text" id="weapon_primary" placeholder="Plasma rifle">
  </div>
  <div class="form-field">
    <label for="weapon_secondary">Secondary Weapon:</label>
    <input type="text" id="weapon_secondary" placeholder="Power sword">
  </div>
</div>
```
_data/cards/weapons/card.html_

Assign the card to a role:

```json
{
  "Navigator": {
    "_movesFile": "data/moves/navigator.json",
    "cards": ["weapons"]
  }
}
```
_data/availability.json_

**Key Features:**
- Add `"category": "Category Name"` to `card.json` to categorize a card
- Cards without a `category` appear at the top under "Character" (collapsible)
- Cards with a `category` appear under that category header (not individually collapsible)
- Category headers count includes both moves and cards
- Cards are rendered before moves in the same category
- Use the same category names as your moves for logical grouping

## Cards System

The cards system allows you to embed rich, interactive HTML forms into character sheets with custom styling, JavaScript functionality, and automatic persistence.

### How It Works

1. **Folder Structure**: Each card lives in its own folder under `data/cards/[cardname]/`
2. **Card Definition**: Each card has a `card.json` file defining its metadata and files
3. **Custom Files**: Cards can have their own HTML, CSS, and JavaScript files
4. **Role Assignment**: Roles specify which cards they have access to via the `_cards` array in `availability.json`
5. **Automatic Loading**: Cards and their assets are automatically loaded when a role is selected
6. **Persistence**: All inputs with `id` attributes are automatically persisted to the URL

### Creating Cards

#### Folder Structure
Each card requires its own folder under `data/cards/`:

```
data/cards/mycard/
├── card.json     # Card definition and metadata
├── card.html     # HTML template
├── card.css      # Custom styling (optional)
└── card.js       # Custom JavaScript (optional)
```

#### Card Definition (card.json)
```json
{
  "id": "mycard",
  "title": "My Custom Card",
  "path": "data/cards/mycard",
  "description": "A custom card for tracking something important",
  "version": "1.0.0",
  "author": "Your Name",
  "files": {
    "html": "card.html",
    "css": "card.css",
    "js": "card.js"
  }
}
```

#### HTML Template (card.html)
```html
<div class="card mycard-card">
  <h3 class="card-title">My Custom Card</h3>
  
  <div class="card-section">
    <div class="form-field">
      <label for="mycard_field">Field Label:</label>
      <input type="text" id="mycard_field" name="mycard_field" placeholder="Enter value">
    </div>
  </div>
</div>
```

#### Custom Styling (card.css)
```css
.mycard-card {
  border-left: 4px solid #059669;
  background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
}

.mycard-card .card-title {
  color: #059669;
}
```

#### Custom JavaScript (card.js)
```javascript
// Export initialization function for the card system
window.CardInitializers = window.CardInitializers || {};
window.CardInitializers.mycard = function() {
    // Custom card logic here
    console.log('My card initialized!');
    
    // Example: Add custom event handlers
    const field = document.getElementById('mycard_field');
    if (field) {
        field.addEventListener('input', function() {
            // Custom validation or logic
        });
    }
};
```

#### Supported Input Types
- `<input type="text">`, `<input type="number">`, `<input type="email">` etc.
- `<input type="checkbox">`
- `<select>` dropdowns
- `<textarea>` for multi-line text
- Any HTML form element with an `id`

#### Requirements
1. **Unique IDs**: All inputs that should be persisted **must have unique `id` attributes**
2. **Card Definition**: Every card must have a valid `card.json` file
3. **CSS Classes**: Use `.card` class for consistent base styling
4. **File Names**: Use the exact filenames specified in `card.json`

#### Built-in CSS Classes
The system provides base CSS classes:
- `.card` - Main card container with border and padding
- `.card-title` - Card title heading styling (automatically becomes collapsible)
- `.card-section` - Logical sections within cards
- `.form-field` - Individual input field containers
- `.card-error` - Error state styling
- `.card-content` - Wrapper for collapsible content (auto-generated)
- `.card-collapse-toggle` - +/- button for expanding/collapsing (auto-generated)

#### Card Collapse Functionality

**All cards are automatically collapsible**. The system:
- Converts any `<h3>` or `.card-title` element into a clickable collapse toggle
- Wraps all content below the title in a `.card-content` div
- Adds a +/- toggle button to the title
- Preserves collapse state during re-renders
- Starts cards in collapsed state by default

**Required for collapse functionality:**
```html
<div class="card mycard-card">
  <h3>Card Title</h3>  <!-- This becomes the collapsible header -->
  <!-- Everything below becomes collapsible content -->
</div>
```

**CSS for collapsed state:**
```css
.card.mycard-card .card-content.collapsed {
  display: none;
}
```

**Collapse controls:**
- Click title or +/- button to toggle
- Keyboard accessible (Tab to title, Enter/Space to toggle)
- Global "Collapse All" / "Expand All" buttons affect all cards
- State preserved when switching between roles

### Assigning Cards to Roles

Edit `data/availability.json` and add a `cards` array to any role:

```json
{
  "Navigator": {
    "_movesFile": "data/moves/navigator.json",
    "cards": ["ship", "crew"],
    "moveId1": true,
    "moveId2": false
  }
}
```

### Everyone System - Universal Cards and Moves

The "Everyone" role provides universal access to cards and moves for all characters:

```json
{
  "Everyone": {
    "_movesFile": "data/moves/everyone.json",
    "cards": ["common"],
    "universal_move": true,
    "basic_combat": true,
    "optional_skill": false
  }
}
```

**Key Features:**
- **Automatic Inclusion**: Everyone moves/cards are automatically added to any selected role combination
- **Invisible to Users**: "Everyone" never appears in role dropdowns or takeFrom lists
- **Universal Access**: Perfect for basic equipment, common knowledge, fundamental abilities
- **Same Structure**: Uses the same format as regular roles (moves file, cards array, move flags)

**Use Cases:**
- Basic combat moves available to all characters
- Common equipment cards (weapons, armor, tools)
- Universal knowledge or social moves
- Core mechanics that every character should have access to

**Implementation:**
The system automatically merges Everyone's availability data with any selected roles, making the moves and cards available without the user needing to select "Everyone" explicitly.

### Examples

#### Ship Card (`data/cards/ship/`)
- **Rich HTML**: Ship stats, components, and weapon systems
- **Custom CSS**: Blue theme with ship emoji, hover effects, and stat-specific styling
- **Custom JavaScript**: Auto-fill stats by ship class, hull damage warnings, component dependencies
- **Features**: Warp-capable ship validation, component requirements

#### Crew Card (`data/cards/crew/`)  
- **Rich HTML**: Crew stats, experience levels, and status conditions
- **Custom CSS**: Red theme with person emoji, status-specific colors
- **Custom JavaScript**: Stat validation, experience logic, name generator, status conflicts
- **Features**: Random name generation, loyalty/corruption balancing, role-based suggestions

### Advanced Usage

#### From Moves
Moves can grant cards when selected using the `grantsCard` property. For example, an "Acquire Robotic Companion" move can show the robotic companion card inline when the move is taken.

### File Structure
```
data/
  ├── cards/
  │   ├── ship/
  │   │   ├── card.json      # Ship card definition
  │   │   ├── card.html      # Ship HTML template
  │   │   ├── card.css       # Ship custom styles
  │   │   └── card.js        # Ship custom JavaScript
  │   ├── crew/
  │   │   ├── card.json      # Crew card definition
  │   │   ├── card.html      # Crew HTML template
  │   │   ├── card.css       # Crew custom styles
  │   │   └── card.js        # Crew custom JavaScript
  │   └── yourcard/       # Your custom card folder
  └── availability.json    # Defines which roles get which cards
```

### Benefits

1. **Zero Code Changes**: Adding new cards requires no core system modifications
2. **Complete Customization**: Each card can have its own HTML, CSS, and JavaScript
3. **Automatic Asset Loading**: CSS and JS files are automatically loaded and cached
4. **Automatic Persistence**: All inputs are automatically saved to the URL
5. **Rich Interactivity**: Cards can have complex custom logic and validation
6. **Professional Styling**: Custom themes with hover effects and visual feedback
7. **Role-Based Access**: Cards only appear for appropriate roles
8. **Modular Design**: Cards are self-contained and don't affect each other
9. **Version Control**: Each card tracks its own version and metadata
10. **Developer Friendly**: Clear separation of concerns and easy debugging

### Implementation Notes

- **Async Loading**: Cards, CSS, and JavaScript are loaded asynchronously and cached
- **Smart Caching**: Assets are only loaded once per session to improve performance
- **Error Handling**: Failed card loads show helpful error messages instead of breaking
- **DOM Integration**: Cards integrate seamlessly with existing form and persistence systems
- **Script Isolation**: Each card's JavaScript runs in its own scope to prevent conflicts
- **Style Scoping**: Card CSS is namespaced to avoid affecting other elements
- **Persistence Compatible**: All card inputs work with URL persistence and "Copy URL"
- **Clear Button**: The "Clear" button removes all card data along with other form data
- **Development Mode**: Use `window.Cards.clearCache()` to reload cards during development

