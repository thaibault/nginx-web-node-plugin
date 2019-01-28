// @flow
// #!/usr/bin/env node
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
import registerTest from 'clientnode/test'
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}
import baseConfiguration from 'web-node/configurator'
import WebNodePluginAPI from 'web-node/pluginAPI'
import type {Configuration, Services} from 'web-node/type'

import Index from './index'
// endregion
registerTest(async function():Promise<void> {
    const configuration:Configuration = (await WebNodePluginAPI.loadAll(
        baseConfiguration
    )).configuration
    // region tests
    // / region api
    this.test('loadService', async (assert:Object):Promise<void> => {
        try {
            assert.strictEqual(
                await Index.loadService({}, {nginx: null}, configuration), null
            )
        } catch (error) {
            console.error(error)
        }
    })
    this.test('shouldExit', async (assert:Object):Promise<void> => {
        let testValue:boolean = false
        const services:Services = {nginx: {kill: ():void => {
            testValue = true
        }}}
        try {
            assert.deepEqual(
                await Index.shouldExit(services, configuration), services)
        } catch (error) {
            console.error(error)
        }
        assert.deepEqual(services, {})
        assert.ok(testValue)
    })
    // / endregion
    // / region helper
    this.test('checkReachability', async (assert:Object):Promise<void> => {
        const done:Function = assert.async()
        try {
            await Index.checkReachability(configuration.server, false, 0.2)
        } catch (error) {
            assert.ok(true)
        }
        try {
            await Index.checkReachability(configuration.server, true, 0.2)
            assert.ok(true)
        } catch (error) {
            console.error(error)
        }
        done()
    })
    // / endregion
    // endregion
}, 'plain')
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
