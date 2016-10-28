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
    See http://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// region imports
import fileSystem from 'fs'
import * as QUnit from 'qunit-cli'
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}
import baseConfiguration from 'web-node/configurator'
import WebNodePluginAPI from 'web-node/pluginAPI'
import type {Configuration, Services} from 'web-node/type'

import Index from './index'
// endregion
(async ():Promise<any> => {
    const {configuration, plugins} = await WebNodePluginAPI.loadALL(
        baseConfiguration)
    QUnit.module('index')
    QUnit.load()
    // region tests
    QUnit.test('renderTemplates', async (assert:Object):Promise<void> => {
        const done:Function = assert.async()
        // NOTE: Trigger template rendering.
        try {
            await WebNodePluginAPI.callStack(
                'postConfigurationLoaded', plugins, configuration,
                configuration, plugins.filter((plugin:Plugin):boolean =>
                    Boolean(plugin.configurationFilePath)))
            console.info(fileSystem.readFileSync('server.txt', {
                encoding: configuration.encoding}))
        } catch (error) {
            console.error(error)
        }
        assert.ok(true)
        done()
    })
    // / region api
    QUnit.test('exit', async (assert:Object):Promise<void> => {
        let testValue:boolean = false
        const services:Services = {nginx: {kill: ():void => {
            testValue = true
        }}}
        try {
            assert.deepEqual(
                await Index.exit(services, configuration), services)
        } catch (error) {
            console.error(error)
        }
        assert.deepEqual(services, {})
        assert.ok(testValue)
    })
    QUnit.test('preLoadService', async (assert:Object):Promise<void> => {
        try {
            assert.deepEqual(await Index.preLoadService({
                nginx: {}
            }, configuration), {nginx: {}})
        } catch (error) {
            console.error(error)
        }
    })
    // / endregion
    // / region helper
    QUnit.test('checkReachability', async (assert:Object):Promise<void> => {
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
})()
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
