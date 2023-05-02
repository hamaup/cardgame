import React from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

const LanguageSelector: React.FC = () => {
  const router = useRouter();
  const { i18n } = useTranslation();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = event.target.value;
    i18n.changeLanguage(lang);
    const newPath = router.asPath.replace(
      new RegExp(`/${router.locale}/`, "i"),
      `/${lang}/`
    );
    router.push(newPath, newPath, { locale: lang });
  };

  return (
    <select value={router.locale} onChange={handleChange}>
      {router.locales?.map((locale) => (
        <option key={locale} value={locale}>
          {locale}
        </option>
      ))}
    </select>
  );
};

export default LanguageSelector;
