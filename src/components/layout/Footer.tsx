import { Github, Mail } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-20">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold text-text mb-3">Plainlog</h3>
            <p className="text-sm text-text-light leading-relaxed">
              개발을 기록하고 공유하는 공간입니다. TIL, 회고, 학습 내용을
              정리합니다.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-bold text-text mb-3">바로가기</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/"
                  className="text-sm text-text-light hover:text-primary transition-colors"
                >
                  홈
                </a>
              </li>
              <li>
                <a
                  href="/posts"
                  className="text-sm text-text-light hover:text-primary transition-colors"
                >
                  전체 글
                </a>
              </li>
              <li>
                <a
                  href="/write"
                  className="text-sm text-text-light hover:text-primary transition-colors"
                >
                  글쓰기
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold text-text mb-3">연락처</h3>
            <div className="flex gap-4">
              <a
                href="https://github.com/bbagbbagn2"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-text-light hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a
                href="mailto:pyoungh137@gmail.com"
                className="p-2 text-text-light hover:text-primary transition-colors"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-text-light flex items-center justify-center gap-1">
            © {currentYear} Plainlog. Made with using Next.js & Supabase
          </p>
        </div>
      </div>
    </footer>
  );
}
