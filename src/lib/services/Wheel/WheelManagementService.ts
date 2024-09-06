import MessageBus from '$lib/bus/MessageBus';
import { Messages } from '$lib/bus/Messages';
import { clone } from '$lib/utils/objectUtils';

export type WheelItem = {
	id: string;
	name: string;
};

export type WheelConfig = {
	items: WheelItem[];
};

export default class WheelManagementService {
	constructor() {
		this.initializeWheelConfig();
	}

	public setItems(input: string) {
		let config = this.getWheelConfig();
		if (!config) {
			config = { items: [] };
		}
		this.setWheelItemsFromInputString(config, input);

		this.sendWheelConfig(config);
	}

	private setWheelItemsFromInputString(config: WheelConfig, input: string) {
		config.items = input.split('\n').map((name) => {
			return { id: this.getRandomId(), name };
		});
	}

	private getRandomId() {
		return Math.random().toString(21);
	}

	private initializeWheelConfig() {
		if (!this.getWheelConfig()) this.sendWheelConfig({ items: [] });
	}

	private sendWheelConfig(config: WheelConfig) {
		MessageBus.sendMessage(Messages.CurrentWheel, config);
	}

	private getWheelConfig(): WheelConfig | null {
		return clone(MessageBus.getLastMessage(Messages.CurrentWheel));
	}
}
