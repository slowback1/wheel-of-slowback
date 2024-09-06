import ComboBoxService, { type ComboBoxOption } from './ComboBoxService';
import { KeyboardKeys } from '$lib/utils/KeyboardKeys';

describe('ComboBoxService', () => {
	const testOptionInput: ComboBoxOption<string>[] = [
		{
			label: 'test 1',
			value: 'value 1'
		},
		{
			label: 'test 2',
			value: 'value 2'
		},
		{
			label: 'orange',
			value: '3'
		},
		{
			label: 'apple',
			value: '4'
		},
		{
			label: 'anthill',
			value: '5'
		},
		{
			label: 'aardvark',
			value: '6'
		}
	];

	it('can get the set of options', () => {
		let service = new ComboBoxService(testOptionInput);

		let options = service.displayedOptions;

		expect(options.length).toEqual(6);
	});

	it.each([
		[0, 'label', 'test 1'],
		[0, 'value', 'value 1'],
		[1, 'label', 'test 2'],
		[1, 'value', 'value 2']
	])('has the correct value for the given option (%s, %s, %s)', (index, key, expectedValue) => {
		let service = new ComboBoxService(testOptionInput);

		let options = service.displayedOptions;

		expect(options[index][key]).toEqual(expectedValue);
	});

	it.each([0, 1])('each option has the correct id (%s)', (index) => {
		let expectedValue = index;

		let service = new ComboBoxService(testOptionInput);

		let options = service.displayedOptions;

		expect(options[index].id).toEqual(expectedValue);
	});

	it.each([[null], [undefined], [[]]])(
		'will default to an empty list of options if given no options',
		(nullValue) => {
			let service = new ComboBoxService(nullValue);

			let options = service.displayedOptions;

			expect(options).toEqual([]);
		}
	);

	it('sets the default value as an empty string', () => {
		let service = new ComboBoxService([]);

		let value = service.value;

		expect(value).toEqual('');
	});

	it('can change the value', () => {
		let service = new ComboBoxService([]);

		service.onInputChange({ target: { value: 'test' } });

		expect(service.value).toEqual('test');
	});

	it.each([
		['a', ['orange', 'apple', 'aardvark', 'anthill']],
		['ap', ['apple']],
		['zzzz', []],
		['rdva', ['aardvark']]
	])('changing the input value updates the option list (%s, %s)', (input, expectedOptionLabels) => {
		let service = new ComboBoxService(testOptionInput);

		service.onInputChange({ target: { value: input } });

		let options = service.displayedOptions;

		expect(options.length).toEqual(expectedOptionLabels.length);

		let labels = options.map((opt) => opt.label);
		expectedOptionLabels.forEach((opt) => {
			expect(labels).toContain(opt);
		});
	});

	it('reorders the option list to the option that matches the search string at the start at the front', () => {
		let service = new ComboBoxService(testOptionInput);

		service.onInputChange({ target: { value: 'a' } });

		let firstOption = service.displayedOptions[0];

		expect(firstOption.label).toEqual('apple');
	});

	it('changing the input sets the combobox to open', () => {
		let service = new ComboBoxService(testOptionInput);

		service.onInputChange({ target: { value: 'a' } });

		expect(service.isOpen).toEqual(true);
	});

	it('the combobox is closed by default', () => {
		let service = new ComboBoxService(testOptionInput);

		expect(service.isOpen).toEqual(false);
	});

	it('calling toggleIsOpen will open the combobox', () => {
		let service = new ComboBoxService(testOptionInput);

		service.toggleIsOpen();

		expect(service.isOpen).toEqual(true);
	});

	it('calling toggleIsOpen twice will close the combobox', () => {
		let service = new ComboBoxService(testOptionInput);

		service.toggleIsOpen();
		service.toggleIsOpen();

		expect(service.isOpen).toEqual(false);
	});

	it('calling handleSelect will call the onSelect callback', () => {
		let onSelect = vi.fn();

		let service = new ComboBoxService(testOptionInput, onSelect);

		service.handleSelect(testOptionInput[0]);

		expect(onSelect).toHaveBeenCalledWith(testOptionInput[0].value);
	});

	it('calling handleSelect closes the combobox', () => {
		let service = new ComboBoxService(testOptionInput);

		service.toggleIsOpen();

		service.handleSelect(testOptionInput[0]);

		expect(service.isOpen).toEqual(false);
	});

	it('sets the focused option to the first visible one when toggle the combobox open', () => {
		let service = new ComboBoxService(testOptionInput);

		service.toggleIsOpen();

		expect(service.focusedOption.value).toEqual(testOptionInput[0].value);
	});

	it('focuses the first option when inputting something', () => {
		let service = new ComboBoxService(testOptionInput);

		service.onInputChange({ target: { value: 'aard' } });

		expect(service.focusedOption.label).toEqual('aardvark');
	});

	it("does not try to focus any options when inputting something that isn't in the options list", () => {
		let service = new ComboBoxService(testOptionInput);

		service.onInputChange({ target: { value: 'i dont exist in the options list I hope' } });

		expect(service.focusedOption).toBeUndefined();
	});

	it('clears out the focused option when selecting an option', () => {
		let service = new ComboBoxService(testOptionInput);

		service.toggleIsOpen();

		service.handleSelect(testOptionInput[0]);

		expect(service.focusedOption).toBeUndefined();
	});

	it.each([
		[0, KeyboardKeys.ArrowDown, 1],
		[0, KeyboardKeys.ArrowUp, 0],
		[1, KeyboardKeys.ArrowUp, 0],
		[testOptionInput.length - 1, KeyboardKeys.ArrowDown, testOptionInput.length - 1]
	])(
		'when the focused element is on index %s, and pressing the %s key, the focused index becomes %s',
		(focusStart, key, expectedFocusEnd) => {
			let service = new ComboBoxService(testOptionInput);

			service.toggleIsOpen();

			service.focusedOption = service.displayedOptions[focusStart];

			service.handleKeyboardEvent(new KeyboardEvent('keypress', { key }));

			expect(service.focusedOption.id).toEqual(expectedFocusEnd);
		}
	);

	it('pressing enter should select the currently focused element', () => {
		let onSelect = vi.fn();

		let service = new ComboBoxService(testOptionInput, onSelect);

		service.toggleIsOpen();

		service.handleKeyboardEvent(new KeyboardEvent('keypress', { key: KeyboardKeys.Enter }));

		expect(onSelect).toHaveBeenCalledWith(testOptionInput[0].value);
	});

	it("selecting an element should set the value to the selected option's label", () => {
		let service = new ComboBoxService(testOptionInput);

		service.toggleIsOpen();

		service.handleSelect(testOptionInput[0]);

		expect(service.value).toEqual(testOptionInput[0].label);
	});

	it('pressing escape should close the listbox if it is open', () => {
		let service = new ComboBoxService(testOptionInput);

		service.toggleIsOpen();

		service.handleKeyboardEvent(new KeyboardEvent('keyup', { key: KeyboardKeys.Escape }));

		expect(service.isOpen).toEqual(false);
	});

	it('closing the options also clears out the focused option', () => {
		let service = new ComboBoxService(testOptionInput);

		service.toggleIsOpen();

		service.handleKeyboardEvent(new KeyboardEvent('keyup', { key: KeyboardKeys.Escape }));

		expect(service.focusedOption).toBeUndefined();
	});

	it('will ignore capitalization when filtering options', () => {
		let service = new ComboBoxService(testOptionInput);

		service.onInputChange({ target: { value: 'APPLE' } });

		expect(service.displayedOptions.length).toEqual(1);
		expect(service.displayedOptions[0].label).toEqual('apple');
	});

	it('can set the focus to an option', () => {
		let service = new ComboBoxService(testOptionInput);

		service.toggleIsOpen();

		service.setFocus(service.displayedOptions[1]);

		expect(service.focusedOption).toEqual(service.displayedOptions[1]);
	});
});
