'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b-2 border-black bg-[#f6f1e7]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-between items-center py-3 gap-3">
          <div className="flex flex-wrap items-center gap-3 text-sm uppercase font-bold tracking-wide">
            <span className="whitespace-nowrap">Aiden Brown</span>
            <span aria-hidden="true">|</span>
            <a
              href="https://github.com/AidenBrown21"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:no-underline"
            >
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/aidenbrown21"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:no-underline"
            >
              LinkedIn
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="flex flex-wrap gap-6 text-sm uppercase font-bold tracking-wide">
            <Link href="#about" className="underline underline-offset-4 hover:no-underline">
              About
            </Link>
            <Link href="#projects" className="underline underline-offset-4 hover:no-underline">
              Projects
            </Link>
            <Link href="#contact" className="underline underline-offset-4 hover:no-underline">
              Contact
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-black"
            aria-label="Toggle navigation"
          >
            <svg className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              {isOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t-2 border-black bg-[#f6f1e7]">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 text-sm uppercase font-bold tracking-wide">
            <Link href="#about" className="block px-3 py-2 underline underline-offset-4 hover:no-underline">
              About
            </Link>
            <Link href="#projects" className="block px-3 py-2 underline underline-offset-4 hover:no-underline">
              Projects
            </Link>
            <Link href="#contact" className="block px-3 py-2 underline underline-offset-4 hover:no-underline">
              Contact
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
