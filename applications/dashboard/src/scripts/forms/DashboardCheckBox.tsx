/**
 * @copyright 2009-2019 Vanilla Forums Inc.
 * @license GPL-2.0-only
 */

import React from "react";
import { useDashboardRadioGroup } from "@dashboard/forms/DashboardRadioGroups";
import CheckBox from "@library/forms/Checkbox";
import { cx } from "@emotion/css";
import { checkRadioClasses } from "@library/forms/checkRadioStyles";

interface IProps extends Omit<React.ComponentProps<typeof CheckBox>, "onChange"> {
    onChange?: (newValue: boolean) => void;
    description?: string | React.ReactNode;
}

export function DashboardCheckBox(props: IProps) {
    const { isInline } = useDashboardRadioGroup();
    const { excludeFromICheck = true } = props;

    return (
        <>
            <CheckBox
                {...props}
                excludeFromICheck={excludeFromICheck}
                onChange={(e) => props.onChange && props.onChange(!!e.target.checked)}
                isHorizontal={isInline}
            />
            {props.description && (
                <p className={cx("info", checkRadioClasses().checkBoxDescription)}>{props.description}</p>
            )}
        </>
    );
}
