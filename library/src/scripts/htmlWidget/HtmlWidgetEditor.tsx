/**
 * @author Mihran Abrahamian <mihran.abrahamian@vanillaforums.com>
 * @copyright 2009-2022 Vanilla Forums Inc.
 * @license gpl-2.0-only
 */

import React from "react";

import TextEditor, { TextEditorContextProvider } from "@library/textEditor/TextEditor";
import { t } from "@vanilla/i18n";
import { Tabs } from "@library/sectioning/Tabs";
import { htmlWidgetEditorClasses } from "@library/htmlWidget/HtmlWidgetEditor.classes";

export function HtmlWidgetCodeEditor(props: {
    value: { html?: string; css?: string };
    onChange: (changes: { html?: string; css?: string }) => void;
}) {
    const classes = htmlWidgetEditorClasses();

    const tabData = [
        {
            label: t("HTML"),
            contents: (
                <TextEditor
                    minimal
                    className={classes.editor}
                    language={"html"}
                    value={props.value.html}
                    onChange={(event, html) => {
                        props.onChange({
                            ...props.value,
                            html,
                        });
                    }}
                />
            ),
        },
        {
            label: t("CSS"),
            contents: (
                <TextEditor
                    minimal
                    className={classes.editor}
                    language={"css"}
                    value={props.value.css}
                    onChange={(event, css) => {
                        props.onChange({
                            ...props.value,
                            css,
                        });
                    }}
                />
            ),
        },
    ];

    return (
        <TextEditorContextProvider>
            <Tabs tabsRootClass={classes.tabsRoot} data={tabData} />
        </TextEditorContextProvider>
    );
}
