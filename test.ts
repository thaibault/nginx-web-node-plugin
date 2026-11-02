// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
'use strict'
/* !
    region header
    Copyright Torben Sickert (info["~at~"]tsickert.com) 16.12.2012

    License
    -------

    This library written by Torben Sickert stands under a creative commons
    naming 3.0 unported license.
    See https://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// region imports
import type {AddressInfo} from 'net'
import type {
    Configuration, ServiceProcess, ServicePromises, Services
} from './type'

import {chmodSync, mkdtempSync, rmSync, writeFileSync} from 'fs'
import {createServer, Server} from 'http'
import {tmpdir} from 'os'
import {join} from 'path'
import {pluginAPI} from 'web-node'

import {afterAll, beforeAll, beforeEach, describe, expect, test} from
    '@jest/globals'

import {checkReachability, loadService, shouldExit} from './index'
// endregion
// region mockup
let configuration: Configuration
beforeEach(() => {
    configuration = {
        applicationServer: {proxy: {optional: false, ports: {backend: {}}}}
    } as unknown as Configuration
})

const getState = (services: Services) => ({
    configuration,
    data: undefined,
    hook: 'load',
    pluginAPI,
    plugins: [],
    servicePromises: {} as ServicePromises,
    services
})

const startServer = (): Promise<Server> =>
    new Promise<Server>((resolve: (server: Server) => void): void => {
        const server = createServer((_request, response): void => {
            response.end()
        })
        server.listen(0, '127.0.0.1', (): void => {
            resolve(server)
        })
    })
const getURL = (server: Server): string =>
    `http://127.0.0.1:${String((server.address() as AddressInfo).port)}`
const stopServer = (server: Server): Promise<void> =>
    new Promise<void>((resolve: () => void): void => {
        server.close((): void => {
            resolve()
        })
    })
/**
 * Determines a currently unused local port.
 * @returns A promise resolving to a port number.
 */
const getFreePort = async (): Promise<number> => {
    const server = await startServer()
    const port = (server.address() as AddressInfo).port
    await stopServer(server)

    return port
}
// endregion
// region tests
/// region api
describe('loadService', (): void => {
    /*
        A fake "nginx" executable is put in front of "PATH" so the spawned and
        executed "nginx" commands can be controlled via environment variables.
    */
    let directoryPath: string
    let originalPath: string | undefined

    beforeAll((): void => {
        directoryPath = mkdtempSync(join(tmpdir(), 'nginx-web-node-plugin-'))

        const filePath = join(directoryPath, 'nginx')
        writeFileSync(
            filePath,
            `#!/bin/sh
if [ "$1" = -s ]; then
    if [ "$NGINX_FAKE_RELOAD" = fail ]; then
        echo 'invalid configuration' >&2
        exit 1
    fi
    echo reloaded
    exit 0
fi
case "$NGINX_FAKE_MODE" in
    fail) exit 1 ;;
    serve) exec node -e "require('http').createServer((q, s) => s.end())` +
            `.listen(Number(process.env.NGINX_FAKE_PORT), '127.0.0.1')" ;;
    *) exec sleep 30 ;;
esac
`
        )
        chmodSync(filePath, 0o755)

        originalPath = process.env.PATH
        process.env.PATH = `${directoryPath}:${originalPath ?? ''}`
    })
    afterAll((): void => {
        process.env.PATH = originalPath
        delete process.env.NGINX_FAKE_MODE
        delete process.env.NGINX_FAKE_PORT
        delete process.env.NGINX_FAKE_RELOAD

        rmSync(directoryPath, {force: true, recursive: true})
    })

    test('already loaded', async (): Promise<void> => {
        await expect(loadService(getState({nginx: {}} as Services)))
            .resolves.toBeNull()
    })
    test('without proxy url', async (): Promise<void> => {
        process.env.NGINX_FAKE_MODE = 'idle'
        const services = {} as Services

        const result = await loadService(getState(services))

        expect(result).toHaveProperty('nginx')
        expect(result?.nginx).toBeInstanceOf(Promise)
        expect(services.nginx).not.toBeNull()

        const nginx = services.nginx as ServiceProcess
        nginx.kill('SIGTERM')
        await expect(result?.nginx)
            .resolves.toHaveProperty('reason.process', nginx)
    })
    test('reachable', async (): Promise<void> => {
        const port = await getFreePort()
        process.env.NGINX_FAKE_MODE = 'serve'
        process.env.NGINX_FAKE_PORT = String(port)
        configuration.applicationServer.proxy.url =
            `http://127.0.0.1:${String(port)}`
        const services = {} as Services

        const result = await loadService(getState(services))

        expect(result?.nginx).toBeInstanceOf(Promise)

        const nginx = services.nginx as ServiceProcess

        try {
            process.env.NGINX_FAKE_RELOAD = 'ok'
            await expect(nginx.reload()).resolves.toContain('reloaded')

            process.env.NGINX_FAKE_RELOAD = 'fail'
            await expect(nginx.reload()).rejects.toHaveProperty(
                'standardErrorOutput', 'invalid configuration\n'
            )

            await expect(shouldExit(getState(services)))
                .resolves.toBeUndefined()
            expect(services).toStrictEqual({})
            await expect(result?.nginx)
                .resolves.toHaveProperty('reason.process', nginx)
        } finally {
            // Cleanup fake process if not already stopped.
            nginx.kill('SIGTERM')
        }
    }, 10000)
    test('unreachable but optional', async (): Promise<void> => {
        process.env.NGINX_FAKE_MODE = 'fail'
        configuration.applicationServer.proxy.optional = true
        configuration.applicationServer.proxy.url =
            `http://127.0.0.1:${String(await getFreePort())}`
        const services = {} as Services

        await expect(loadService(getState(services)))
            .resolves.toStrictEqual({nginx: null})
        expect(services.nginx).toBeNull()
    }, 10000)
    test('unreachable and required', async (): Promise<void> => {
        process.env.NGINX_FAKE_MODE = 'idle'
        configuration.applicationServer.proxy.url =
            `http://127.0.0.1:${String(await getFreePort())}`
        const services = {} as Services

        await expect(loadService(getState(services))).rejects.toThrow(
            /^Could not acknowledge that nginx is running because "http:/
        )

        // Cleanup still running fake process.
        services.nginx?.kill('SIGTERM')
    }, 10000)
})
describe('shouldExit', (): void => {
    test('running service', async (): Promise<void> => {
        let signal: NodeJS.Signals | number | undefined
        const services: Services = {nginx: {
            kill: (givenSignal?: NodeJS.Signals | number): boolean => {
                signal = givenSignal

                return true
            }
        } as ServiceProcess} as Services

        await expect(shouldExit(getState(services))).resolves.toBeUndefined()

        expect(services).toStrictEqual({})
        expect(signal).toStrictEqual('SIGINT')
    })
    test('optional not started service', async (): Promise<void> => {
        const services = {nginx: null} as Services

        await expect(shouldExit(getState(services))).resolves.toBeUndefined()

        expect(services).toStrictEqual({})
    })
    test('never loaded service', async (): Promise<void> => {
        const services = {} as Services

        await expect(shouldExit(getState(services))).resolves.toBeUndefined()

        expect(services).toStrictEqual({})
    })
    test('service without kill method', async (): Promise<void> => {
        const services = {nginx: {}} as Services

        await expect(shouldExit(getState(services))).resolves.toBeUndefined()

        expect(services).toStrictEqual({})
    })
})
/// endregion
/// region helper
describe('checkReachability', (): void => {
    test('without proxy url', async (): Promise<void> => {
        await expect(checkReachability(configuration.applicationServer))
            .resolves.toBeNull()
        await expect(checkReachability(configuration.applicationServer, true))
            .resolves.toBeNull()
    })
    test('reachable server', async (): Promise<void> => {
        const server = await startServer()
        configuration.applicationServer.proxy.url = getURL(server)

        try {
            await expect(checkReachability(configuration.applicationServer))
                .resolves.toHaveProperty('status', 200)
            await expect(checkReachability(
                configuration.applicationServer, true, {timeoutInSeconds: .2}
            )).resolves.toBeInstanceOf(Error)
        } finally {
            await stopServer(server)
        }
    })
    test('unreachable server', async (): Promise<void> => {
        configuration.applicationServer.proxy.url =
            `http://127.0.0.1:${String(await getFreePort())}`

        await expect(checkReachability(
            configuration.applicationServer, false, {timeoutInSeconds: .2}
        )).rejects.toBeDefined()
        await expect(checkReachability(configuration.applicationServer, true))
            .resolves.toHaveProperty('message', 'fetch failed')
    })
    test('unreachable ssl server', async (): Promise<void> => {
        configuration.applicationServer.proxy.url =
            `https://127.0.0.1:${String(await getFreePort())}`

        await expect(checkReachability(configuration.applicationServer, true))
            .resolves.toHaveProperty('message', 'fetch failed')
    })
})
/// endregion
// endregion
