import './AuroScroll.css';
import { useEffect, useRef, useState } from 'react';
import TarotCardComponent from '../components/TarotCard';
import type { TarotCard } from '../types/tarot';

interface InfiniteAutoScrollCardListProps {
    cards: TarotCard[];
    onCardClick?: (card: TarotCard, idx: number) => void;
    cardRefs?: (HTMLDivElement | null)[];
}

export function InfiniteAutoScrollCardList({ cards, onCardClick, cardRefs }: InfiniteAutoScrollCardListProps) {
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = useRef(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const directionRef = useRef(1);
    const dragTimeout = useRef<number | null>(null);

    const repeatedCards = [...cards, ...cards];
    const CARD_WIDTH = 104 + 24;

    useEffect(() => {
        const container = scrollRef.current;
        if (container) {
            container.scrollLeft = CARD_WIDTH * cards.length;
        }
    }, [cards.length, CARD_WIDTH]);

    // 자동 스크롤
    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;
        let animationFrameId: number;
        const totalWidth = CARD_WIDTH * repeatedCards.length;
        const step = () => {
            if (!container) return;
            let nextScroll = container.scrollLeft + directionRef.current * 1;
            if (nextScroll <= 0) {
                nextScroll = totalWidth / 2;
            } else if (nextScroll >= totalWidth) {
                nextScroll = totalWidth / 2;
            }
            container.scrollLeft = nextScroll;
            animationFrameId = requestAnimationFrame(step);
        };
        animationFrameId = requestAnimationFrame(step);
        return () => cancelAnimationFrame(animationFrameId);
    }, [cards.length, CARD_WIDTH]);

    // 무한 스크롤 유지
    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;
        const totalWidth = CARD_WIDTH * repeatedCards.length;
        const handleScroll = () => {
            if (container.scrollLeft <= 0) {
                container.scrollLeft = totalWidth / 2;
            } else if (container.scrollLeft >= totalWidth) {
                container.scrollLeft = totalWidth / 2;
            }
        };
        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [cards.length, CARD_WIDTH]);

    // 드래그 상태 관리 (isDragging: 클릭 차단, dragRef: 실제 드래그 감지)
    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;
        let dragging = false;
        let startX = 0;
        let scrollStart = 0;

        const onMouseDown = (e: MouseEvent) => {
            dragging = true;
            dragRef.current = false;
            setIsDragging(false);
            container.classList.add('dragging');
            startX = e.pageX;
            scrollStart = container.scrollLeft;
        };

        const onMouseMove = (e: MouseEvent) => {
            if (!dragging) return;
            const dx = e.pageX - startX;
            if (Math.abs(dx) > 5) {
                dragRef.current = true; // 드래그 감지
                setIsDragging(true); // 렌더링용
            }
            container.scrollLeft = scrollStart - dx;
        };

        const onMouseUp = () => {
            dragging = false;
            container.classList.remove('dragging');
            if (dragRef.current) {
                // 드래그 후 100ms간 클릭 차단
                setIsDragging(true);
                if (dragTimeout.current) clearTimeout(dragTimeout.current);
                dragTimeout.current = window.setTimeout(() => setIsDragging(false), 120);
            } else {
                setIsDragging(false);
            }
        };

        container.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);

        return () => {
            container.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            if (dragTimeout.current) clearTimeout(dragTimeout.current);
        };
    }, []);

    return (
        <div
            ref={scrollRef}
            style={{
                alignItems: 'center',
                display: 'flex',
                overflowX: 'auto',
                whiteSpace: 'nowrap',
                width: '100%',
                height: '35vh',
                //minHeight: '385px',
                scrollbarWidth: 'none',
                gap: '24px',
                willChange: 'transform',
                userSelect: 'none',
            }}
            className="auto-scroll-list"
        >
            {repeatedCards.map((card, idx) => (
                <div
                    key={idx}
                    ref={(el) => {
                        if (cardRefs) cardRefs[idx % cards.length] = el;
                    }}
                    style={{
                        display: 'inline-block',
                        pointerEvents: isDragging ? 'none' : 'auto',
                    }}
                    onClick={() => {
                        if (isDragging) return;
                        onCardClick?.(card, idx % cards.length);
                    }}
                >
                    <TarotCardComponent key={idx} card={card} isFaceUp={false} isDragging={isDragging} />
                </div>
            ))}
        </div>
    );
}
