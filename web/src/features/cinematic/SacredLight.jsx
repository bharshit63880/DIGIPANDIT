export function SacredLight({ phase = "awaken", progress = 0, className = "" }) {
  return (
    <div className={`sacred-light sacred-light--${phase} ${className}`} style={{ "--light-progress": progress }} aria-hidden="true">
      <span className="sacred-light__halo" />
      <span className="sacred-light__core" />
      <span className="sacred-light__trail" />
    </div>
  );
}
