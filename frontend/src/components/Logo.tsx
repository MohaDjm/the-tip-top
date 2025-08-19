interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export default function Logo({ className = "", width = 120, height = 80 }: LogoProps) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Tea Leaf SVG */}
      <svg 
        width={width * 0.4} 
        height={height * 0.5} 
        viewBox="0 0 100 120" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="mb-1"
      >
        {/* Main leaf shape */}
        <path
          d="M20 60 C20 30, 40 10, 70 20 C80 25, 85 35, 80 50 C75 65, 65 75, 50 80 C35 85, 20 75, 20 60 Z"
          fill="#2C5545"
        />
        {/* Inner leaf detail */}
        <path
          d="M35 50 C35 35, 45 25, 60 30 C65 32, 68 38, 65 45 C62 52, 58 58, 50 60 C42 62, 35 58, 35 50 Z"
          fill="#F5F1E6"
        />
        {/* Curved steam/leaf accent */}
        <path
          d="M25 45 C15 35, 15 25, 25 20 C30 18, 35 20, 35 25 C35 30, 32 35, 28 38 C26 40, 25 42, 25 45 Z"
          fill="#2C5545"
        />
      </svg>
      
      {/* Text Logo */}
      <div className="text-center">
        <div className="font-['Playfair_Display'] text-[#D4B254] font-bold leading-tight">
          <div className="text-lg tracking-wider">THÉ</div>
          <div className="text-lg tracking-wider -mt-1">TIP TOP</div>
        </div>
      </div>
    </div>
  );
}
