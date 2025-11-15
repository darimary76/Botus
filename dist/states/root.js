"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create_root_state = create_root_state;
const mineflayer_statemachine_1 = require("mineflayer-statemachine");
const config_1 = require("../config");
const follow_master_state_1 = __importDefault(require("./follow_master_state"));
const collect_state_1 = __importDefault(require("./collect_state"));
const farm_state_1 = __importDefault(require("./farm_state"));
const guard_state_1 = __importDefault(require("./guard_state"));
function create_root_state(manager) {
    const targets = {};
    const idleState = new mineflayer_statemachine_1.BehaviorIdle();
    const lookAtPlayersState = new mineflayer_statemachine_1.BehaviorLookAtEntity(manager.bot, targets);
    const followPlayer = new mineflayer_statemachine_1.BehaviorFollowEntity(manager.bot, targets);
    const followMasterState = (0, follow_master_state_1.default)(manager);
    const collectState = (0, collect_state_1.default)(manager);
    const guardState = (0, guard_state_1.default)(manager);
    const farmState = (0, farm_state_1.default)(manager);
    const getClosestPlayer = new mineflayer_statemachine_1.BehaviorGetClosestEntity(manager.bot, targets, (entity) => entity.type === "player");
    const transitions = [
        new mineflayer_statemachine_1.StateTransition({
            parent: idleState,
            child: guardState,
            shouldTransition: () => !manager.isActing(),
        }),
        new mineflayer_statemachine_1.StateTransition({
            parent: guardState,
            child: farmState,
            shouldTransition: () => guardState.isFinished(),
        }),
        new mineflayer_statemachine_1.StateTransition({
            parent: farmState,
            child: collectState,
            shouldTransition: () => farmState.isFinished(),
        }),
        new mineflayer_statemachine_1.StateTransition({
            parent: collectState,
            child: getClosestPlayer,
            shouldTransition: () => collectState.isFinished(),
        }),
        new mineflayer_statemachine_1.StateTransition({
            parent: getClosestPlayer,
            child: lookAtPlayersState,
            shouldTransition: () => manager.isMoving() || followPlayer.distanceToTarget() < 5,
        }),
        new mineflayer_statemachine_1.StateTransition({
            parent: lookAtPlayersState,
            child: followMasterState,
            shouldTransition: () => manager.isMoving() || followPlayer.distanceToTarget() >= 5,
        }),
        new mineflayer_statemachine_1.StateTransition({
            parent: followMasterState,
            child: idleState,
            shouldTransition: () => !!manager.getFarming().farmed_at ||
                !!manager.getCollecting() ||
                !!manager.getGuarding() ||
                !manager.getFollowing() ||
                followMasterState.isFinished(),
        }),
    ];
    const root_state = new mineflayer_statemachine_1.NestedStateMachine(transitions, idleState);
    root_state.stateName = "Waiting";
    manager.statemachine = new mineflayer_statemachine_1.BotStateMachine(manager.bot, root_state);
    const webserver = new mineflayer_statemachine_1.StateMachineWebserver(manager.bot, manager.statemachine, config_1.CONFIG.STATE_MACHINE_PORT);
    webserver.startServer();
}
