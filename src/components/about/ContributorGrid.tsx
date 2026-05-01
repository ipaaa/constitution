import { Github } from "lucide-react";
import type { Contributor } from "@/data/contributors";

function ContributorCard({ contributor }: { contributor: Contributor }) {
  return (
    <div className="bg-white border border-gray-200 rounded-sm p-4 shadow-sm flex items-center gap-4">
      {contributor.avatar ? (
        <img
          src={contributor.avatar}
          alt={`${contributor.name} 的頭像`}
          className="w-12 h-12 rounded-full object-cover shrink-0"
        />
      ) : (
        <div
          className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          <span className="text-gray-500 font-bold text-lg">
            {contributor.name.charAt(0)}
          </span>
        </div>
      )}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900 truncate">
            {contributor.name}
          </span>
          {contributor.github && (
            <a
              href={`https://github.com/${contributor.github}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${contributor.name} 的 GitHub（開啟新分頁）`}
              className="text-gray-400 hover:text-gray-700 transition-colors shrink-0"
            >
              <Github size={14} />
            </a>
          )}
        </div>
        <p className="text-sm text-gray-500">{contributor.role}</p>
      </div>
    </div>
  );
}

export default function ContributorGrid({
  contributors,
}: {
  contributors: Contributor[];
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {contributors.map((contributor, index) => (
        <ContributorCard key={index} contributor={contributor} />
      ))}
    </div>
  );
}
