/**
 * @copyright 2009-2019 Vanilla Forums Inc.
 * @license GPL-2.0-only
 */

import React, { useRef, useEffect, useMemo } from "react";
import { INavigationTreeItem, navigationItemBadgeType } from "@library/@types/api/core";
import { dropDownClasses } from "@library/flyouts/dropDownStyles";
import Button from "@library/forms/Button";
import { ButtonTypes } from "@library/forms/buttonTypes";
import { LeftChevronIcon, RightChevronIcon, CloseTinyIcon } from "@library/icons/common";
import classNames from "classnames";
import DropDownItemButton from "@library/flyouts/items/DropDownItemButton";
import DropDownItemLink from "@library/flyouts/items/DropDownItemLink";
import Heading from "@library/layout/Heading";
import { IActiveRecord } from "@library/navigation/SiteNavNode";
import ScreenReaderContent from "@library/layout/ScreenReaderContent";
import { t } from "@vanilla/i18n";

export interface IPanelNavItemsProps {
    navItems: INavigationTreeItem[];
    activeRecord?: IActiveRecord;
    pushParentItem: (item: INavigationTreeItem) => void;
    popParentItem: () => void;
    isNestable: boolean;
    nestedTitle?: string;
    canGoBack?: boolean;
    extraSections?: React.ReactNode;
    isActive?: boolean;
    onClose?: () => void;
}

const VALID_URL_REGEX = /^\s*((https?:\/\/))|^\s*\//i;

export function PanelNavItems(props: IPanelNavItemsProps) {
    const { isActive, navItems = [] } = props;
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const prevFocusedRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (isActive) {
            prevFocusedRef.current = document.activeElement as HTMLElement;
            setTimeout(() => {
                buttonRef.current?.focus();
            }, 200);

            return () => {
                prevFocusedRef.current?.focus();
            };
        }
    }, [isActive]);

    // Check url property of nav items and convert if necessary
    // Some old plugin urls do not have the opening forward slash for settings pages, and therefore
    // do not render properly in a link's href attribute when in mobile view. This conversion will
    // catch any, as there is an unknown number of these urls
    const navItemList = useMemo<INavigationTreeItem[]>(() => {
        return navItems.map(({ url: tmpUrl, ...navItem }) => {
            const url = tmpUrl && VALID_URL_REGEX.test(tmpUrl) ? tmpUrl : `/${tmpUrl}`;
            return { ...navItem, url };
        });
    }, [navItems]);

    const classes = dropDownClasses();
    return (
        <>
            {props.nestedTitle && (
                <>
                    <Heading
                        title={props.nestedTitle}
                        className={classNames("dropDown-sectionHeading", classes.sectionHeading)}
                    >
                        <div className={classes.headingContentContainer}>
                            {props.canGoBack && (
                                <Button
                                    buttonRef={buttonRef}
                                    buttonType={ButtonTypes.ICON_COMPACT}
                                    onClick={props.popParentItem}
                                    className={classes.backButton}
                                >
                                    <LeftChevronIcon className={classes.arrow} />
                                </Button>
                            )}
                            <div className={classes.headingTitleContainer}> {props.nestedTitle} </div>
                            <Button
                                className={classes.closeButton}
                                onClick={props.onClose}
                                buttonType={ButtonTypes.ICON_COMPACT}
                            >
                                <ScreenReaderContent>{t("Close")}</ScreenReaderContent>
                                <CloseTinyIcon />
                            </Button>
                        </div>
                    </Heading>
                </>
            )}
            <div className={classes.panelNavItems}>
                <div className={classNames(classes.panelContent, { isNested: props.canGoBack })}>
                    <ul className={classes.sectionContents}>
                        {navItemList.map((navItem, i) => {
                            const showChildren = props.isNestable && (navItem.children?.length ?? 0) > 0;
                            const isActive =
                                navItem.recordType === props.activeRecord?.recordType &&
                                navItem.recordID === props.activeRecord?.recordID;

                            if (showChildren) {
                                return (
                                    <DropDownItemButton
                                        isActive={isActive}
                                        key={i}
                                        onClick={() => {
                                            props.pushParentItem(navItem);
                                        }}
                                        className={classes.itemButton}
                                    >
                                        <span className={classes.text}>{navItem.name}</span>
                                        <RightChevronIcon className={classes.arrow} />
                                    </DropDownItemButton>
                                );
                            } else {
                                return navItem.isLink ? (
                                    <DropDownItemLink
                                        className={classes.itemButton}
                                        isActive={isActive}
                                        key={i}
                                        to={navItem.url || ""}
                                    >
                                        <span className={classes.text}>{navItem.name}</span>
                                        <RightChevronIcon className={classes.arrow} />
                                    </DropDownItemLink>
                                ) : (
                                    <DropDownItemLink
                                        className={classes.itemButton}
                                        isActive={isActive}
                                        key={i}
                                        to={navItem.url || ""}
                                    >
                                        {navItem.name}
                                        {navItem.badge && navItem.badge.type === navigationItemBadgeType.TEXT && (
                                            <span className={classes.badge}>{navItem.badge.text}</span>
                                        )}
                                    </DropDownItemLink>
                                );
                            }
                        })}
                    </ul>
                    {props.extraSections}
                </div>
            </div>
        </>
    );
}
