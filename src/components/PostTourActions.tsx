import { Link } from "react-router-dom";
import { RoiPaybackCta } from "./RoiPaybackCta";
import { getContactUrl } from "../lib/contactLink";

type Sibling = { label: string; href: string };

type Props = {
  /** sample = 文書デモ側 / ai = ナレッジAI側 */
  variant: "sample" | "ai";
  packId: string;
  complete: boolean;
  afterTourNote?: string;
  siblingDemos?: Sibling[];
};

export function PostTourActions({
  variant,
  packId,
  complete,
  afterTourNote,
  siblingDemos,
}: Props) {
  const contactHref = getContactUrl();

  return (
    <div className="mt-3 space-y-2 rounded-md border border-navy/20 bg-surface/80 px-3 py-3">
      <p className="text-sm font-semibold text-navy">
        {complete ? "ガイド完了 · 次の一歩" : "ほかの体験・次の一歩"}
      </p>
      {afterTourNote && (
        <p className="text-sm leading-relaxed text-ink">{afterTourNote}</p>
      )}
      <div className="flex flex-wrap gap-2 pt-1">
        {variant === "sample" ? (
          <Link
            to={`/ai?pack=${encodeURIComponent(packId)}`}
            className="inline-flex items-center rounded-md bg-navy px-3 py-2 text-xs font-semibold text-white hover:bg-navy-soft"
          >
            同じテーマをAIで試す
          </Link>
        ) : (
          <Link
            to={`/?pack=${encodeURIComponent(packId)}`}
            className="inline-flex items-center rounded-md border border-line bg-white px-3 py-2 text-xs font-semibold text-navy hover:border-navy/40"
          >
            文書サンプルに戻る
          </Link>
        )}
        {siblingDemos?.map((sib) => (
          <Link
            key={sib.href + sib.label}
            to={sib.href}
            className="inline-flex items-center rounded-md border border-line bg-white px-3 py-2 text-xs font-semibold text-navy hover:border-navy/40"
          >
            {sib.label}
          </Link>
        ))}
        {contactHref && (
          <a
            href={contactHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-md border border-navy/30 bg-white px-3 py-2 text-xs font-semibold text-navy hover:border-navy/50"
          >
            導入を相談する
          </a>
        )}
      </div>
      <RoiPaybackCta />
    </div>
  );
}
