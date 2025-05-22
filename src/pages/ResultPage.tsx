import { useLocation, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import TarotCardComponent from '../components/TarotCard';
import { TypingText } from '../components/textTyping';
import { getTarotResult } from '../utils/gemini';
import Modal from '../components/modal';
import type { TarotCard } from '../types/tarot';
import './ResultPage.css';

// 카드별 설명 파싱 (--- 구분)
function parseCardDescriptions(result: string, selectedCards: TarotCard[]) {
    let cardBlocks = result
        .split('---')
        .map((block) => block.trim())
        .filter(Boolean);

    // 마지막 블록에 종합 해석/조언/주의가 포함되어 있으면 잘라냄
    cardBlocks = cardBlocks.map((block, idx) => {
        if (idx === cardBlocks.length - 1) {
            // 마지막 블록에서 종합 해석/조언/주의 이하를 제거
            return block.split(/##\s*종합 해석|##\s*조언|##\s*주의/)[0].trim();
        }
        return block;
    });

    return selectedCards.map((card) => {
        const found = cardBlocks.find(
            (block) =>
                block.includes(`카드명: ${card.name}`) &&
                block.includes(`방향: ${card.isReversed ? '역방향' : '정방향'}`)
        );
        if (!found) {
            return {
                title: card.name,
                direction: card.isReversed ? '역방향' : '정방향',
                summary: '',
                meaning: '',
                interpretation: '',
                desc: '카드 해설을 찾을 수 없습니다.',
            };
        }
        const summary = found.match(/한줄요약:\s*(.*)/)?.[1] || '';
        const meaning = found.match(/일반의미:\s*(.*)/)?.[1] || '';
        const interpretation = found.match(/해석:\s*([\s\S]*)/)?.[1]?.trim() || '';
        return {
            title: card.name,
            direction: card.isReversed ? '역방향' : '정방향',
            summary,
            meaning,
            interpretation,
            desc: `${summary}\n\n${meaning}\n\n${interpretation}`,
        };
    });
}

// 종합 해석/조언/주의 파싱
function extractSummary(result: string) {
    const summary = result.match(/## 종합 해석\s*([\s\S]*?)(?=## 조언|$)/)?.[1]?.trim() || '';
    const advice = result.match(/## 조언\s*([\s\S]*?)(?=## 주의|$)/)?.[1]?.trim() || '';
    const caution = result.match(/## 주의\s*([\s\S]*?)(?=주의:|$)/)?.[1]?.trim() || '';
    return { summary, advice, caution };
}

export default function ResultPage() {
    const location = useLocation();
    const { selectedCards, selectedTheme, ageRange, gender } = location.state || {};
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalCardIdx, setModalCardIdx] = useState<number | null>(null);
    const [guideVisible, setGuideVisible] = useState(true);
    const [cardDescs, setCardDescs] = useState<any[]>([]);
    const [summary, setSummary] = useState<{ summary: string; advice: string; caution: string }>({
        summary: '',
        advice: '',
        caution: '',
    });

    useEffect(() => {
        if (!selectedCards || !selectedTheme) return;
        // 위의 프롬포트로 Gemini에 요청
        const prompt = `아래의 타로카드 결과를 해석해줘.

카드별 해설은 아래와 같은 형식으로 출력해줘.
각 카드 해설은 반드시 --- 구분선을 사이에 두고 출력해.

예시:
---
카드명: Two of Pentacles
방향: 정방향
한줄요약: 변화에 적응하며 균형을 잡으려 노력하는 과거
일반의미: 여러 가지 책임을 저글링하며, 변화에 적응하고, 균형을 유지하려는 노력.
해석: 과거에 당신은 여러 가지 일들을 동시에 처리하며 균형을 맞추려고 애썼던 것으로 보입니다. ...
---
카드명: Queen of Wands
방향: 정방향
한줄요약: 열정적인 현재
일반의미: 자신감 넘치고 열정적인 여성(혹은 그러한 성향을 가진 사람). ...
해석: 현재 당신은 매우 활기차고 열정적인 상태입니다. ...
---
카드명: The Fool
방향: 정방향
한줄요약: 새로운 시작을 향한 미래
일반의미: 순수함, 자유로움, 새로운 시작, 모험. ...
해석: 미래는 새로운 시작을 의미합니다. ...
---

카드별 해설 다음에는 반드시 아래처럼 종합 해석/조언/주의를 출력해.

## 종합 해석
(여기에 전체적인 해석을 2~3문장으로 써줘)

## 조언
- (조언 2~3가지, 리스트로)
(주의할 점 한 문장)

출력 마지막은 항상 "## 주의 타로 카드 해석은 개인적인 상황과 감정에 따라 달라질 수 있습니다.
이 해석은 일반적인 가이드라인일 뿐입니다."로 끝나야 해.

카드 정보:
${selectedCards
    .map((c: TarotCard, i: number) => `${i + 1}번째 카드: ${c.name} (${c.isReversed ? '역방향' : '정방향'})`)
    .join('\n')}
타로 점 유형: ${selectedTheme}
질문자 연령대: ${ageRange}
질문자 성별: ${gender === 'female' ? '여성' : gender === 'male' ? '남성' : gender === 'other' ? '기타' : '선택안함'}`;
        getTarotResult(prompt)
            .then((res) => {
                setResult(res);
                setCardDescs(parseCardDescriptions(res, selectedCards));
                setSummary(extractSummary(res));
                console.log(res);
            })
            .catch(() => {
                setResult('API 호출 중 오류가 발생했습니다.');
                setSummary({ summary: '', advice: '', caution: '' });
            })
            .finally(() => setLoading(false));
    }, [selectedCards, selectedTheme, ageRange, gender]);

    const handleCardClick = (idx: number) => {
        setModalCardIdx(idx);
        setModalOpen(true);
    };

    const modalContent =
        modalCardIdx !== null && cardDescs[modalCardIdx] && selectedCards[modalCardIdx] ? (
            <div style={{ textAlign: 'center' }}>
                <TarotCardComponent card={selectedCards[modalCardIdx]} isFaceUp={true} />
                <h3 style={{ margin: '20px 0 10px 0', color: '#e0baff' }}>
                    {cardDescs[modalCardIdx].title} ({cardDescs[modalCardIdx].direction})
                </h3>
                <div style={{ color: '#fff', margin: '10px 0', fontWeight: 500 }}>
                    {cardDescs[modalCardIdx].summary}
                </div>
                <div style={{ color: '#fff', whiteSpace: 'pre-line', textAlign: 'left', marginTop: 16 }}>
                    {cardDescs[modalCardIdx].meaning}
                </div>
                <div style={{ color: '#fff', whiteSpace: 'pre-line', textAlign: 'left', marginTop: 16 }}>
                    {cardDescs[modalCardIdx].interpretation}
                </div>
            </div>
        ) : null;

    return (
        <div className="result-container">
            <h2>타로 리딩 결과</h2>
            <div className="result-cardlist-wrapper">
                {/* 로딩 스피너 */}
                {loading && <div className="result-spinner" />}
                {/* 카드리스트 (로딩 중엔 블러/비활성화) */}
                <div
                    className="card-list"
                    style={{
                        pointerEvents: loading ? 'none' : 'auto',
                        filter: loading ? 'blur(4px) brightness(0.7)' : 'none',
                        transition: 'filter 0.3s',
                        display: 'flex',
                        alignItems: 'center',
                        position: 'relative',
                    }}
                    onClick={() => !loading && guideVisible && setGuideVisible(false)}
                >
                    {selectedCards &&
                        selectedCards.map((card: any, i: number) => (
                            <div
                                key={card.id}
                                style={{ cursor: loading ? 'default' : 'pointer' }}
                                onClick={() => !loading && handleCardClick(i)}
                            >
                                <TarotCardComponent card={card} isFaceUp={true} />
                            </div>
                        ))}
                </div>
                {/* 안내문구/팝업도 로딩중엔 숨김 */}
                {!loading && guideVisible && (
                    <div className="card-guide-float">카드를 클릭하여 상세메시지를 확인하세요</div>
                )}
            </div>
            <div className="result-summary-block">
                {loading ? (
                    <span className="result-loading-text">분석 중...</span>
                ) : (
                    <>
                        {summary.summary && (
                            <>
                                <b>-종합 해석-</b>
                                <TypingText text={summary.summary} speed={40} />
                                <br />
                            </>
                        )}
                        {summary.advice && (
                            <>
                                <b>-조언-</b>
                                <TypingText text={summary.advice} speed={40} />
                                <br />
                            </>
                        )}
                        {summary.caution && (
                            <>
                                <b>-경고-</b>
                                <TypingText text={summary.caution} speed={40} />
                            </>
                        )}
                        {!summary.summary && !summary.advice && !summary.caution && (
                            <TypingText text={result} speed={0} />
                        )}
                    </>
                )}
            </div>
            <div>
                <Link to="/" className="result-back-btn">
                    메인페이지로 돌아가기
                </Link>
            </div>
            {/* 모달도 로딩 중엔 비활성화 */}
            <Modal isOpen={!loading && modalOpen} onClose={() => setModalOpen(false)}>
                {modalContent}
            </Modal>
        </div>
    );
}
