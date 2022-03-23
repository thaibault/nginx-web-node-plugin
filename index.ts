// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
/** @module nginx-web-node-plugin */
'use strict'
/* !
    region header
    [Project page](https://torben.website/nginx-web-node-plugin)

    Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

    License
    -------

    This library written by Torben Sickert stand under a creative commons
    naming 3.0 unported license.
    See https://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// region imports
import {
    ChildProcess,
    exec as executeChildProcess,
    ExecException,
    spawn as spawnChildProcess
} from 'child_process'
import Tools, {CloseEventNames} from 'clientnode'
import {
    CheckReachabilityOptions,
    ProcessCloseCallback,
    ProcessCloseReason,
    ProcessErrorCallback,
    RecursivePartial
} from 'clientnode/type'
import {PluginHandler} from 'web-node/type'

import {
    Configuration, Service, ServiceProcess, ServicePromises, Services
} from './type'
// endregion
// region plugins/classes
/**
 * Launches an application server und triggers all some pluginable hooks on
 * an event.
 */
export class Nginx implements PluginHandler {
    // region api
    /**
     * Start nginx's child process and return a Promise which observes this
     * service.
     * @param servicePromises - An object with stored service promise
     * instances.
     * @param services - An object with stored service instances.
     * @param configuration - Mutable by plugins extended configuration object.
     *
     * @returns A promise which correspond to the plugin specific continues
     * service.
     */
    static async loadService(
        servicePromises:ServicePromises,
        services:Services,
        configuration:Configuration
    ):Promise<null|Service> {
        if (Object.prototype.hasOwnProperty.call(services, 'nginx'))
            return null

        services.nginx = spawnChildProcess(
            'nginx',
            [],
            {
                cwd: process.cwd(),
                env: process.env,
                shell: true,
                stdio: 'inherit'
            }
        ) as ServiceProcess

        services.nginx.reload = ():Promise<string> =>
            new Promise<string>((
                resolve:(_value:string) => void,
                reject:(_reason:ExecException) => void
            ):ChildProcess =>
                executeChildProcess(
                    'nginx -s reload',
                    (
                        error:ExecException|null,
                        standardOutput:string,
                        standardErrorOutput:string
                    ):void => {
                        if (error) {
                            (error as
                                (ExecException & {standardErrorOutput:string})
                            ).standardErrorOutput = standardErrorOutput
                            reject(error)
                        } else
                            resolve(standardOutput)
                    }
                )
            )

        let promise:null|Promise<ProcessCloseReason> =
            new Promise<ProcessCloseReason>((
                resolve:(_value:ProcessCloseReason) => void,
                reject:(_reason:Error) => void
            ):void => {
                for (const closeEventName of CloseEventNames)
                    (services.nginx as ServiceProcess).on(
                        closeEventName,
                        Tools.getProcessCloseHandler(
                            resolve as ProcessCloseCallback,
                            (
                                configuration.applicationServer.proxy.optional ?
                                    resolve :
                                    reject
                            ) as ProcessErrorCallback,
                            {reason: services.nginx, process: services.nginx}
                        )
                    )
            })

        try {
            await Nginx.checkReachability(configuration.applicationServer)
        } catch (error) {
            if (configuration.applicationServer.proxy.optional) {
                console.warn(
                    `Nginx couldn't be started but was marked as optional.`
                )
                services.nginx = null
                promise = null
            } else
                throw error
        }

        return {name: 'nginx', promise}
    }
    /**
     * Application will be closed soon.
     * @param services - An object with stored service instances.
     * @param configuration - Mutable by plugins extended configuration object.
     *
     * @returns Given object of services.
     */
    static async shouldExit(
        services:Services, configuration:Configuration
    ):Promise<Services> {
        if (services.nginx !== null) {
            services.nginx.kill('SIGINT')
            await Nginx.checkReachability(
                configuration.applicationServer, true
            )
        }

        delete (services as {nginx?:Services['nginx']}).nginx

        return services
    }
    // endregion
    // region helper
    /**
     * Check if a nginx server is currently (not) running.
     * @param serverConfiguration - Mutable by plugins extended configuration
     * object.
     * @param inverse - Boolean indicating if we should check for reachability
     * or un-reachability.
     * @param givenOptions - Tools reachability options to configure how to
     * check for reachability.
     *
     * @returns A promise which will be resolved if a request to given url has
     * (not) finished. Otherwise returned promise will be rejected.
     */
    static checkReachability(
        serverConfiguration:Configuration['applicationServer'],
        inverse = false,
        givenOptions:RecursivePartial<CheckReachabilityOptions> = {}
    ):Promise<Response|Error|null|Promise<Error|null>> {
        if (
            Object.values(serverConfiguration.proxy.ports.backend).length > 0
        ) {
            const url:string =
                'http' +
                (Object.values(serverConfiguration.proxy.ports.backend)[0] ===
                    443 ? 's' : ''
                ) +
                `://${serverConfiguration.hostName}:` +
                `${Object.values(serverConfiguration.proxy.ports.backend)[0]}`

            const options:RecursivePartial<CheckReachabilityOptions> = {
                options: {redirect: 'manual'},
                pollIntervallInSeconds: .1,
                statusCodes: [
                    100, 101, 102,
                    200, 201, 202, 203, 204, 205, 206, 207, 208, 226,
                    300, 301, 302, 303, 304, 305, 306, 307, 308
                ],
                timeoutInSeconds: 3,
                wait: true,
                ...givenOptions
            }

            return (
                inverse ? Tools.checkUnreachability : Tools.checkReachability
            )(url, options)
        }

        return Promise.resolve(null)
    }
    // endregion
}
export default Nginx
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
