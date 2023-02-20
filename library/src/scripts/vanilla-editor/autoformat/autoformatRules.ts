import {
    autoformatArrow,
    autoformatLegal,
    autoformatLegalHtml,
    autoformatPunctuation,
    autoformatSmartQuotes,
} from "@udecode/plate-headless";
import { MyAutoformatRule } from "../typescript";
import { autoformatBlocks } from "./autoformatBlocks";
import { autoformatLists } from "./autoformatLists";
import { autoformatMarks } from "./autoformatMarks";

export const autoformatRules = [
    ...autoformatBlocks,
    ...autoformatLists,
    ...autoformatMarks,
    ...(autoformatSmartQuotes as MyAutoformatRule[]),
    ...(autoformatPunctuation as MyAutoformatRule[]),
    ...(autoformatLegal as MyAutoformatRule[]),
    ...(autoformatLegalHtml as MyAutoformatRule[]),
    ...(autoformatArrow as MyAutoformatRule[]),
];
