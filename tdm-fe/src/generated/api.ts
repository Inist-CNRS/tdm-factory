/* tslint:disable */
/* eslint-disable */
/**
 * Express Swagger API
 * A simple Express API with Swagger documentation
 *
 * The version of the OpenAPI document: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import type { Configuration } from './configuration';
import type { AxiosPromise, AxiosInstance, AxiosRequestConfig } from 'axios';
import globalAxios from 'axios';
// Some imports not used depending on template conditions
// @ts-ignore
import { DUMMY_BASE_URL, assertParamExists, setApiKeyToObject, setBasicAuthToObject, setBearerAuthToObject, setOAuthToObject, setSearchParams, serializeDataIfNeeded, toPathString, createRequestFunction } from './common';
import type { RequestArgs } from './base';
// @ts-ignore
import { BASE_PATH, COLLECTION_FORMATS, BaseAPI, RequiredError, operationServerMap } from './base';

/**
 * 
 * @export
 * @interface Parameter
 */
export interface Parameter {
    /**
     * Display name of the parameter
     * @type {string}
     * @memberof Parameter
     */
    'displayName'?: string;
    /**
     * Name of the parameter
     * @type {string}
     * @memberof Parameter
     */
    'name'?: string;
    /**
     * Value of the parameter
     * @type {string}
     * @memberof Parameter
     */
    'value'?: string;
}
/**
 * 
 * @export
 * @interface Request
 */
export interface Request {
    /**
     * The request name
     * @type {string}
     * @memberof Request
     */
    'label'?: string;
    /**
     * The request url
     * @type {string}
     * @memberof Request
     */
    'url'?: string;
    /**
     * The request description
     * @type {string}
     * @memberof Request
     */
    'description'?: string;
    /**
     * 
     * @type {Array<Parameter>}
     * @memberof Request
     */
    'parameters'?: Array<Parameter>;
    /**
     * The request accept type
     * @type {Array<string>}
     * @memberof Request
     */
    'fileType'?: Array<string>;
}
/**
 * 
 * @export
 * @interface Traitment
 */
export interface Traitment {
    /**
     * 
     * @type {Request}
     * @memberof Traitment
     */
    'wrapper'?: Request;
    /**
     * 
     * @type {Request}
     * @memberof Traitment
     */
    'enrichment'?: Request;
    /**
     * 
     * @type {string}
     * @memberof Traitment
     */
    'mail'?: string;
    /**
     * 
     * @type {string}
     * @memberof Traitment
     */
    'file'?: string;
}
/**
 * 
 * @export
 * @interface TraitmentStartPost200Response
 */
export interface TraitmentStartPost200Response {
    /**
     * A message.
     * @type {string}
     * @memberof TraitmentStartPost200Response
     */
    'message'?: string;
    /**
     * URL associated with the message.
     * @type {string}
     * @memberof TraitmentStartPost200Response
     */
    'url'?: string;
}
/**
 * 
 * @export
 * @interface TraitmentStatusGet200Response
 */
export interface TraitmentStatusGet200Response {
    /**
     * 
     * @type {string}
     * @memberof TraitmentStatusGet200Response
     */
    'message'?: string;
    /**
     * 
     * @type {number}
     * @memberof TraitmentStatusGet200Response
     */
    'errorType'?: number;
}
/**
 * 
 * @export
 * @interface TraitmentUploadPost201Response
 */
export interface TraitmentUploadPost201Response {
    /**
     * 
     * @type {string}
     * @memberof TraitmentUploadPost201Response
     */
    'id'?: string;
}

/**
 * DefaultApi - axios parameter creator
 * @export
 */
export const DefaultApiAxiosParamCreator = function (configuration?: Configuration) {
    return {
        /**
         * Returns a list of data enrichments
         * @summary Get a list of data enrichments
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        dataEnrichmentsListGet: async (options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = `/data-enrichments/list`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;


    
            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Returns a list of data enrichments
         * @summary Get a list of data enrichments
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        dataWrappersListGet: async (options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = `/data-wrappers/list`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;


    
            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Endpoint to set configuration data
         * @summary Set configuration data
         * @param {Traitment} traitment 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        traitmentStartPost: async (traitment: Traitment, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'traitment' is not null or undefined
            assertParamExists('traitmentStartPost', 'traitment', traitment)
            const localVarPath = `/traitment/start`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;


    
            localVarHeaderParameter['Content-Type'] = 'application/json';

            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = serializeDataIfNeeded(traitment, localVarRequestOptions, configuration)

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * get status
         * @summary get status
         * @param {number} id ID parameter
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        traitmentStatusGet: async (id: number, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            // verify required parameter 'id' is not null or undefined
            assertParamExists('traitmentStatusGet', 'id', id)
            const localVarPath = `/traitment/status`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'GET', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;

            if (id !== undefined) {
                localVarQueryParameter['id'] = id;
            }


    
            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
        /**
         * Endpoint to upload a file to the server
         * @summary Upload a file
         * @param {File} [file] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        traitmentUploadPost: async (file?: File, options: AxiosRequestConfig = {}): Promise<RequestArgs> => {
            const localVarPath = `/traitment/upload`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }

            const localVarRequestOptions = { method: 'POST', ...baseOptions, ...options};
            const localVarHeaderParameter = {} as any;
            const localVarQueryParameter = {} as any;
            const localVarFormParams = new ((configuration && configuration.formDataCtor) || FormData)();


            if (file !== undefined) { 
                localVarFormParams.append('file', file as any);
            }
    
    
            localVarHeaderParameter['Content-Type'] = 'multipart/form-data';
    
            setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = {...localVarHeaderParameter, ...headersFromBaseOptions, ...options.headers};
            localVarRequestOptions.data = localVarFormParams;

            return {
                url: toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        },
    }
};

/**
 * DefaultApi - functional programming interface
 * @export
 */
export const DefaultApiFp = function(configuration?: Configuration) {
    const localVarAxiosParamCreator = DefaultApiAxiosParamCreator(configuration)
    return {
        /**
         * Returns a list of data enrichments
         * @summary Get a list of data enrichments
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async dataEnrichmentsListGet(options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Array<Request>>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.dataEnrichmentsListGet(options);
            const index = configuration?.serverIndex ?? 0;
            const operationBasePath = operationServerMap['DefaultApi.dataEnrichmentsListGet']?.[index]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, operationBasePath || basePath);
        },
        /**
         * Returns a list of data enrichments
         * @summary Get a list of data enrichments
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async dataWrappersListGet(options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<Array<Request>>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.dataWrappersListGet(options);
            const index = configuration?.serverIndex ?? 0;
            const operationBasePath = operationServerMap['DefaultApi.dataWrappersListGet']?.[index]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, operationBasePath || basePath);
        },
        /**
         * Endpoint to set configuration data
         * @summary Set configuration data
         * @param {Traitment} traitment 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async traitmentStartPost(traitment: Traitment, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<TraitmentStartPost200Response>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.traitmentStartPost(traitment, options);
            const index = configuration?.serverIndex ?? 0;
            const operationBasePath = operationServerMap['DefaultApi.traitmentStartPost']?.[index]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, operationBasePath || basePath);
        },
        /**
         * get status
         * @summary get status
         * @param {number} id ID parameter
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async traitmentStatusGet(id: number, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<TraitmentStatusGet200Response>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.traitmentStatusGet(id, options);
            const index = configuration?.serverIndex ?? 0;
            const operationBasePath = operationServerMap['DefaultApi.traitmentStatusGet']?.[index]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, operationBasePath || basePath);
        },
        /**
         * Endpoint to upload a file to the server
         * @summary Upload a file
         * @param {File} [file] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        async traitmentUploadPost(file?: File, options?: AxiosRequestConfig): Promise<(axios?: AxiosInstance, basePath?: string) => AxiosPromise<TraitmentUploadPost201Response>> {
            const localVarAxiosArgs = await localVarAxiosParamCreator.traitmentUploadPost(file, options);
            const index = configuration?.serverIndex ?? 0;
            const operationBasePath = operationServerMap['DefaultApi.traitmentUploadPost']?.[index]?.url;
            return (axios, basePath) => createRequestFunction(localVarAxiosArgs, globalAxios, BASE_PATH, configuration)(axios, operationBasePath || basePath);
        },
    }
};

/**
 * DefaultApi - factory interface
 * @export
 */
export const DefaultApiFactory = function (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) {
    const localVarFp = DefaultApiFp(configuration)
    return {
        /**
         * Returns a list of data enrichments
         * @summary Get a list of data enrichments
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        dataEnrichmentsListGet(options?: any): AxiosPromise<Array<Request>> {
            return localVarFp.dataEnrichmentsListGet(options).then((request) => request(axios, basePath));
        },
        /**
         * Returns a list of data enrichments
         * @summary Get a list of data enrichments
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        dataWrappersListGet(options?: any): AxiosPromise<Array<Request>> {
            return localVarFp.dataWrappersListGet(options).then((request) => request(axios, basePath));
        },
        /**
         * Endpoint to set configuration data
         * @summary Set configuration data
         * @param {Traitment} traitment 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        traitmentStartPost(traitment: Traitment, options?: any): AxiosPromise<TraitmentStartPost200Response> {
            return localVarFp.traitmentStartPost(traitment, options).then((request) => request(axios, basePath));
        },
        /**
         * get status
         * @summary get status
         * @param {number} id ID parameter
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        traitmentStatusGet(id: number, options?: any): AxiosPromise<TraitmentStatusGet200Response> {
            return localVarFp.traitmentStatusGet(id, options).then((request) => request(axios, basePath));
        },
        /**
         * Endpoint to upload a file to the server
         * @summary Upload a file
         * @param {File} [file] 
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        traitmentUploadPost(file?: File, options?: any): AxiosPromise<TraitmentUploadPost201Response> {
            return localVarFp.traitmentUploadPost(file, options).then((request) => request(axios, basePath));
        },
    };
};

/**
 * DefaultApi - object-oriented interface
 * @export
 * @class DefaultApi
 * @extends {BaseAPI}
 */
export class DefaultApi extends BaseAPI {
    /**
     * Returns a list of data enrichments
     * @summary Get a list of data enrichments
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DefaultApi
     */
    public dataEnrichmentsListGet(options?: AxiosRequestConfig) {
        return DefaultApiFp(this.configuration).dataEnrichmentsListGet(options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Returns a list of data enrichments
     * @summary Get a list of data enrichments
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DefaultApi
     */
    public dataWrappersListGet(options?: AxiosRequestConfig) {
        return DefaultApiFp(this.configuration).dataWrappersListGet(options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Endpoint to set configuration data
     * @summary Set configuration data
     * @param {Traitment} traitment 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DefaultApi
     */
    public traitmentStartPost(traitment: Traitment, options?: AxiosRequestConfig) {
        return DefaultApiFp(this.configuration).traitmentStartPost(traitment, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * get status
     * @summary get status
     * @param {number} id ID parameter
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DefaultApi
     */
    public traitmentStatusGet(id: number, options?: AxiosRequestConfig) {
        return DefaultApiFp(this.configuration).traitmentStatusGet(id, options).then((request) => request(this.axios, this.basePath));
    }

    /**
     * Endpoint to upload a file to the server
     * @summary Upload a file
     * @param {File} [file] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof DefaultApi
     */
    public traitmentUploadPost(file?: File, options?: AxiosRequestConfig) {
        return DefaultApiFp(this.configuration).traitmentUploadPost(file, options).then((request) => request(this.axios, this.basePath));
    }
}



