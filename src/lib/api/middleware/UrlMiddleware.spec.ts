﻿import { getTestAPIRequest } from '$lib/testHelpers/testData/testAPIRequest';
import UrlMiddleware from '$lib/api/middleware/UrlMiddleware';
import { getTestApplicationConfig } from '$lib/testHelpers/testData/testApplicationConfig';
import ConfigService from '$lib/services/Config/ConfigService';
import MessageBus from '$lib/bus/MessageBus';
import { Messages } from '$lib/bus/Messages';
import { beforeEach } from 'vitest';

describe('UrlMiddleware', () => {
	beforeEach(() => {
		let appConfig = getTestApplicationConfig({ baseUrl: 'http://localhost:3000' });
		MessageBus.sendMessage(Messages.ApplicationConfig, appConfig);
	});

	it('should generate the full url  from the request when the config is present', async () => {
		let middleware = new UrlMiddleware();

		let request = getTestAPIRequest({ url: 'test' });

		request = await middleware.transformRequest(request);

		expect(request.url).toEqual('http://localhost:3000/test');
	});

	it('should give a valid url if the suffix starts with a /', async () => {
		let middleware = new UrlMiddleware();

		let request = getTestAPIRequest({ url: '/test' });

		request = await middleware.transformRequest(request);

		expect(request.url).toEqual('http://localhost:3000/test');
	});

	it('should give a valid url if the prefix ends with a /', async () => {
		let appConfig = getTestApplicationConfig({ baseUrl: 'localhost:3000/' });
		MessageBus.sendMessage(Messages.ApplicationConfig, appConfig);

		let middleware = new UrlMiddleware();

		let request = getTestAPIRequest({ url: 'test' });

		request = await middleware.transformRequest(request);

		expect(request.url).toEqual('localhost:3000/test');
	});

	it('should give a valid url if the suffix starts with a / and the prefix ends with a /', async () => {
		let appConfig = getTestApplicationConfig({ baseUrl: 'localhost:3000/' });
		MessageBus.sendMessage(Messages.ApplicationConfig, appConfig);

		let middleware = new UrlMiddleware();

		let request = getTestAPIRequest({ url: '/test' });

		request = await middleware.transformRequest(request);

		expect(request.url).toEqual('localhost:3000/test');
	});

	it.each([null, undefined, {}, '', []])(
		'defaults to / if the prefix is not set',
		async (nullValue: any) => {
			let appConfig = getTestApplicationConfig({ baseUrl: nullValue });
			MessageBus.sendMessage(Messages.ApplicationConfig, appConfig);

			let middleware = new UrlMiddleware();

			let request = getTestAPIRequest({ url: 'test' });

			request = await middleware.transformRequest(request);

			expect(request.url).toEqual('/test');
		}
	);
});
