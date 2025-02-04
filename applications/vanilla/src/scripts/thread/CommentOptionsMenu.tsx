/**
 * @author Adam Charron <adam.c@vanillaforums.com>
 * @copyright 2009-2023 Vanilla Forums Inc.
 * @license gpl-2.0-only
 */

import { IComment } from "@dashboard/@types/api/comment";
import { IDiscussion } from "@dashboard/@types/api/discussion";
import { IApiError } from "@library/@types/api/core";
import { useUserCanStillEditDiscussionOrComment } from "@library/features/discussions/discussionHooks";
import { useToast } from "@library/features/toaster/ToastContext";
import { IPermissionOptions, PermissionMode } from "@library/features/users/Permission";
import { usePermissionsContext } from "@library/features/users/PermissionsContext";
import { useCurrentUser } from "@library/features/users/userHooks";
import DropDown, { DropDownOpenDirection, FlyoutType, IDropDownProps } from "@library/flyouts/DropDown";
import DropDownItemButton from "@library/flyouts/items/DropDownItemButton";
import DropDownItemLink from "@library/flyouts/items/DropDownItemLink";
import ModalConfirm from "@library/modal/ModalConfirm";
import { getMeta } from "@library/utility/appUtils";
import { useMutation } from "@tanstack/react-query";
import { CommentsApi } from "@vanilla/addon-vanilla/thread/CommentsApi";
import { t } from "@vanilla/i18n";
import { Hoverable } from "@vanilla/react-utils";
import React, { useState } from "react";

interface IProps {
    comment: IComment;
    discussion: IDiscussion;
    onCommentEdit: () => void;
    onDeleteSuccess?: () => Promise<void>;
    isEditLoading: boolean;
    isVisible?: IDropDownProps["isVisible"];
}

export function CommentOptionsMenu(props: IProps) {
    const { discussion, comment } = props;
    const items: React.ReactNode[] = [];
    const currentUser = useCurrentUser();
    const { hasPermission } = usePermissionsContext();
    const permissionOptions: IPermissionOptions = {
        mode: PermissionMode.RESOURCE_IF_JUNCTION,
        resourceType: "category",
        resourceID: comment.categoryID,
    };

    const toast = useToast();
    const deleteMutation = useMutation({
        mutationFn: CommentsApi.delete,
        onSuccess: () => {
            toast.addToast({
                body: t("Comment Deleted"),
                autoDismiss: true,
            });
        },
        onError(error: IApiError) {
            toast.addToast({
                body: error.message,
                dismissible: true,
            });
        },
    });

    const isOwnComment = comment.insertUserID === currentUser?.userID;

    const { canStillEdit, humanizedRemainingTime } = useUserCanStillEditDiscussionOrComment(discussion, comment);

    if (canStillEdit) {
        items.push(
            <Hoverable
                duration={200}
                once
                onHover={() => {
                    // queryClient.fetchQuery({
                    //     queryFn: async () => {
                    //         return await CommentsApi.getEdit(comment.commentID);
                    //     },
                    //     queryKey: ["commentEdit", comment.commentID],
                    // });
                }}
            >
                {(hoverProps) => (
                    <DropDownItemButton isLoading={props.isEditLoading} {...hoverProps} onClick={props.onCommentEdit}>
                        <span>{humanizedRemainingTime}</span>
                    </DropDownItemButton>
                )}
            </Hoverable>,
        );
    }

    const userCanDeleteComment =
        hasPermission("comments.delete", permissionOptions) ||
        (isOwnComment && canStillEdit && getMeta("ui.allowSelfDelete", false));

    const userCanAccessRevisionHistory = hasPermission("community.moderate") && comment.dateUpdated !== null;

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    if (userCanDeleteComment) {
        items.push(
            <DropDownItemButton
                onClick={() => {
                    setShowDeleteConfirm(true);
                }}
            >
                {t("Delete")}
                <ModalConfirm
                    title={t("Delete Comment")}
                    isVisible={showDeleteConfirm}
                    onCancel={() => {
                        setShowDeleteConfirm(false);
                    }}
                    isConfirmDisabled={deleteMutation.isLoading}
                    isConfirmLoading={deleteMutation.isLoading}
                    onConfirm={async () => {
                        await deleteMutation.mutateAsync(comment.commentID);
                        !!props.onDeleteSuccess && (await props.onDeleteSuccess());
                    }}
                >
                    {t("Are you sure you want to delete this comment?")}
                </ModalConfirm>
            </DropDownItemButton>,
        );
    }
    if (userCanAccessRevisionHistory) {
        items.push(
            <DropDownItemLink to={`/log/filter?recordType=comment&recordID=${comment.commentID}`}>
                {t("Revision History")}
            </DropDownItemLink>,
        );
    }

    return items.length > 0 ? (
        <DropDown
            name={t("Comment Options")}
            openDirection={DropDownOpenDirection.BELOW_LEFT}
            flyoutType={FlyoutType.LIST}
            isVisible={props.isVisible}
        >
            {items.map((item, i) => {
                return <React.Fragment key={i}>{item}</React.Fragment>;
            })}
        </DropDown>
    ) : null;
}
