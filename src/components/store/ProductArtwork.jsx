import { useId } from 'react';

export default function ProductArtwork({ product, className = '' }) {
  const id = useId().replaceAll(':', '');
  const isJar = product.kind === 'jar';
  const isBox = product.kind === 'box';
  const isTube = product.kind === 'tube';
  return (
    <div className={`overflow-hidden ${className}`} style={{ background: product.background }}>
      <svg viewBox="0 0 360 245" role="img" aria-label={`${product.title} illustrative packaging`} className="h-full w-full">
        <defs>
          <linearGradient id={`${id}-body`} x1="0" x2="1"><stop stopColor="#E4E8E4" /><stop offset=".28" stopColor="#FFF" /><stop offset=".75" stopColor="#FAFCFA" /><stop offset="1" stopColor="#DBE2DC" /></linearGradient>
          <radialGradient id={`${id}-shadow`}><stop stopColor="#173B2C" stopOpacity=".15" /><stop offset="1" stopColor="#173B2C" stopOpacity="0" /></radialGradient>
        </defs>
        <circle cx="180" cy="118" r="88" fill="white" fillOpacity=".45" />
        <ellipse cx="180" cy="215" rx="90" ry="13" fill={`url(#${id}-shadow)`} />
        <g transform={isBox ? 'rotate(-7 180 130)' : 'rotate(5 180 130)'}>
          {isBox ? <><path d="M130 41h94l12 13v150H130Z" fill={`url(#${id}-body)`} /><path d="m224 41 12 13v150l-12-9Z" fill="#D6DEEA" /><rect x="130" y="60" width="94" height="14" fill={product.color} /></>
            : isJar ? <><rect x="124" y="112" width="112" height="88" rx="17" fill={product.color} /><rect x="121" y="99" width="118" height="23" rx="7" fill="#3C3E35" /><rect x="126" y="105" width="108" height="2" fill="#858574" /></>
              : isTube ? <><path d="M141 52h78l-8 142h-62Z" fill={`url(#${id}-body)`} /><rect x="149" y="194" width="62" height="15" rx="4" fill={product.color} /><path d="M143 60h74" stroke="#CDD4CD" /></>
                : <><rect x="140" y="77" width="80" height="130" rx="16" fill={`url(#${id}-body)`} />{product.kind === 'bottle' ? <rect x="142" y="57" width="76" height="28" rx="7" fill={product.color} /> : <><rect x="155" y="53" width="50" height="32" rx="5" fill={product.color} /><rect x="171" y="35" width="18" height="22" rx="3" fill={product.color} /><rect x="167" y="30" width="54" height="10" rx="4" fill={product.color} /></>}</>}
          <rect x={isJar ? 132 : isBox ? 135 : 145} y={isJar ? 132 : 101} width={isJar ? 96 : isBox ? 84 : 70} height={isJar ? 53 : 80} rx="2" fill={isJar ? '#F6F1E7' : product.color} />
          <text x="180" y={isJar ? 147 : 119} textAnchor="middle" fill={isJar ? product.color : '#FFF'} fontSize="12" fontFamily="system-ui" fontWeight="700">nayacura</text>
          <path d={isJar ? 'M168 153h24' : 'M168 128h24'} stroke={isJar ? product.color : '#FFF'} strokeOpacity=".5" />
          <text x="180" y={isJar ? 167 : 147} textAnchor="middle" fill={isJar ? product.color : '#FFF'} fontSize="6.2" fontFamily="system-ui" fontWeight="600" letterSpacing=".8">{product.label}</text>
          {!isJar && <text x="180" y="165" textAnchor="middle" fill="#FFF" fillOpacity=".85" fontSize="5.5" fontFamily="system-ui">PRIVATE WELLNESS</text>}
        </g>
        <text x="180" y="236" textAnchor="middle" fill={product.color} fillOpacity=".55" fontSize="8" fontFamily="system-ui">Illustrative packaging</text>
      </svg>
    </div>
  );
}
