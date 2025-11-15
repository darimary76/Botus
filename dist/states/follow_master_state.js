"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = follow_master_state;
const mineflayer_statemachine_1 = require("mineflayer-statemachine");
function follow_master_state(manager) {
    const targets = {};
    const enter = new mineflayer_statemachine_1.BehaviorIdle();
    const exit = new mineflayer_statemachine_1.BehaviorIdle();
    const followPlayer = new mineflayer_statemachine_1.BehaviorFollowEntity(manager.bot, targets);
    const getClosestPlayer = new mineflayer_statemachine_1.BehaviorGetClosestEntity(manager.bot, targets, (entity) => entity.type === "player" &&
        entity.username === manager.getMaster().master);
    const lookAtPlayer = new mineflayer_statemachine_1.BehaviorLookAtEntity(manager.bot, targets);
    const transitions = [
        new mineflayer_statemachine_1.StateTransition({
            parent: enter,
            child: getClosestPlayer,
            shouldTransition: () => true,
        }),
        new mineflayer_statemachine_1.StateTransition({
            parent: getClosestPlayer,
            child: followPlayer,
            shouldTransition: () => followPlayer.distanceToTarget() >= 3,
        }),
        new mineflayer_statemachine_1.StateTransition({
            parent: getClosestPlayer,
            child: lookAtPlayer,
            shouldTransition: () => followPlayer.distanceToTarget() < 3,
        }),
        new mineflayer_statemachine_1.StateTransition({
            parent: followPlayer,
            child: lookAtPlayer,
            shouldTransition: () => followPlayer.distanceToTarget() < 3,
        }),
        new mineflayer_statemachine_1.StateTransition({
            parent: lookAtPlayer,
            child: exit,
            shouldTransition: () => lookAtPlayer.distanceToTarget() >= 3,
        }),
    ];
    const state = new mineflayer_statemachine_1.NestedStateMachine(transitions, enter, exit);
    state.stateName = "Follow Master";
    return state;
}
