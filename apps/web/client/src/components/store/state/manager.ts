import { makeAutoObservable } from 'mobx';

import { SettingsTabValue } from '@mino/models';

export class StateManager {
    isSubscriptionModelOpen = false;
    isSettingsModelOpen = false;
    settingsTab: SettingsTabValue | string = SettingsTabValue.SITE;

    constructor() {
        makeAutoObservable(this);
    }
}
