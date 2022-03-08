/**
 * @copyright 2009-2022 Vanilla Forums Inc.
 * @license Proprietary
 */
import * as React from "react";
import { t } from "@vanilla/i18n";
import { ILayoutCatalog, LayoutSectionID } from "@dashboard/layout/layoutSettings/LayoutSettings.types";
import { ToolTip } from "@library/toolTip/ToolTip";
import { InformationIcon } from "@library/icons/common";
import { layoutSectionThumbnailsClasses } from "@dashboard/appearance/thumbnails/LayoutSectionsThumbnails.classes";
import Translate from "@library/content/Translate";
import SmartLink from "@library/routing/links/SmartLink";
import { useRef, useState } from "react";
import { cx } from "@emotion/css";
import { CustomRadioGroup, CustomRadioInput } from "@vanilla/ui";
import { userContentClasses } from "@library/content/UserContent.styles";
import { useUniqueID } from "@library/utility/idUtils";
import { RecordID } from "@vanilla/utils";
interface IProps {
    labelID: string;
    value?: LayoutSectionID;
    onChange?: (section: LayoutSectionID) => any;
    sections: ILayoutCatalog["sections"];
}

const LAYOUT_SECTIONS_THUMBNAILS = {
    "react.section.full-width": {
        label: "Full-Width",
        iconUrl: require("!file-loader!./icons/fullwidth.svg").default,
    },
    "react.section.1-column": {
        label: "1 column",
        iconUrl: require("!file-loader!./icons/1column.svg").default,
    },
    "react.section.2-columns": {
        label: "2 columns",
        iconUrl: require("!file-loader!./icons/2column.svg").default,
    },
    "react.section.3-columns": {
        label: "3 columns",
        iconUrl: require("!file-loader!./icons/3column.svg").default,
    },
};

export default function LayoutSectionsThumbnails(props: IProps) {
    const { sections, labelID } = props;
    const classes = layoutSectionThumbnailsClasses();
    const [ownValue, ownOnChange] = useState(Object.keys(LAYOUT_SECTIONS_THUMBNAILS)[0] as RecordID);
    const value = props.value ?? ownValue;
    const onChange = props.onChange ?? ownOnChange;

    const descriptionID = useUniqueID("layoutSectionDescription");

    return (
        <div className={classes.container}>
            <div className={cx(userContentClasses().root, classes.description)} id={descriptionID}>
                <Translate
                    source="Select a section you want to add for your page. Find out more in the <1>documentation.</1>"
                    c1={(text) => (
                        //documentation link should be here when its ready
                        <SmartLink to="">{text}</SmartLink>
                    )}
                />
            </div>
            <CustomRadioGroup
                aria-labelledby={labelID}
                aria-describedby={descriptionID}
                name="layoutSection"
                onChange={onChange}
                value={value}
                className={classes.thumbnails}
            >
                {Object.keys(sections)
                    .reverse()
                    .map((sectionID: LayoutSectionID) => {
                        const label = t(LAYOUT_SECTIONS_THUMBNAILS[sectionID].label);
                        const accessibleDescription =
                            t("Widget Type: ") +
                            sections[sectionID].recommendedWidgets
                                .map((recommendedWidget) => recommendedWidget.widgetName)
                                .join(", ") +
                            t(" etc");

                        return (
                            <CustomRadioInput
                                value={sectionID}
                                accessibleDescription={accessibleDescription}
                                key={sectionID}
                                className={classes.thumbnailWrapper}
                            >
                                {({ isSelected, isFocused }) => (
                                    <>
                                        <span
                                            role="decoration"
                                            className={cx(classes.thumbnail, {
                                                isSelected,
                                                "focus-visible": isFocused,
                                            })}
                                        >
                                            <img
                                                width="188"
                                                height="138"
                                                className={classes.thumbnailImage}
                                                alt={label}
                                                src={LAYOUT_SECTIONS_THUMBNAILS[sectionID].iconUrl}
                                            />
                                        </span>

                                        <div className={classes.labelContainer}>
                                            {label}
                                            <ToolTip label={accessibleDescription}>
                                                <div className={classes.informationIcon}>
                                                    <InformationIcon />
                                                </div>
                                            </ToolTip>
                                        </div>
                                    </>
                                )}
                            </CustomRadioInput>
                        );
                    })}
            </CustomRadioGroup>
        </div>
    );
}