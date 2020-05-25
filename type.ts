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
import {Service} from 'web-node/type'
import {
    ServerPluginHandler, ServerServices, ServerServicePromises
} from 'serverwebnodeplugin/type'
// endregion
// region exports
export type NginxService = Service & {
    name:'nginx';
    promise:Promise<ProcessCloseReason>;
}
export type NginxServices = ServerServices & {nginx:ChildProcess}
export type ServerServicePromises = ServerServicePromises & {
    nginx:Promise<ProcessCloseReason>;
}
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
