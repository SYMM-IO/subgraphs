import { useEffect, useState } from "react";

type ChainLogoProps = {
  chain: string;
  network: string;
  logoUrl?: string | null;
};

const BASE_LOGO_URL = "https://icons.llamao.fi/icons/chains/rsz_base?w=48&h=48";

function isBaseLike(chain: string, network: string) {
  const value = `${chain} ${network}`.toLowerCase();
  return value.includes("base");
}

function isPlasmaLike(chain: string, network: string) {
  const value = `${chain} ${network}`.toLowerCase();
  return value.includes("plasma");
}

export function ChainLogo({ chain, network, logoUrl }: ChainLogoProps) {
  const baseLike = isBaseLike(chain, network);
  const effectiveLogoUrl = logoUrl ?? (baseLike ? BASE_LOGO_URL : null);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [effectiveLogoUrl]);

  if (isPlasmaLike(chain, network)) {
    return (
      <div className="chain-logo chain-logo-plasma" aria-hidden="true">
        <svg viewBox="0 0 32 32">
          <rect className="plasma-bg" x="2" y="2" width="28" height="28" rx="14" />
          <path className="plasma-mark plasma-mark-main" d="M10.3 20.7c3.7 0 5.6-2.5 5.6-5.6v-3.8" />
          <path className="plasma-mark plasma-mark-main" d="M15.9 11.3h4.4c2.8 0 4.8 1.9 4.8 4.4s-2 4.4-4.8 4.4h-4.4" />
          <path className="plasma-mark plasma-mark-accent" d="M10.4 11.3h5.5" />
          <path className="plasma-mark plasma-mark-accent" d="M10.4 15.9h5.5" />
        </svg>
      </div>
    );
  }

  if (effectiveLogoUrl && !imageFailed) {
    return <img src={effectiveLogoUrl} alt="" className={`chain-logo${baseLike ? " chain-logo-base-img" : ""}`} onError={() => setImageFailed(true)} />;
  }

  if (baseLike) {
    return <div className="chain-logo chain-logo-base-fallback" aria-hidden="true">b</div>;
  }

  return <div className="chain-logo fallback" aria-hidden="true">{chain.slice(0, 2).toUpperCase()}</div>;
}
