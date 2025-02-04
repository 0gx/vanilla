/**
 * @author Maneesh Chiba <mchiba@higherlogic.com>
 * @copyright 2009-2023 Vanilla Forums Inc.
 * @license GPL-2.0-only
 */

declare namespace DiscussionsApi {
    import { IDiscussion } from "@dashboard/@types/api/discussion";
    export interface IndexParams {}

    export interface GetParams {
        discussionID: RecordID;
    }

    export interface PatchParams extends Partial<IDiscussion> {
        discussionID: RecordID;
        insertUserID?: RecordID;
    }
    export interface PutReactionParams {
        reactionTypeID: number;
        hasReacted: boolean;
    }

    export interface DismissParams {
        dismissed?: boolean;
    }
}
