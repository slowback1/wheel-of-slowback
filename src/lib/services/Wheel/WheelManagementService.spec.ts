import WheelManagementService from '$lib/services/Wheel/WheelManagementService';
import MessageBus from '$lib/bus/MessageBus';
import { Messages } from '$lib/bus/Messages';
import { afterEach } from 'vitest';

describe('WheelManagementService', () => {
	afterEach(() => {
		MessageBus.clearAll();
	});

	describe('constructing', () => {
		it('sends a message to the message bus with a blank wheel config', () => {
			const service = new WheelManagementService();

			let lastMessage = MessageBus.getLastMessage(Messages.CurrentWheel);

			expect(lastMessage).not.toBeNull();
			expect(lastMessage).toEqual({ items: [] });
		});

		it('does not overwrite existing wheel config', () => {
			MessageBus.sendMessage(Messages.CurrentWheel, { items: [{ id: '1', name: 'foo' }] });

			const service = new WheelManagementService();

			let lastMessage = MessageBus.getLastMessage(Messages.CurrentWheel);

			expect(lastMessage).not.toBeNull();
			expect(lastMessage).toEqual({ items: [{ id: '1', name: 'foo' }] });
		});
	});

	describe('managing items', () => {
		let service: WheelManagementService;

		beforeEach(() => {
			service = new WheelManagementService();
		});

		it.each([
			{ input: `item 1`, expectedNames: ['item 1'] },
			{ input: 'item 1\nitem 2', expectedNames: ['item 1', 'item 2'] },
			{ input: 'item 1\nitem 2\nitem 3', expectedNames: ['item 1', 'item 2', 'item 3'] }
		])(
			'can generate wheel items from a string where each item is delimited by a newline',
			({ expectedNames, input }) => {
				service.setItems(input);

				let lastMessage = MessageBus.getLastMessage(Messages.CurrentWheel);

				expect(lastMessage).not.toBeNull();
				expect(lastMessage.items.map((item: any) => item.name)).toEqual(expectedNames);
			}
		);

		it('generates unique IDs for each item', () => {
			service.setItems('item 1\nitem 2\nitem 3');

			let lastMessage = MessageBus.getLastMessage(Messages.CurrentWheel);

			expect(lastMessage).not.toBeNull();
			expect(lastMessage.items.map((item: any) => item.id)).toEqual(
				expect.arrayContaining([expect.any(String), expect.any(String), expect.any(String)])
			);
		});
	});
});
