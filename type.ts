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
import {ChildProcess} from 'child_process'
import {ProcessCloseReason} from 'clientnode/type'
import {Service as BaseService} from 'web-node/type'
import {
    Configuration as BaseConfiguration,
    Services as BaseServices,
    ServicePromises as BaseServicePromises
} from 'serverwebnodeplugin/type'
// endregion
// region exports
export type Configuration = BaseConfiguration & {
    server:{
        proxy:{
            optional:boolean;
            logFilePath:{
                access:string;
                error:string;
            };
            ports:Array<number>;
        };
    };
}
export type Service = BaseService & {
    name:'nginx';
    promise:null|Promise<ProcessCloseReason>;
}
export type ServiceProcess = ChildProcess & {reload:() => Promise<string>}
export type Services = BaseServices & {
    nginx:ServiceProcess|null;
}
export type ServicePromises = BaseServicePromises & {
    nginx:Promise<ProcessCloseReason>;
}
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
