import {Antd} from '@kefu/in-uikit';
import React from "react";
import { useTranslation } from "react-i18next";
import { languagesWithName } from "./i18n";
const { Select } = Antd;

export const SwitchLanguage: React.FC = React.memo(() => {
    const { i18n } = useTranslation();
    const onChange = (lang: string) => {
        if (!lang) return;
        i18n.changeLanguage(lang);
    };
    return (
        <Select
            value={i18n.language}
            size="small"
            style={{ width: 100 }}
            onSelect={onChange}
        >
            {languagesWithName.map(({ lang, name }) => (
                <Select.Option key={lang} value={lang}>
                    {name}
                </Select.Option>
            ))}
        </Select>
    );
});
