export function Avatar({ src, name, size = 44 }: { src?: string; name: string; size?: number }) {
  return src
    ? <img className="avatar" src={src} alt={`${name}'s profile`} style={{ width: size, height: size }} />
    : <span className="avatar avatar-fallback" style={{ width: size, height: size }} aria-label={`${name}'s profile`}>{name.trim().charAt(0).toUpperCase() || 'B'}</span>;
}
