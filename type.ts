// -*- coding: utf-8 -*-
/** @module type */
'use strict'
/* !
    region header
    Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

    License
    -------

    This library written by Torben Sickert stands under a creative commons
    naming 3.0 unported license.
    See https://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// region imports
import type {
    Configuration as BaseConfiguration,
    ServicePromises as BaseServicePromises,
    Services as BaseServices,
    PluginHandler as BasePluginHandler
} from 'application-server-web-node-plugin/type'
import type {ChildProcess} from 'child_process'
import type {
    CheckReachabilityOptions, Mapping, ProcessCloseReason, RecursivePartial
} from 'clientnode'
import type {
    ServicePromisesState as BaseServicePromisesState,
    ServicesState as BaseServicesState
} from 'web-node/type'
// endregion
// region exports
export type Configuration<PluginConfigurationType = Mapping<unknown>> =
    BaseConfiguration<{
        applicationServer: {
            proxy: {
                optional: boolean
                logFilePath: {
                    access: string
                    error: string
                }
                url: string
            }
        }
    }> &
    PluginConfigurationType

export interface ServiceProcess extends ChildProcess {
    reload(): Promise<string>
}
export type ServicePromises<Type = Mapping<unknown>> =
    BaseServicePromises<{nginx: Promise<ProcessCloseReason>}> &
    Type
export type Services<Type = Mapping<unknown>> =
    BaseServices<{nginx: null | ServiceProcess}> &
    Type

export type ServicesState = BaseServicesState<
    undefined,
    Configuration,
    Services
>
export type ServicePromisesState = BaseServicePromisesState<
    undefined,
    Configuration,
    Services,
    ServicePromises
>

export interface PluginHandler extends BasePluginHandler {
    checkReachability(
        serverConfiguration: Configuration['applicationServer'],
        inverse: boolean,
        givenOptions: RecursivePartial<CheckReachabilityOptions>
    ): Promise<Error | null | Promise<Error | null> | Response>
}
// endregion
