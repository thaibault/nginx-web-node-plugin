// -*- coding: utf-8 -*-
/** @module type */
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
import {
    Configuration as BaseConfiguration,
    ServicePromises as BaseServicePromises,
    Services as BaseServices
} from 'application-server-web-node-plugin/type'
import {ChildProcess} from 'child_process'
import {Mapping, ProcessCloseReason} from 'clientnode'
import {
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
                ports: {backend: Mapping<number>}
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
    BaseServices<{nginx: null|ServiceProcess}> &
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
// endregion
