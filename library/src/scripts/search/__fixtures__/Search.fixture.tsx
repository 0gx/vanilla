/**
 * @author Maneesh Chiba <maneesh.chiba@vanillaforums.com>
 * @copyright 2009-2023 Vanilla Forums Inc.
 * @license Proprietary
 */

import React from "react";
import { ISearchForm, ISearchResult, ISearchResponse, IArticlesSearchResult } from "@library/search/searchTypes";
import { ISearchRequestQuery, ISearchSource } from "@library/search/searchTypes";
import SearchDomain from "@library/search/SearchDomain";
import { TypeAllIcon } from "@library/icons/searchIcons";

interface IParams {
    pagination?: ISearchResponse["pagination"];
    result?: Partial<ISearchResult>;
}

/**
 * Utilities for testing search
 */
export class SearchFixture {
    /**
     * Create search form
     */

    public static createMockSearchForm<ExtraFormValues extends object = {}>(params?: ExtraFormValues) {
        return {
            domain: "test-domain",
            query: "test-query",
            page: 1,
            sort: "relevance",
            initialized: true,
            ...(params ?? {}),
        } as ISearchForm<ExtraFormValues>;
    }
    /**
     * Create a single search result
     */
    public static createMockSearchResult(
        id: number = 1,
        params?: Partial<IArticlesSearchResult>,
    ): IArticlesSearchResult {
        return {
            name: `test result ${id}`,
            url: `test-url-${id}`,
            body: "test",
            excerpt: "test",
            recordID: id,
            recordType: "test",
            type: "article",
            breadcrumbs: [],
            dateUpdated: "",
            dateInserted: "",

            insertUser: {
                userID: 1,
                name: "Bob",
                photoUrl: "",
                dateLastActive: "2016-07-25 17:51:15",
            },

            ...params,
        };
    }

    /**
     * Create a mock search response
     */
    public static createMockSearchResults(
        numberOfResults: number = 14,
        params?: { result?: Partial<ISearchResult>; pagination?: Partial<ISearchResponse["pagination"]> },
    ): ISearchResponse {
        return {
            results: Array(numberOfResults)
                .fill(null)
                .map((_, id) => this.createMockSearchResult(id, params?.result)),

            pagination: {
                next: 2,
                prev: 0,
                total: numberOfResults,
                currentPage: 1,
                ...params?.pagination,
            },
        };
    }
}

export class MockSearchSource implements ISearchSource {
    public label = "Mock Search Source Label";
    public key = "mockSearchKey";
    public endpoint = "/mock-search-endpoint";
    public results: [];

    private abortController: AbortController;

    constructor() {
        this.abortController = new AbortController();
    }

    public abort() {
        this.abortController.abort();
        this.abortController = new AbortController();
    }

    public domains: SearchDomain[] = [];

    addDomain(domain: SearchDomain) {
        if (!this.domains.find(({ key }) => key === domain.key)) {
            this.domains.push(domain);
        }
    }

    public performSearch = jest.fn(async function (requestParams: ISearchRequestQuery, endpointOverride?: string) {
        return {
            results: [],
            pagination: {},
        };
    });
}

//represents shrunk mock of ConnectedSearchSource class, with fake api response
export class MockConnectedSearchSource implements ISearchSource {
    public label: string;
    public endpoint: string;
    public searchConnectorID: string;
    public results: [];

    private abortController: AbortController;

    constructor(config) {
        this.label = config.label;
        this.endpoint = config.endpoint;
        this.searchConnectorID = config.searchConnectorID;
        this.abortController = new AbortController();
        this.results = config.results;
    }

    get key(): string {
        return this.searchConnectorID;
    }

    public domains = [];

    public addDomain() {}

    public abort() {
        this.abortController.abort();
        this.abortController = new AbortController();
    }

    //mock api response for a custom connected search
    public performSearch = jest.fn(async (requestParams: ISearchRequestQuery, endpointOverride?: string) => {
        return {
            results: this.results,
            pagination: {},
        };
    });
}

export const MOCK_SEARCH_DOMAIN = new (class MockSearchDomain extends SearchDomain {
    public key = "mockSearch";
    public sort = 0;
    public name = "Mock Search";
    public icon = (<TypeAllIcon />);
    public recordTypes = [];
    public isIsolatedType = false;
    public transformFormToQuery = jest.fn(function (form) {
        return {
            ...form,
        };
    });
})();
