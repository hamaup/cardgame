// src/components/Header.tsx
import React from 'react';
import LanguageSelector from './LanguageSelector';
import Link from 'next/link';

const Header: React.FC = () => {
  return (
    <header className="header">
      <nav className="navigation">
        <h1 className="header-title">
          <Link href="/">GO! GO! Card Game!</Link>
        </h1>
        <div className="header-language-selector">
          <LanguageSelector />
        </div>
      </nav>
    </header>
  );
};

export default Header;
