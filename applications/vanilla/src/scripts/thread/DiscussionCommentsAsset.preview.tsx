/**
 * @author Adam Charron <adam.c@vanillaforums.com>
 * @copyright 2009-2023 Vanilla Forums Inc.
 * @license gpl-2.0-only
 */

import { LayoutEditorPreviewData } from "@dashboard/layout/editor/LayoutEditorPreviewData";
import { Widget } from "@library/layout/Widget";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DiscussionCommentsAsset from "@vanilla/addon-vanilla/thread/DiscussionCommentsAsset";
import React from "react";

interface IProps
    extends Omit<
        React.ComponentProps<typeof DiscussionCommentsAsset>,
        "commentsPreload" | "categoryID" | "discussion"
    > {}

const comments = LayoutEditorPreviewData.comments(5);
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            enabled: false,
            retry: false,
            staleTime: Infinity,
        },
    },
});

export function DiscussionCommentsAssetPreview(props: IProps) {
    return (
        <Widget>
            <QueryClientProvider client={queryClient}>
                <DiscussionCommentsAsset
                    {...props}
                    commentsPreload={{
                        data: comments,
                        paging: LayoutEditorPreviewData.paging(props.apiParams?.limit ?? 30),
                    }}
                    apiParams={{ discussionID: "fake", limit: 30, page: 1 }}
                    discussion={{ ...LayoutEditorPreviewData.discussion() }}
                />
            </QueryClientProvider>
        </Widget>
    );
}
