// @flow
// #!/usr/bin/env node
// -*- coding: utf-8 -*-
/** @module nginxWebNodePlugin */
'use strict'
/* !
    region header
    [Project page](http://torben.website/databaseWebNodePlugin)

    Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

    License
    -------

    This library written by Torben Sickert stand under a creative commons
    naming 3.0 unported license.
    See http://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// region  imports
import {spawn as spawnChildProcess} from 'child_process'
import Tools from 'clientnode'
// NOTE: Only needed for debugging this file.
try {
    require('source-map-support/register')
} catch (error) {}
import type {Configuration, Services} from 'web-node/type'
// endregion
// region plugins/classes
/**
 * Launches an application server und triggers all some pluginable hooks on
 * an event.
 */
export default class Nginx {
    /**
     * Application will be closed soon.
     * @param services - An object with stored service instances.
     * @param configuration - Mutable by plugins extended configuration object.
     * @returns Given object of services.
     */
    static async exit(
        services:Services, configuration:Configuration
    ):Services {
        services.nginx.kill('SIGINT')
        await Nginx.checkReachability(configuration.server, true)
        delete services.nginx
        return services
    }
    /**
     * Appends an application server to the web node services.
     * @param services - An object with stored service instances.
     * @param configuration - Mutable by plugins extended configuration object.
     * @returns Given and extended object of services.
     */
    static async preLoadService(
        services:Services, configuration:Configuration
    ):Services {
        if (!services.hasOwnProperty('nginx')) {
            services.nginx = spawnChildProcess(
                'nginx', [], {
                    cwd: process.cwd(),
                    env: process.env,
                    shell: true,
                    stdio: 'inherit'
                })
            for (const closeEventName:string of Tools.closeEventNames)
                services.nginx.on(closeEventName, Tools.getProcessCloseHandler(
                    Tools.noop, Tools.noop, closeEventName))
            await Nginx.checkReachability(configuration.server)
        }
        return services
    }
    /**
     * Check if a nginx server is currently (not) running.
     * @param serverConfiguration - Mutable by plugins extended configuration
     * object.
     * @param inverse - Boolean indicating if we should check for reachability
     * or unreachability.
     * @param timeoutInSeconds - Delay after assuming given resource isn't
     * available if no response is coming.
     * @returns A promise which will be resolved if a request to given url has
     * (not) finished. Otherwise returned promise will be rejected.
     */
    static async checkReachability(
        serverConfiguration:Configuration, inverse:boolean = false,
        timeoutInSeconds:number = 10
    ):Promise<Object> {
        if (serverConfiguration.proxy.ports.length > 0) {
            const url:string = 'http' + ((
                serverConfiguration.proxy.ports[0] === 443
            ) ? 's' : '') + `://` +
            `${serverConfiguration.application.hostName}:` +
            `${serverConfiguration.proxy.ports[0]}`
            return await (inverse ? Tools.checkUnreachability(
                url, true
            ) : Tools.checkReachability(url, true, 200, timeoutInSeconds))
        }
        return {}
    }
}
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
