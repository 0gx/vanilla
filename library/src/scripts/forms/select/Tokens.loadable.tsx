/*
 * @author Stéphane LaFlèche <stephane.l@vanillaforums.com>
 * @copyright 2009-2019 Vanilla Forums Inc.
 * @license GPL-2.0-only
 */

import React, { useRef } from "react";
import { tokensClasses } from "@library/forms/select/tokensStyles";
import { t } from "@library/utility/appUtils";
import { getRequiredID, IOptionalComponentID } from "@library/utility/idUtils";
import Select from "react-select";
import { IComboBoxOption } from "@library/features/search/SearchBar";
import Paragraph from "@library/layout/Paragraph";
import classNames from "classnames";
import * as selectOverrides from "@library/forms/select/overwrites";
import { inputBlockClasses } from "@library/forms/InputBlockStyles";

export interface IGroupOption {
    label: string;
    options: IComboBoxOption[];
}

export interface ITokenProps extends IOptionalComponentID {
    options: IComboBoxOption[] | IGroupOption[] | undefined;
    label?: string | null;
    labelNote?: string;
    disabled?: boolean;
    className?: string;
    placeholder?: string;
    isLoading?: boolean;
    value: IComboBoxOption[];
    onFocus?: () => void;
    onBlur?: React.ComponentProps<typeof Select>["onBlur"];
    onChange: (tokens: IComboBoxOption[]) => void;
    onInputChange?: (value: string) => void;
    menuPlacement?: string; // doesn't look like this is used anywhere?
    showIndicator?: boolean;
    maxHeight?: number;
    hideSelectedOptions?: boolean;
    fieldName?: string; //this one is for legacy form submits, hidden input should have a name so it appears in gdn form values
    inModal?: boolean;
}

interface IState {
    inputValue: string;
    focus: boolean;
}

/**
 * Implements the search bar component
 */
export default class TokensLoadable extends React.Component<ITokenProps, IState> {
    private prefix = "tokens";
    private id: string = getRequiredID(this.props, this.prefix);
    private inputID: string = this.id + "-tokenInput";

    public state: IState = {
        inputValue: "",
        focus: false,
    };

    public render() {
        const { className, disabled, options, isLoading, inModal, hideSelectedOptions = true } = this.props;
        const classes = tokensClasses();
        const classesInputBlock = inputBlockClasses();

        const portalProps = inModal
            ? {
                  styles: this.getStyles(1051), // This magic number from the stacking context
                  menuPortalTarget: document.body,
              }
            : {};

        return (
            <>
                <div
                    className={classNames("tokens", classesInputBlock.root, this.props.className, classes.root, {
                        [classes.withIndicator]: this.props.showIndicator,
                    })}
                >
                    {!!this.props.label && (
                        <label htmlFor={this.inputID} className={classesInputBlock.labelAndDescription}>
                            <span className={classesInputBlock.labelText}>{this.props.label}</span>
                            {!!this.props.labelNote && (
                                <Paragraph className={classesInputBlock.labelNote}>{this.props.labelNote}</Paragraph>
                            )}
                        </label>
                    )}

                    <div
                        className={classNames(classesInputBlock.inputWrap, classes.inputWrap, {
                            hasFocus: this.state.focus,
                        })}
                    >
                        <Select
                            id={this.id}
                            inputId={this.inputID}
                            components={this.componentOverwrites}
                            onChange={this.props.onChange}
                            inputValue={this.state.inputValue}
                            value={this.props.value}
                            onInputChange={this.handleInputChange}
                            isClearable={true}
                            isDisabled={disabled}
                            options={options}
                            isLoading={this.showLoader}
                            classNamePrefix={this.prefix}
                            className={classNames(this.prefix, className)}
                            placeholder={this.props.placeholder}
                            aria-label={t("Search")}
                            escapeClearsValue={true}
                            pageSize={20}
                            theme={this.getTheme}
                            styles={this.getStyles()}
                            backspaceRemovesValue={true}
                            isMulti={true}
                            onFocus={this.onFocus}
                            onBlur={this.onBlur}
                            maxMenuHeight={this.props.maxHeight}
                            hideSelectedOptions={hideSelectedOptions}
                            {...portalProps}
                        />
                    </div>
                    <input
                        className={"js-" + this.prefix + "-tokenInput"}
                        aria-hidden={true}
                        value={JSON.stringify(this.props.value)}
                        type="hidden"
                        tabIndex={-1}
                        name={this.props.fieldName}
                        disabled={disabled}
                    />
                </div>
            </>
        );
    }

    private get showLoader(): boolean {
        return !!this.props.isLoading && this.state.inputValue.length > 0;
    }

    private handleInputChange = (val) => {
        this.setState({ inputValue: val });
        this.props.onInputChange?.(val);
    };

    /*
     * Overwrite components in Select component
     */
    private get componentOverwrites() {
        const overwrites = {
            ClearIndicator: selectOverrides.NullComponent,
            LoadingMessage: selectOverrides.OptionLoader,
            Menu:
                !this.props.options || this.props.options?.length > 0
                    ? selectOverrides.Menu
                    : selectOverrides.NullComponent,
            MenuList: selectOverrides.MenuList,
            Option: selectOverrides.SelectOption,
            ValueContainer: selectOverrides.ValueContainer,
            Control: selectOverrides.Control,
            MultiValueRemove: selectOverrides.MultiValueRemove,
            NoOptionsMessage: this.showLoader
                ? selectOverrides.OptionLoader
                : this.state.inputValue.length > 0
                ? selectOverrides.NoOptionsMessage
                : selectOverrides.NullComponent,
            LoadingIndicator: selectOverrides.NullComponent,
            DropdownIndicator: selectOverrides.DropdownIndicator,
        };

        if (!this.props.showIndicator) {
            overwrites["DropdownIndicator"] = selectOverrides.NullComponent;
        }

        return overwrites;
    }

    /**
     * Overwrite theme in Select component
     */
    private getTheme = (theme) => {
        return {
            ...theme,
            border: {},
            colors: {},
            spacing: {},
        };
    };

    /**
     * Set class for focus
     */
    private onFocus = () => {
        if (this.props.onFocus) {
            this.props.onFocus();
        }
        this.setState({
            focus: true,
        });
    };

    /**
     * Set class for blur
     */
    private onBlur = (event: React.FocusEvent<HTMLElement>) => {
        this.props.onBlur?.(event);
        this.setState({
            focus: false,
        });
    };

    /**
     * Overwrite styles in Select component
     */
    private getStyles = (zIndex?: number) => {
        return {
            option: (provided: React.CSSProperties) => ({
                ...provided,
            }),
            menu: (provided: React.CSSProperties, state) => {
                return { ...provided, backgroundColor: undefined, boxShadow: undefined };
            },
            control: (provided: React.CSSProperties) => ({
                ...provided,
                borderWidth: 0,
            }),
            multiValue: (provided: React.CSSProperties, state) => {
                return {
                    ...provided,
                    borderRadius: undefined,
                    opacity: state.isFocused ? 1 : 0.85,
                };
            },
            multiValueLabel: (provided: React.CSSProperties) => {
                return { ...provided, borderRadius: undefined, padding: 0 };
            },
            ...(zIndex && { menuPortal: (base) => ({ ...base, zIndex: zIndex + 1 }) }),
        };
    };
}
