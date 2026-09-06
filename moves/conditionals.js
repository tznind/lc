/**
 * Move Conditionals Module - Resolves a move's "if" rules against current character state
 */
window.MoveConditionals = (function() {
    'use strict';

    /**
     * True if the character has actually taken the given move - either it's checked
     * (checkbox/URL state, via the same logic used for hide-untaken filtering) or it's
     * a default/always-granted move for one of their current roles.
     */
    function hasMove(moveId) {
        const targetMove = window.moves && window.moves.find(m => m.id === moveId);
        if (!targetMove || !window.MovesCore) return false;

        const currentRoles = window.Utils ? window.Utils.getCurrentRoles() : [];

        // Merge default-true grants across current roles so a free move from any of
        // them counts, same as the rest of the availability system.
        const mergedAvailable = {};
        currentRoles.forEach(role => {
            const roleData = window.availableMap && window.availableMap[role];
            if (roleData && roleData[moveId] === true) {
                mergedAvailable[moveId] = true;
            }
        });

        const urlParams = new URLSearchParams(location.search);
        return window.MovesCore.isMoveTaken(targetMove, urlParams, mergedAvailable);
    }

    /**
     * Evaluate a single condition object. Currently supports:
     * - { hasMove: "<moveId>" } - true if the character has that move
     * - { hasAnyMove: ["<moveId>", ...] } - true if the character has any move in the list
     */
    function evaluateCondition(condition) {
        if (!condition) return false;

        if (condition.hasMove) {
            return hasMove(condition.hasMove);
        }

        if (condition.hasAnyMove) {
            return condition.hasAnyMove.some(moveId => hasMove(moveId));
        }

        console.warn('MoveConditionals: Unknown condition', condition);
        return false;
    }

    /**
     * Merge a then/else branch into the resolved move. A key present on both sides as
     * an array (submoves, outcomes, pick, pickOne, ...) is concatenated - root items
     * first, then the branch's. 'description' present (non-empty) on both sides is
     * concatenated with a space instead. Any other key (including an array or
     * description present on only one side) is replaced verbatim by the branch.
     */
    function mergeBranch(resolved, branch) {
        const merged = { ...resolved };
        Object.keys(branch).forEach(key => {
            if (Array.isArray(merged[key]) && Array.isArray(branch[key])) {
                merged[key] = [...merged[key], ...branch[key]];
            } else if (key === 'description' && merged.description && branch.description) {
                merged.description = `${merged.description} ${branch.description}`;
            } else {
                merged[key] = branch[key];
            }
        });
        return merged;
    }

    /**
     * Resolve a move's "if" rules (if any) into a new move object with the matching
     * then/else branch of each rule merged into the root, in order (see mergeBranch).
     * Returns the original move unchanged if there's nothing to resolve.
     */
    function resolve(move) {
        if (!move || !Array.isArray(move.if) || move.if.length === 0) {
            return move;
        }

        let resolved = { ...move };
        delete resolved.if;

        move.if.forEach(rule => {
            const branch = evaluateCondition(rule.condition) ? rule.then : rule.else;
            if (branch) {
                resolved = mergeBranch(resolved, branch);
            }
        });

        return resolved;
    }

    // Public API
    return {
        resolve
    };
})();
