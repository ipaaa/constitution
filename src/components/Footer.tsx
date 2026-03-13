export default function Footer() {
  return (
    <footer className="py-16 text-center border-t border-black/5 text-gray-500 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <p>© {new Date().getFullYear()} Add C0urt / g0v</p>
        <p className="mt-2">
          HackMD Collaborative Doc:{' '}
          <a
            href="https://g0v.hackmd.io/njOKlAIVQcmCgomNMr9cUg?view"
            target="_blank"
            rel="noopener noreferrer"
            className="text-midnight underline font-semibold hover:text-solar transition-colors"
          >
            https://g0v.hackmd.io/njOKlAIVQcmCgomNMr9cUg
          </a>
        </p>
      </div>
    </footer>
  );
}
