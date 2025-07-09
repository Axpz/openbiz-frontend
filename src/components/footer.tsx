import React from 'react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-5 mt-auto">
      <div className="container mx-auto text-center text-sm">
        <span>版权所有 2022-2026 企天天</span>
        <span className="mx-4">|</span>
        <a
          href="https://hr.58sms.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-slate-200"
        >
          苏ICP备2021017305号-1
        </a>
      </div>
    </footer>
  );
}; 