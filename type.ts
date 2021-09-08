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
import {ChildProcess} from 'child_process'
import {ProcessCloseReason} from 'clientnode/type'
import {Service as BaseService} from 'web-node/type'
import {
    Configuration as BaseConfiguration,
    Services as BaseServices,
    ServicePromises as BaseServicePromises
} from 'application-server-web-node-plugin/type'
// endregion
// region exports
export type Configuration<PluginConfigurationType = {}> =
    BaseConfiguration<{
        applicationServer:{
            proxy:{
                optional:boolean
                logFilePath:{
                    access:string
                    error:string
                }
                ports:Array<number>
            }
        }
    }> &
    PluginConfigurationType

export interface Service extends BaseService {
    name:'nginx'
    promise:null|Promise<ProcessCloseReason>
}
export interface ServiceProcess extends ChildProcess {
    reload():Promise<string>
}
export type Services<ServiceType = {}> =
    BaseServices<{nginx:null|ServiceProcess}> & ServiceType
export type ServicePromises<ServicePromiseType = {}> =
    BaseServicePromises<{nginx:Promise<ProcessCloseReason>}> &
    ServicePromiseType
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
