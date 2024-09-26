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
import {
    checkReachability as plainCheckReachability,
    CheckReachabilityOptions,
    checkUnreachability,
    CLOSE_EVENT_NAMES,
    getProcessCloseHandler,
    ProcessCloseCallback,
    ProcessCloseReason,
    ProcessErrorCallback,
    RecursivePartial
} from 'clientnode'
import {PluginHandler, PluginPromises, Services} from 'web-node/type'

import {Configuration, ServiceProcess, ServicePromisesState} from './type'
// endregion
// region plugins/classes
/**
 * Launches an application server und triggers all some pluginable hooks on
 * an event.
 */
// region api
/**
 * Start nginx's child process and return a Promise which observes this
 * service.
 * @param state - Application state.
 * @param state.configuration - Applications configuration.
 * @param state.configuration.applicationServer - Plugins configuration.
 * @param state.services - An object with stored service instances.
 * @returns A mapping to promises which correspond to the plugin specific
 * continues services.
 */
export const loadService = async ({
    configuration: {applicationServer: configuration}, services
}: ServicePromisesState): Promise<null|PluginPromises> => {
    if (Object.prototype.hasOwnProperty.call(services, 'nginx'))
        return null

    const nginx: ServiceProcess = spawnChildProcess(
        'nginx',
        [],
        {
            cwd: process.cwd(),
            env: process.env,
            shell: true,
            stdio: 'inherit'
        }
    ) as ServiceProcess
    services.nginx = nginx

    nginx.reload = (): Promise<string> =>
        new Promise<string>((
            resolve: (value: string) => void,
            reject: (reason: ExecException) => void
        ): ChildProcess =>
            executeChildProcess(
                'nginx -s reload',
                (
                    error: ExecException|null,
                    standardOutput: string,
                    standardErrorOutput: string
                ) => {
                    if (error) {
                        (error as
                            (ExecException & {standardErrorOutput: string})
                        ).standardErrorOutput = standardErrorOutput
                        reject(error)
                    } else
                        resolve(standardOutput)
                }
            )
        )

    let promise: null|Promise<ProcessCloseReason> =
        new Promise<ProcessCloseReason>((
            resolve: (value: ProcessCloseReason) => void,
            reject: (reason: Error) => void
        ) => {
            for (const closeEventName of CLOSE_EVENT_NAMES)
                nginx.on(
                    closeEventName,
                    getProcessCloseHandler(
                        resolve as ProcessCloseCallback,
                        (
                            configuration.proxy.optional ?
                                resolve :
                                reject
                        ) as ProcessErrorCallback,
                        {reason: nginx, process: nginx}
                    )
                )
        })

    try {
        await checkReachability(configuration)
    } catch (error) {
        if (configuration.proxy.optional) {
            console.warn(
                `Nginx couldn't be started but was marked as optional.`
            )
            services.nginx = null
            promise = null
        } else
            throw error
    }

    return {nginx: promise}
}
/**
 * Application will be closed soon.
 * @param state - Application state.
 * @param state.configuration - Applications configuration.
 * @param state.services - Application services.
 * @returns Given object of services.
 */
export const shouldExit = async (
    {configuration, services}: ServicePromisesState
): Promise<void> => {
    if (services.nginx !== null) {
        services.nginx.kill('SIGINT')
        await checkReachability(configuration.applicationServer, true)
    }

    delete (services as {nginx?: Services['nginx']}).nginx
}
// endregion
// region helper
/**
 * Check if a nginx server is currently (not) running.
 * @param serverConfiguration - Mutable by plugins extended configuration
 * object.
 * @param inverse - Boolean indicating if we should check for reachability or
 * un-reachability.
 * @param givenOptions - Tools reachability options to configure how to check
 * for reachability.
 * @returns A promise which will be resolved if a request to given url has
 * (not) finished, otherwise returned promise will be rejected.
 */
export const checkReachability = (
    serverConfiguration: Configuration['applicationServer'],
    inverse = false,
    givenOptions: RecursivePartial<CheckReachabilityOptions> = {}
): Promise<Response|Error|null|Promise<Error|null>> => {
    if (
        Object.values(serverConfiguration.proxy.ports.backend).length > 0
    ) {
        const url =
            'http' +
            (Object.values(serverConfiguration.proxy.ports.backend)[0] ===
                443 ? 's' : ''
            ) +
            `://${serverConfiguration.hostName}:` +
            String(Object.values(serverConfiguration.proxy.ports.backend)[0])

        const options: RecursivePartial<CheckReachabilityOptions> = {
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

        return (inverse ? checkUnreachability : plainCheckReachability)(
            url, options
        )
    }

    return Promise.resolve(null)
}
// endregion

export const nginx = module.exports satisfies PluginHandler
export default nginx
// endregion
