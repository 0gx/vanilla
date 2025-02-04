/**
 * @copyright 2009-2019 Vanilla Forums Inc.
 * @license GPL-2.0-only
 */

import React, { useMemo, useEffect, useCallback } from "react";
import { LinkContextProvider } from "@library/routing/links/LinkContextProvider";
import { Router as ReactRouter, Switch, Route } from "react-router-dom";
import { formatUrl } from "@library/utility/appUtils";
import { createBrowserHistory, History } from "history";
import NotFoundPage from "@library/routing/NotFoundPage";
import { BackRoutingProvider } from "@library/routing/links/BackRoutingProvider";
import { initPageViewTracking, usePageChangeListener } from "@library/pageViews/pageViewTracking";
import { ErrorPageBoundary } from "@library/errorPages/ErrorPageBoundary";
import { useDispatch, useSelector } from "react-redux";
import RouteActions from "@library/RouteActions";
import { ICoreStoreState } from "@library/redux/reducerRegistry";
import { IError } from "@library/errorPages/CoreErrorMessages";
import { ErrorPage } from "@library/errorPages/ErrorComponent";

interface IProps {
    disableDynamicRouting?: boolean;
    sectionRoots?: string[];
    history?: History;
    useLayoutRouting?: boolean;
    onRouteChange?: (history: History) => void;
    ErrorPageComponent?: React.ComponentType<{ error?: Partial<IError> }>;
}

export function Router(props: IProps) {
    const { onRouteChange } = props;
    const ownHistory = useMemo(() => createBrowserHistory({ basename: formatUrl("") }), []);
    const history = props.history ?? ownHistory;
    const dispatch = useDispatch();
    const clearInitialRouteError = useCallback(() => {
        dispatch(RouteActions.resetAC());
    }, [dispatch]);
    const initialRouteError = useSelector((state: ICoreStoreState) => state.route.error);
    const ErrorPageComponent = props.ErrorPageComponent ?? ErrorPage;

    useEffect(() => {
        initPageViewTracking(history);
    }, [history]);

    const pageChangeHandler = useCallback(() => {
        clearInitialRouteError();
        window.scrollTo(0, 0);
        onRouteChange?.(history);
    }, [history, onRouteChange, clearInitialRouteError]);

    usePageChangeListener(pageChangeHandler);

    let routes = (
        <ErrorPageBoundary>
            {initialRouteError ? (
                <ErrorPageComponent error={initialRouteError}></ErrorPageComponent>
            ) : (
                <Switch>
                    {Router._routes}
                    <Route key="@not-found" component={NotFoundPage} />
                </Switch>
            )}
        </ErrorPageBoundary>
    );

    routes = <BackRoutingProvider>{routes}</BackRoutingProvider>;
    if (!props.disableDynamicRouting) {
        routes = (
            <LinkContextProvider
                useLayoutRouting={props.useLayoutRouting}
                linkContexts={(props.sectionRoots ?? ["/"])?.map((root) => formatUrl(root, true))}
            >
                {routes}
            </LinkContextProvider>
        );
    }

    return <ReactRouter history={history}>{routes}</ReactRouter>;
}

/**
 * The currently registered routes.
 * @private
 */
Router._routes = [];

/**
 * Register one or more routes to the app component.
 *
 * @param routes An array of routes to add.
 */
Router.addRoutes = (routes: React.ReactNode[]) => {
    if (!Array.isArray(routes)) {
        Router._routes.push(routes);
    } else {
        Router._routes.push(...routes);
    }
};
