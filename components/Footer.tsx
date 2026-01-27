export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 border-t-2 border-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-bold uppercase tracking-wide">
          <p>
            © {currentYear} Aiden Brown. All rights reserved.
          </p>

          <div className="flex gap-6">
            <a
              href="https://github.com/aidenbrown21"
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
            <a
              href="mailto:brow2423@purdue.edu"
              className="underline underline-offset-4 hover:no-underline"
            >
              Email
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
