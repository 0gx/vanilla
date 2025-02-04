/**
 * @copyright 2009-2023 Vanilla Forums Inc.
 * @license GPL-2.0-only
 */

import { LoadStatus } from "@library/@types/api/core";
import SearchBar from "@library/features/search/SearchBar";
import { searchBarClasses } from "@library/features/search/SearchBar.styles";
import SearchOption from "@library/features/search/SearchOption";
import { ButtonTypes } from "@library/forms/buttonTypes";
import TitleBar from "@library/headers/TitleBar";
import Container from "@library/layout/components/Container";
import Drawer from "@library/layout/drawer/Drawer";
import { PageHeading } from "@library/layout/PageHeading";
import DocumentTitle from "@library/routing/DocumentTitle";
import QueryString from "@library/routing/QueryString";
import { SearchInFilter } from "@library/search/SearchInFilter";
import { SearchPageResults } from "@library/search/SearchPageResults";
import { SortAndPaginationInfo } from "@library/search/SortAndPaginationInfo";
import { typographyClasses } from "@library/styles/typographyStyles";
// This new page must have our base reset in place.
import "@library/theming/reset";
import { t, formatUrl } from "@library/utility/appUtils";
import Banner from "@library/banner/Banner";
import { useSearchForm } from "@library/search/SearchContext";
import { useLastValue } from "@vanilla/react-utils";
import classNames from "classnames";
import qs from "qs";
import React, { ReactElement, useEffect, useMemo } from "react";
import { useLocation, useHistory } from "react-router";
import SectionTwoColumns from "@library/layout/TwoColumnSection";
import { SectionProvider, useSection } from "@library/layout/LayoutContext";
import PanelWidget from "@library/layout/components/PanelWidget";
import PanelWidgetHorizontalPadding from "@library/layout/components/PanelWidgetHorizontalPadding";
import { SectionTypes } from "@library/layout/types/interface.layoutTypes";
import {
    EmptySearchScopeProvider,
    SEARCH_SCOPE_LOCAL,
    useSearchScope,
} from "@library/features/search/SearchScopeContext";
import ConditionalWrap from "@library/layout/ConditionalWrap";
import { SearchBarPresets } from "@library/banner/SearchBarPresets";
import { LinkContextProvider } from "@library/routing/links/LinkContextProvider";
import History from "history";
import { Backgrounds } from "@library/layout/Backgrounds";
import { Tabs } from "@library/sectioning/Tabs";
import { TabsTypes } from "@library/sectioning/TabsTypes";
import { useSearchSources } from "@library/search/SearchSourcesContextProvider";
import { ALL_CONTENT_DOMAIN_KEY } from "./searchConstants";
import PlacesSearchListing from "./PlacesSearchListing";
import PLACES_SEARCH_DOMAIN from "@dashboard/components/panels/PlacesSearchDomain";

interface IProps {
    placeholder?: string;
}

export function SearchPageContent(props: IProps) {
    const { form, updateForm, search, response, domainSearchResponse, handleSourceChange, domains, currentDomain } =
        useSearchForm<{}>();

    const { isCompact } = useSection();

    const { sources, currentSource } = useSearchSources();
    const lastSourceKey = useLastValue(currentSource?.key);

    let scope = useSearchScope().value?.value ?? SEARCH_SCOPE_LOCAL;
    if (currentDomain.isIsolatedType) {
        scope = SEARCH_SCOPE_LOCAL;
    }
    const lastScope = useLastValue(scope);

    const hasSpecificRecord = currentDomain.getSpecificRecordID?.(form) ?? false;
    const specificRecordID = hasSpecificRecord ? currentDomain.getSpecificRecordID?.(form) : undefined;

    const SpecificRecordFilter = hasSpecificRecord ? currentDomain.SpecificRecordPanelComponent ?? null : null;
    const SpecificRecordComponent = hasSpecificRecord ? currentDomain.SpecificRecordComponent ?? null : null;

    const rightTopContent: ReactElement | undefined = SpecificRecordFilter ? (
        <SpecificRecordFilter />
    ) : currentDomain.PanelComponent ? (
        <currentDomain.PanelComponent />
    ) : undefined;

    const { needsResearch } = form;
    useEffect(() => {
        if (
            currentSource &&
            (needsResearch ||
                (lastScope && lastScope !== scope) ||
                (lastSourceKey && lastSourceKey !== currentSource.key))
        ) {
            search();
        }
    });

    const sortAndPaginationContent = useMemo(() => {
        return (
            <SortAndPaginationInfo
                pages={response.data?.pagination}
                sortValue={form.sort}
                onSortChange={(newSort) => updateForm({ sort: newSort })}
                sortOptions={currentDomain?.sortValues ?? currentSource?.sortOptions ?? []}
            />
        );
    }, [currentDomain, form.sort, response, updateForm, currentSource]);

    const sortedNonIsolatedDomains = domains.filter((domain) => !domain.isIsolatedType).sort((a, b) => a.sort - b.sort);
    const availableDomainKeys = domains.map(({ key }) => key);

    const hasPlacesDomain = availableDomainKeys.includes(PLACES_SEARCH_DOMAIN.key);

    const extraHeadingContent = (
        <>
            {!hasSpecificRecord && domains.length > 1 && (
                <SearchInFilter
                    setData={(newDomain) => {
                        updateForm({ domain: newDomain, page: undefined });
                    }}
                    activeItem={form.domain}
                    filters={sortedNonIsolatedDomains.map((domain) => {
                        return {
                            label: domain.name,
                            icon: domain.icon,
                            data: domain.key,
                        };
                    })}
                    endFilters={domains
                        .filter((domain) => domain.isIsolatedType)
                        .map((domain) => {
                            return {
                                label: domain.name,
                                icon: domain.icon,
                                data: domain.key,
                            };
                        })}
                />
            )}

            {currentDomain.key === ALL_CONTENT_DOMAIN_KEY && hasPlacesDomain ? (
                <PlacesSearchListing domainSearchResponse={domainSearchResponse} />
            ) : undefined}
        </>
    );

    const searchPageResultsContent = (
        <>
            {extraHeadingContent}
            {isCompact && !!rightTopContent && (
                <PanelWidgetHorizontalPadding>
                    <Drawer title={t("Filter Results")}>{rightTopContent}</Drawer>
                </PanelWidgetHorizontalPadding>
            )}
            {sources.length <= 1 && sortAndPaginationContent}
            <SearchPageResults />
        </>
    );

    return (
        <Container>
            <SectionTwoColumns
                className="hasLargePadding"
                mainTop={
                    <>
                        <PanelWidget>
                            <PageHeading title={t("Search")} includeBackLink={true} />
                            <ConditionalWrap
                                condition={currentDomain.isIsolatedType}
                                component={EmptySearchScopeProvider}
                            >
                                <div className={searchBarClasses({}).standardContainer}>
                                    <SearchBar
                                        placeholder={props.placeholder}
                                        onChange={(newQuery) => updateForm({ query: newQuery })}
                                        value={`${form.query}`}
                                        onSearch={search}
                                        isLoading={response.status === LoadStatus.LOADING}
                                        optionComponent={SearchOption}
                                        triggerSearchOnClear={true}
                                        titleAsComponent={t("Search")}
                                        disableAutocomplete={true}
                                        buttonType={ButtonTypes.PRIMARY}
                                        overwriteSearchBar={{
                                            preset: SearchBarPresets.BORDER,
                                        }}
                                    />
                                </div>
                                {!!SpecificRecordComponent && (
                                    <SpecificRecordComponent discussionID={specificRecordID} />
                                )}
                            </ConditionalWrap>
                        </PanelWidget>
                    </>
                }
                mainBottom={
                    <PanelWidgetHorizontalPadding>
                        {sources.length > 1 ? (
                            <Tabs
                                defaultTabIndex={
                                    currentSource ? sources.map(({ key }) => key).indexOf(currentSource.key) : 0
                                }
                                includeVerticalPadding={false}
                                includeBorder
                                largeTabs
                                tabType={TabsTypes.BROWSE}
                                data={sources.map((source) => ({
                                    tabID: source.key,
                                    label: source.label,
                                    contents: searchPageResultsContent,
                                }))}
                                onChange={({ tabID: newSourceKey }) => {
                                    handleSourceChange(`${newSourceKey!}`);
                                }}
                                extraButtons={sortAndPaginationContent}
                            />
                        ) : (
                            <>{searchPageResultsContent}</>
                        )}
                    </PanelWidgetHorizontalPadding>
                }
                secondaryTop={!isCompact && !!rightTopContent && <PanelWidget>{rightTopContent}</PanelWidget>}
            />
        </Container>
    );
}

function useInitialQueryParamSync() {
    const { updateForm, resetForm, form } = useSearchForm<{}>();
    const history = useHistory();
    const location = useLocation();
    const searchScope = useSearchScope();

    const { sources, setCurrentSource } = useSearchSources();

    const { initialized } = form;

    useEffect(() => {
        const unregisterListener = history.listen((location: History.Location<any>, action: History.Action) => {
            // Whenever the history object is updated, we will reinitialize the form.
            if (action === "POP" || action === "PUSH") {
                resetForm();
            }
        });
        return unregisterListener;
    }, []);

    useEffect(() => {
        if (initialized) {
            // We're already initialized.
            return;
        }

        const { search: browserQuery } = location;
        const queryForm: any = qs.parse(browserQuery, { ignoreQueryPrefix: true });

        for (const [key, value] of Object.entries(queryForm)) {
            if (value === "true") {
                queryForm[key] = true;
            }

            if (value === "false") {
                queryForm[key] = false;
            }

            if (
                // turn pure integer values into numbers.
                typeof value === "string" &&
                value.match(/^[\d]*$/) &&
                !value.match(/^0/)
            ) {
                let intVal = parseInt(value, 10);
                if (!Number.isNaN(intVal)) {
                    queryForm[key] = intVal;
                }
            }

            if (key.toLocaleLowerCase() === "search") {
                queryForm["query"] = queryForm[key];
            }

            if (key === "discussionID") {
                queryForm.domain = "discussions";
            }

            if (key === "source") {
                queryForm.source = queryForm[key];
            }
        }

        // fixme
        const blockedKeys = ["needsResearch", "initialized", "pageURL", "offset"];
        blockedKeys.forEach((key) => {
            if (queryForm[key] !== undefined) {
                delete queryForm[key];
            }
        });

        if (typeof queryForm.scope === "string") {
            searchScope.setValue?.(queryForm.scope);
        }

        if (typeof queryForm.source === "string" && sources.find(({ key }) => key === queryForm.source)) {
            setCurrentSource(queryForm.source);
        }

        queryForm.initialized = true;

        updateForm(queryForm);
        // Only for first initialization.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialized]);
}

export default function SearchPage(props: IProps) {
    const { form, defaultFormValues, currentDomain } = useSearchForm<{}>();
    const { currentSource } = useSearchSources();

    let scope = useSearchScope().value?.value ?? SEARCH_SCOPE_LOCAL;
    if (currentDomain.isIsolatedType) {
        scope = SEARCH_SCOPE_LOCAL;
    }

    useInitialQueryParamSync();

    return (
        <SectionProvider type={SectionTypes.TWO_COLUMNS}>
            <QueryString
                value={{
                    ...form,
                    initialized: undefined,
                    scope,
                    needsResearch: undefined,
                    source: currentSource?.key,
                    pageURL: undefined,
                    offset: undefined,
                }}
                defaults={defaultFormValues}
            />
            <Backgrounds />
            {/* Add a context provider so that smartlinks within search use dynamic navigation. */}
            <LinkContextProvider linkContexts={[formatUrl("/search", true)]}>
                <DocumentTitle title={form.query ? `${form.query}` : t("Search Results")}>
                    <TitleBar title={t("Search")} />
                    <Banner isContentBanner />
                    <SearchPageContent {...props} />
                </DocumentTitle>
            </LinkContextProvider>
        </SectionProvider>
    );
}
