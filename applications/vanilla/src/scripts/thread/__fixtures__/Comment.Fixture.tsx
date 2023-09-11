/**
 * @author Maneesh Chiba <mchiba@higherlogic.com>
 * @copyright 2009-2023 Vanilla Forums Inc.
 * @license GPL-2.0-only
 */

import { LoadStatus } from "@library/@types/api/core";
import { UserFixture } from "@library/features/__fixtures__/User.fixture";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { render } from "@testing-library/react";
import { TestReduxProvider } from "@library/__tests__/TestReduxProvider";
import React from "react";
import { ICoreStoreState } from "@library/redux/reducerRegistry";
import { IComment } from "@dashboard/@types/api/comment";

interface IWrapInProviderOptions {
    state?: Partial<ICoreStoreState>;
    enableNetworkRequests?: boolean;
}

export class CommentFixture {
    public static mockComment: IComment = {
        commentID: 999999,
        discussionID: 999999,
        insertUser: UserFixture.createMockUser({ userID: 1 }),
        insertUserID: 1,
        dateInserted: "2020-10-06T15:30:44+00:00",
        dateUpdated: "2020-10-06T15:30:44+00:00",
        score: 999,
        url: "#",
        attributes: {},
        body: "This content is generated by users on the site. You can't update it here.",
        name: "This content is generated by users on the site. You can't update it here.",
    };
    public static wrapInProvider = (children: ReactNode, options?: IWrapInProviderOptions) => {
        const queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    enabled: !!options?.enableNetworkRequests,
                    retry: false,
                },
            },
        });

        render(
            <TestReduxProvider
                state={{
                    users: {
                        current: {
                            status: LoadStatus.SUCCESS,
                            data: {
                                ...UserFixture.createMockUser({ userID: 1 }),
                                countUnreadNotifications: 0,
                                countUnreadConversations: 0,
                            },
                        },
                    },
                    ...options?.state,
                }}
            >
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            </TestReduxProvider>,
        );
    };
}
