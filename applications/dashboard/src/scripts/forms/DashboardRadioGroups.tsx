/**
 * @copyright 2009-2019 Vanilla Forums Inc.
 * @license GPL-2.0-only
 */

import React, { useContext } from "react";
import { useFormGroup } from "@dashboard/forms/DashboardFormGroupContext";
import classNames from "classnames";
import { useThrowError } from "@vanilla/react-utils";
import { DashboardLabelType } from "@dashboard/forms/DashboardFormLabel";
import { IFieldError } from "@library/@types/api/core";

interface IRadioGroupContext {
    isInline?: boolean;
    isGrid?: boolean;
    onChange?: (value: string) => void;
    value?: string;
    errors?: IFieldError[];
}

const RadioGroupContext = React.createContext<IRadioGroupContext>({});

export function useDashboardRadioGroup() {
    const context = useContext(RadioGroupContext);

    const throwError = useThrowError();
    if (context === null) {
        throwError(
            new Error(
                "Attempting to use a radio group without specifying a group. Be sure to wrap it in a <DashboardRadioGroup />",
            ),
        );
    }
    return context!;
}

interface IProps extends IRadioGroupContext {
    children: React.ReactNode;
    type?: "group" | "radiogroup";
}

export function DashboardRadioGroup(props: IProps) {
    const { labelType } = useFormGroup();
    const rootClass = labelType === DashboardLabelType.WIDE ? "input-wrap-right" : "input-wrap";
    const type = props.type || "radiogroup";

    return (
        <RadioGroupContext.Provider value={props}>
            <div className={classNames(rootClass, { inline: props.isInline }, { grid: props.isGrid })} role={type}>
                {props.children}
            </div>
        </RadioGroupContext.Provider>
    );
}

export function DashboardCheckGroup(props: IProps) {
    return <DashboardRadioGroup {...props} type="group" />;
}
