"use client";

import React from "react";
import { Button, Dropdown, MenuProps, Space } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useLanguage } from "@/hooks/language/use-language";
import { isSupportedLanguage, LANGUAGE_OPTIONS } from "@/i18n/config";

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const currentLang =
    LANGUAGE_OPTIONS.find((option) => option.code === language) ??
    LANGUAGE_OPTIONS[0];

  const items: MenuProps["items"] = LANGUAGE_OPTIONS.map((lang) => ({
    key: lang.code,
    label: (
      <div className="flex items-center gap-2">
        <span className={language === lang.code ? "font-semibold" : ""}>
          {lang.label}
        </span>
      </div>
    ),
  }));

  const onClick: MenuProps["onClick"] = ({ key }) => {
    const nextLanguage = String(key);
    if (isSupportedLanguage(nextLanguage)) {
      setLanguage(nextLanguage);
    }
  };

  return (
    <Dropdown menu={{ items, onClick }} placement="bottomRight" trigger={["click"]}>
      <Button>
        <Space>
          <span>{currentLang.label}</span>
          <DownOutlined />
        </Space>
      </Button>
    </Dropdown>
  );
};

export default LanguageSwitcher;
