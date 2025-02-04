/**
 * @author Adam Charron <adam.c@vanillaforums.com>
 * @copyright 2009-2023 Vanilla Forums Inc.
 * @license gpl-2.0-only
 */

import { IComment, ICommentEdit } from "@dashboard/@types/api/comment";
import apiv2 from "@library/apiv2";
import SimplePagerModel, { IWithPaging } from "@library/navigation/SimplePagerModel";
import { RecordID } from "@vanilla/utils";

export const CommentsApi = {
    index: async (apiParams: CommentsApi.IndexParams): Promise<IWithPaging<IComment[]>> => {
        const result = await apiv2.get<IComment[]>("/comments", {
            params: {
                // Make sure if you add anything else here it's handled in the backend preload as well.
                ...apiParams,
            },
        });

        const paging = SimplePagerModel.parseHeaders(result.headers);
        return {
            data: result.data,
            paging,
        };
    },
    getEdit: async (commentID: RecordID): Promise<ICommentEdit> => {
        const result = await apiv2.get<ICommentEdit>(`/comments/${commentID}/edit`);
        return result.data;
    },
    post: async (apiParams: CommentsApi.PostParams): Promise<IComment[]> => {
        const result = await apiv2.post("/comments", apiParams);
        return result.data;
    },
    patch: async (apiParams: CommentsApi.PatchParams): Promise<IComment[]> => {
        const { commentID, ...body } = apiParams;
        const result = await apiv2.patch(`/comments/${commentID}`, apiParams);
        return result.data;
    },
    delete: async (commentID: RecordID) => {
        await apiv2.delete(`/comments/${commentID}`);
    },
};
