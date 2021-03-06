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
import Tools from 'clientnode'
import {configuration as baseConfiguration, PluginAPI} from 'web-node'

import {Configuration, ServiceProcess, Services, ServicePromises} from './type'
import Index from './index'
// endregion
describe('nginx', ():void => {
    // region mockup
    let configuration:Configuration
    beforeAll(async ():Promise<void> => {
        configuration = {
            ...Tools.copy(
                (await PluginAPI.loadAll(baseConfiguration)).configuration
            ),
            applicationServer: {proxy: {ports: []}}
        } as unknown as Configuration
    })
    // endregion
    // region tests
    // / region api
    test('loadService', async ():Promise<void> => {
        try {
            expect(await Index.loadService(
                {} as ServicePromises,
                {nginx: null} as Services,
                configuration
            )).toBeNull()
        } catch (error) {
            console.error(error)
        }
    })
    test('shouldExit', async ():Promise<void> => {
        let testValue:boolean = false
        const services:Services = {nginx: {kill: ():boolean => {
            testValue = true
            return true
        }} as ServiceProcess} as Services
        try {
            expect(await Index.shouldExit(services, configuration))
                .toStrictEqual(services)
        } catch (error) {
            console.error(error)
        }
        expect(services).toStrictEqual({})
        expect(testValue).toStrictEqual(true)
    })
    // / endregion
    // / region helper
    test('checkReachability', async ():Promise<void> => {
        try {
            await Index.checkReachability(
                configuration.applicationServer, false, 0.2
            )
        } catch (error) {}
        expect(true).toStrictEqual(true)
        try {
            await Index.checkReachability(
                configuration.applicationServer, true, 0.2
            )
            expect(true).toStrictEqual(true)
        } catch (error) {
            console.error(error)
        }
    })
    // / endregion
    // endregion
})
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
