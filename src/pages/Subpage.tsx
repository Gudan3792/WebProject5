import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import TarotCardComponent from '../components/TarotCard';
import { tarotCards } from '../components/data/TarotCards';
import type { TarotCard } from '../types/tarot';
import { shuffleArray } from '../utils/shuffle';
import { InfiniteAutoScrollCardList } from '../components/AutoScroll';
import './Mainpage.css';
import './Subpage.css';
import '../components/button_theme.css';
import { motion } from 'framer-motion';

export default function SubPage() {
    const [shuffledCards, setShuffledCards] = useState<TarotCard[]>([]);
    const [selectedCards, setSelectedCards] = useState<TarotCard[]>([]);
    const location = useLocation();
    const navigate = useNavigate();
    const { maxCards, selectedTheme, ageRange, gender } = location.state || {};
    const [showScroll, setShowScroll] = useState(false);
    const [showResultButton, setShowResultButton] = useState(false);

    const isReady = selectedCards.length === maxCards && !!selectedTheme;
    const isMobile = window.innerWidth <= 700;
    const cardsToShow = isMobile ? [...selectedCards].reverse() : selectedCards;

    useEffect(() => {
        if (isReady) {
            const t = setTimeout(() => setShowResultButton(true), 1000);
            return () => clearTimeout(t);
        } else {
            setShowResultButton(false);
        }
    }, [isReady]);

    useEffect(() => {
        // 200ms 후 페이드인 (자연스러운 효과)
        const t = setTimeout(() => setShowScroll(true), 200);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if (!maxCards || !selectedTheme) {
            navigate('/');
        }
    }, [maxCards, selectedTheme, navigate]);

    useEffect(() => {
        setShuffledCards(shuffleArray(tarotCards));
    }, []);
    useEffect(() => {
        setSelectedCards([]);
    }, [maxCards]);

    const handleCardSelect = (card: TarotCard) => {
        if (!maxCards || !selectedTheme) return;
        if (selectedCards.length >= maxCards) return;
        if (selectedCards.find((c) => c.id === card.id)) return;
        setSelectedCards((prev) => [...prev, { ...card, isReversed: Math.random() < 0.35 }]);
        setShuffledCards((prev) => prev.filter((c) => c.id !== card.id));
    };

    const handleGetResult = () => {
        navigate('/result', {
            state: {
                selectedCards,
                selectedTheme,
                ageRange,
                gender,
            },
        });
    };

    return (
        <div>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: showScroll ? 1 : 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{ paddingTop: '20px' }}
            >
                {showScroll && <InfiniteAutoScrollCardList cards={shuffledCards} onCardClick={handleCardSelect} />}
            </motion.div>

            <div className="selected-cards-section">
                <h2 className="selected-cards-title">당신의 운명을 확인할 카드</h2>
                <div className="selected-cards-desc">
                    상단의 카드는 지금 당신을 위한 특별한 메시지를 담고 있습니다.
                    <br />한 장 한 장, 천천히 마음을 담아 선택하세요.
                </div>
            </div>
            <div className="selected-cards-list-wrapper">
                <div className="selected-cards-list">
                    {cardsToShow.map((card) => (
                        <motion.div
                            key={card.id}
                            initial={{ opacity: 0, y: 30, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                        >
                            <TarotCardComponent card={card} isFaceUp={true} />
                        </motion.div>
                    ))}
                </div>
            </div>

            {showResultButton && (
                <>
                    <div className="gemini_overlay" />
                    <div className="gemini_center_wrapper">
                        <button className="gemini_floating_button" onClick={handleGetResult}>
                            타로 결과 해석 받기
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
