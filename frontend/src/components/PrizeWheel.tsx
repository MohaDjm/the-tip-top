'use client';

import React, { useState } from 'react';

interface Prize {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

interface PrizeWheelProps {
  targetPrize: string;
  onComplete?: (prize: string) => void;
  onClose?: () => void;
}

const prizes: Prize[] = [
  { name: 'Infuseur à thé', value: 8, color: '#2C5545', percentage: 60 }, // Vert principal du site
  { name: 'Boîte de 100g thé détox ou infusion', value: 12, color: '#8FBC8F', percentage: 20 }, // Vert clair
  { name: 'Boîte de 100g thé signature', value: 18, color: '#F5F1E6', percentage: 10 }, // Beige du site
  { name: 'Coffret découverte 39€', value: 39, color: '#D4B254', percentage: 6 }, // Or du site
  { name: 'Coffret découverte 69€', value: 69, color: '#FFD700', percentage: 4 } // Or premium
];

export default function PrizeWheel({ targetPrize, onComplete, onClose }: PrizeWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [readyToSpin, setReadyToSpin] = useState(true);
  const [hasSpun, setHasSpun] = useState(false);

  // Auto-start animation when component mounts with targetPrize
  React.useEffect(() => {
    if (!targetPrize || !readyToSpin || hasSpun) return;
    
    console.log('🚀 Auto-starting wheel animation for:', targetPrize);
    
    setReadyToSpin(false);
    setHasSpun(true);
    setShowResult(false);
    
    const targetIndex = prizes.findIndex(p => p.name === targetPrize);
    if (targetIndex === -1) {
      console.warn(`Prize "${targetPrize}" not found in prizes array`);
      return;
    }
    
    const segmentAngle = 360 / prizes.length;
    const centerAngle = segmentAngle * targetIndex + segmentAngle / 2;
    const fullRotations = 5;
    const totalRotation = fullRotations * 360 - centerAngle;
    
    console.log('🔄 Final rotation calculated:', totalRotation);
    
    const timer = setTimeout(() => {
      setIsSpinning(true);
      setRotation(totalRotation);
      
      // Show result after animation completes
      const resultTimer = setTimeout(() => {
        console.log('✅ Animation complete, showing result');
        setIsSpinning(false);
        setShowResult(true);
        onComplete?.(targetPrize);
      }, 4000);
      
      return () => clearTimeout(resultTimer);
    }, 500);

    return () => clearTimeout(timer);
  }, [targetPrize]); // Removed dependencies that cause re-runs

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  const handleClose = () => {
    onClose?.();
  };

  const handleClaimPrize = () => {
    onClose?.();
  };

  // Calculate segment angles (360° / 5 segments = 72° each)
  const segmentAngle = 360 / prizes.length;

  // Calculate target angle based on targetPrize
  const getTargetAngle = () => {
    const targetIndex = prizes.findIndex(p => p.name === targetPrize);
    if (targetIndex === -1) {
      console.warn(`Prize "${targetPrize}" not found in prizes array`);
      console.log('Available prizes:', prizes.map(p => p.name));
      return 0;
    }
    
    console.log(`Target prize: "${targetPrize}" found at index ${targetIndex}`);
    
    // Calculate exact angle for the wheel
    const segmentAngle = 360 / prizes.length;
    const centerAngle = segmentAngle * targetIndex + segmentAngle / 2;
    
    // Add full rotations for dramatic effect
    const fullRotations = 5;
    
    // Rotation négative pour aligner la flèche sur le segment correct
    const totalRotation = fullRotations * 360 - centerAngle;
    
    console.log(`Segment angle: ${segmentAngle}°, Center angle: ${centerAngle}°, Total rotation: ${totalRotation}°`);
    
    return totalRotation;
  };

  const handleWheelClick = () => {
    if (!readyToSpin || hasSpun || !targetPrize) return;
    
    console.log('🎯 Starting wheel animation for prize:', targetPrize);
    
    setReadyToSpin(false);
    setHasSpun(true);
    setShowResult(false);
    
    const finalRotation = getTargetAngle();
    console.log('🔄 Final rotation calculated:', finalRotation);
    
    setIsSpinning(true);
    setRotation(finalRotation);
    
    // Show result after animation completes
    setTimeout(() => {
      console.log('✅ Animation complete, showing result');
      setIsSpinning(false);
      setShowResult(true);
      onComplete?.(targetPrize);
    }, 4000);
  };

  const targetPrizeData = prizes.find(prize => prize.name === targetPrize);

  if (!targetPrize) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="text-yellow-600 text-xl mb-2">⚠️</div>
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Aucun gain spécifié</h3>
          <p className="text-yellow-600">Veuillez d&apos;abord vérifier votre code</p>
        </div>
      </div>
    );
  }


  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-2xl p-10 max-w-2xl w-full mx-4 text-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="font-['Playfair_Display'] text-3xl font-bold text-[#2C5545] mb-4">
          🎉 Découvrez votre gain !
        </h2>
        
        {/* Instructions */}
        {readyToSpin && !hasSpun && (
          <p className="text-[#2C5545] font-['Lato'] text-lg mb-4 animate-pulse">
            👆 Cliquez sur la roue pour la faire tourner !
          </p>
        )}
        
        {hasSpun && !showResult && (
          <p className="text-[#2C5545] font-['Lato'] text-lg mb-4">
            🎰 La roue tourne...
          </p>
        )}
        
        {/* Wheel Container */}
        <div className="relative w-96 h-96 mx-auto mb-8">
          {/* Arrow Pointer - Top pointing down */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 translate-y-2 z-20">
            <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[18px] border-l-transparent border-r-transparent border-t-[#D4B254] filter drop-shadow-lg"></div>
          </div>
          
          {/* Wheel */}
          <div 
            className={`w-full h-full rounded-full relative overflow-hidden border-4 border-[#2C5545] ${
              readyToSpin && !hasSpun ? 'cursor-pointer hover:shadow-lg' : 'cursor-default'
            } ${isSpinning ? 'animate-pulse' : ''}`}
            onClick={handleWheelClick}
            style={{ 
              transform: `rotate(${rotation}deg)`,
              transition: hasSpun ? 'transform 4000ms cubic-bezier(0.23, 1, 0.32, 1)' : 'none',
              background: `conic-gradient(
                ${prizes.map((prize, index) => {
                  const startAngle = (index * segmentAngle);
                  const endAngle = ((index + 1) * segmentAngle);
                  return `${prize.color} ${startAngle}deg ${endAngle}deg`;
                }).join(', ')}
              )`
            }}
          >
            {/* Prize Labels */}
            {prizes.map((prize, index) => {
              const angle = (index * segmentAngle) + (segmentAngle / 2);
              const radian = (angle * Math.PI) / 180;
              const radius = 120;
              const x = Math.cos(radian - Math.PI / 2) * radius;
              const y = Math.sin(radian - Math.PI / 2) * radius;
              
              // Use black text for light backgrounds, white for dark
              const textColor = prize.color === '#F5F1E6' ? 'text-black' : 'text-white';
              
              return (
                <div
                  key={index}
                  className={`absolute ${textColor} font-['Lato'] font-bold text-sm transform -translate-x-1/2 -translate-y-1/2 text-center drop-shadow-lg`}
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                    width: '80px'
                  }}
                >
                  <div style={{ transform: `rotate(-${angle}deg)` }}>
                    <div className="text-xs leading-tight">
                      {prize.name}
                    </div>
                    <div className="text-xs opacity-90">
                      {prize.value}€
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Result Display */}
        {showResult && targetPrizeData && (
          <div 
            className="animate-bounce"
            style={{
              animationIterationCount: '3',
              animationDuration: '0.6s',
              animationDelay: '0.2s',
              animationFillMode: 'forwards'
            }}
            onAnimationEnd={(e) => {
              // Reset to normal position after bounce animation
              if (e.animationName === 'bounce') {
                (e.target as HTMLElement).style.animation = 'none';
                (e.target as HTMLElement).style.transform = 'none';
              }
            }}
          >
            <div 
              className="text-white p-6 rounded-xl mb-6"
              style={{
                background: `linear-gradient(135deg, ${targetPrizeData.color}, ${targetPrizeData.color}dd)`
              }}
            >
              <h3 className="font-['Playfair_Display'] text-2xl font-bold mb-3">
                🎊 Félicitations !
              </h3>
              <p className="font-['Lato'] text-xl mb-2">
                Vous avez gagné :
              </p>
              <p className="font-['Playfair_Display'] text-3xl font-bold mb-2">
                {targetPrizeData.name}
              </p>
              <p className="font-['Lato'] text-lg opacity-90">
                Valeur : {targetPrizeData.value}€
              </p>
            </div>
            <div className="bg-[#F5F1E6] p-4 rounded-lg mb-4">
              <p className="text-sm text-[#2C5545] font-['Lato'] font-medium">
                📍 Présentez-vous en boutique avec votre QR code pour récupérer votre lot !
              </p>
            </div>
            <button
              onClick={handleClaimPrize}
              className="bg-[#2C5545] hover:bg-[#1e3d32] text-white font-['Lato'] font-bold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Fermer
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
