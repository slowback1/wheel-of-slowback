import type IStorageProvider from '$lib/bus/IStorageProvider';
import { vi } from 'vitest';

export default function getLocalStorageMock(): IStorageProvider {
	let store = {};

	return {
		getItem: vi.fn((key) => store[key]),
		setItem: vi.fn((key, value) => (store[key] = value)),
		getStore: () => store
	};
}
