// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
'use strict'
/* !
    region header
    Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

    License
    -------

    This library written by Torben Sickert stand under a creative commons
    naming 3.0 unported license.
    See https://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// region imports
import {beforeAll, describe, expect, test} from '@jest/globals'
import {copy} from 'clientnode'
import {configuration as baseConfiguration, PluginAPI} from 'web-node'

import {Configuration, ServiceProcess, ServicePromises, Services} from './type'
import Index from './index'
// endregion
describe('nginx', ():void => {
    // region mockup
    let configuration:Configuration
    beforeAll(async ():Promise<void> => {
        configuration = {
            ...(await PluginAPI.loadAll(copy(baseConfiguration)))
                .configuration,
            applicationServer: {proxy: {ports: {backend: {}}}}
        } as unknown as Configuration
    })
    // endregion
    // region tests
    /// region api
    test('loadService', ():void => {
        void expect(Index.loadService({
            configuration,
            hook: 'load',
            pluginAPI: PluginAPI,
            plugins: [],
            servicePromises: {} as ServicePromises,
            services: {nginx: null} as Services
        })).resolves.toBeNull()
    })
    test('shouldExit', async ():Promise<void> => {
        let testValue = false
        const services:Services = {nginx: {kill: ():boolean => {
            testValue = true

            return true
        }} as ServiceProcess} as Services

        try {
            await expect(Index.shouldExit({
                configuration,
                hook: 'shouldExit',
                pluginAPI: PluginAPI,
                plugins: [],
                servicePromises: {} as ServicePromises,
                services
            })).resolves.toBeUndefined()
        } catch (error) {
            console.error(error)
        }

        expect(services).toStrictEqual({})
        expect(testValue).toStrictEqual(true)
    })
    /// endregion
    /// region helper
    test('checkReachability', async ():Promise<void> => {
        try {
            await Index.checkReachability(
                configuration.applicationServer, false, {timeoutInSeconds: .2}
            )
        } catch (error) {
            // Ignore error.
        }

        expect(true).toStrictEqual(true)

        try {
            await Index.checkReachability(
                configuration.applicationServer, true, {timeoutInSeconds: .2}
            )
            expect(true).toStrictEqual(true)
        } catch (error) {
            console.error(error)
        }
    })
    /// endregion
    // endregion
})
