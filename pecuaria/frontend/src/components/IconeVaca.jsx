// Cabeça de vaca no mesmo estilo dos ícones do lucide-react (que não tem vaca).
// Aceita as mesmas props usadas com os ícones do lucide: size, className, strokeWidth.
export default function IconeVaca({ size = 24, strokeWidth = 2, className = '', ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* chifres */}
      <path d="M8 5C7.5 3.5 6.5 2.5 5 2.5" />
      <path d="M16 5c.5-1.5 1.5-2.5 3-2.5" />
      {/* orelhas */}
      <path d="M6.5 7.5 2.5 7c.5 2 2 3 4 2.5" />
      <path d="m17.5 7.5 4-.5c-.5 2-2 3-4 2.5" />
      {/* cabeça */}
      <path d="M6.5 13V6.5A1.5 1.5 0 0 1 8 5h8a1.5 1.5 0 0 1 1.5 1.5V13" />
      {/* focinho */}
      <rect x="5.5" y="13" width="13" height="8.5" rx="4.25" />
      {/* olhos e narinas */}
      <path d="M9.5 9.5h.01" />
      <path d="M14.5 9.5h.01" />
      <path d="M9.5 17.25h.01" />
      <path d="M14.5 17.25h.01" />
    </svg>
  );
}
