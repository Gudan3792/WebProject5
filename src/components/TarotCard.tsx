import { useEffect, useRef, useState } from 'react';
import type { TarotCard } from '../types/tarot';
type Props = {
    card: TarotCard;
    isFaceUp: boolean;
    onClick?: () => void;
    isDragging?: boolean;
};

const backImage = '/뒷면.png';

export default function TarotCardComponent({ card, isFaceUp, onClick, isDragging }: Props) {
    const [flipped, setFlipped] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const cardOuterRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isFaceUp) {
            const timer = setTimeout(() => setFlipped(true), 100);
            return () => clearTimeout(timer);
        } else {
            setFlipped(false);
        }
    }, [isFaceUp, card.id]);

    // 3D 틸트 효과
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (isDragging) return; // 드래그 중이면 틸트 무시
        const card = cardOuterRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const maxTilt = 18;
        const rotateY = ((x - centerX) / centerX) * maxTilt;
        const rotateX = -((y - centerY) / centerY) * maxTilt;
        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    };

    const handleMouseLeave = () => {
        setIsHovering(false);
        const card = cardOuterRef.current;
        if (card) card.style.transform = 'perspective(800px)';
    };
    const handleMouseEnter = () => setIsHovering(true);

    return (
        <div
            ref={cardOuterRef}
            onClick={isFaceUp ? undefined : onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
            style={{
                pointerEvents: isFaceUp ? 'auto' : 'none',
                width: '13vw',
                aspectRatio: '3/5',
                minWidth: '120px',
                minHeight: '200px',
                maxHeight: '230px',
                maxWidth: '140px',
                //maxHeight: '40vh',
                perspective: '800px',
                cursor: isFaceUp ? 'default' : 'pointer',
                display: 'inline-block',
                transition: isHovering ? 'none' : 'transform 0.18s cubic-bezier(.4,2,.6,1)',
                willChange: 'transform',
                userSelect: 'none',
            }}
        >
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.7s cubic-bezier(0.4,0.2,0.2,1)',
                    transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
            >
                <img
                    src={backImage}
                    alt="card back"
                    style={{
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        backfaceVisibility: 'hidden',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        background: '#222',
                    }}
                />
                <img
                    src={card.image}
                    alt={card.name}
                    style={{
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        backfaceVisibility: 'hidden',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        transform: 'rotateY(180deg)' + (card.isReversed ? ' rotate(180deg)' : ''),
                        background: '#fff',
                    }}
                />
            </div>
        </div>
    );
}
