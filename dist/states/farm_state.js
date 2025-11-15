"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = farm_state;
const mineflayer_statemachine_1 = require("mineflayer-statemachine");
function farm_state(manager) {
    const enter = new mineflayer_statemachine_1.BehaviorIdle();
    const exit = new mineflayer_statemachine_1.BehaviorIdle();
    const transitions = [
        new mineflayer_statemachine_1.StateTransition({
            parent: enter,
            child: exit,
            shouldTransition: () => !manager.getFarming().farmed_at,
        }),
    ];
    const state = new mineflayer_statemachine_1.NestedStateMachine(transitions, enter, exit);
    state.stateName = "Farm";
    return state;
}
