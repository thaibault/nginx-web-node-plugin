import type { CheckReachabilityOptions, RecursivePartial } from 'clientnode';
import type { PluginPromises } from 'web-node/type';
import type { Configuration, PluginHandler, ServicePromisesState } from './type';
import { Logger } from 'clientnode';
export declare const log: Logger;
/**
 * Launches an application server und triggers all some pluginable hooks on
 * an event.
 */
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
export declare const loadService: ({ configuration: { applicationServer: configuration }, services }: ServicePromisesState) => Promise<null | PluginPromises>;
/**
 * Application will be closed soon.
 * @param state - Application state.
 * @param state.configuration - Applications configuration.
 * @param state.services - Application services.
 * @returns Given object of services.
 */
export declare const shouldExit: ({ configuration, services }: ServicePromisesState) => Promise<void>;
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
export declare const checkReachability: (serverConfiguration: Configuration['applicationServer'], inverse?: boolean, givenOptions?: RecursivePartial<CheckReachabilityOptions>) => Promise<Error | null | Promise<Error | null> | Response>;
export declare const nginx: PluginHandler;
export default nginx;
