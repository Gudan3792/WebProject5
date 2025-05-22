import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Mainpage.css';

export default function MainPage() {
    // 단계: start → info → select
    const [step, setStep] = useState<'start' | 'info' | 'select'>('start');
    const [maxCards, setMaxCards] = useState(3);
    const [selectedTheme, setSelectedTheme] = useState('');
    const [ageRange, setAgeRange] = useState('');
    const [gender, setGender] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        setSelectedTheme('');
    }, [maxCards]);

    const themeOptions: { [key: number]: string[] } = {
        1: ['❓ 간단한 질문 하나', '🌞 오늘의 메시지', '💡 지금 필요한 조언'],
        3: ['🕰️ 과거 · 현재 · 미래', '🔍 상황 · 조언 · 결과', '❤️ 나 · 상대 · 우리'],
        5: ['💘 사랑운', '💼 일과 커리어', '💰 돈과 재정', '🧘‍♀️ 건강과 균형'],
    };

    const ageOptions = ['0~9세', '10~19세', '20~29세', '30~39세', '40~49세', '50~59세', '60세 이상'];
    const genderOptions = [
        { label: '여성', value: 'female' },
        { label: '남성', value: 'male' },
        { label: '기타', value: 'other' },
        { label: '선택안함', value: 'none' },
    ];

    const handleStart = () => {
        setStep('info');
    };

    // 연령/성별 모두 선택하면 자동으로 step을 select로 전환
    useEffect(() => {
        if (step === 'info' && ageRange && gender) {
            setStep('select');
        }
    }, [step, ageRange, gender]);

    const handleFinalStart = () => {
        if (!selectedTheme) {
            alert('테마를 선택하세요!');
            return;
        }
        navigate('/sub', { state: { maxCards, selectedTheme, ageRange, gender } });
    };

    return (
        <div className="main-bg-pro">
            <div className="main-center-pro">
                <div className="main-header">
                    <img src="/logo.png" alt="타로 로고" className="main-logo" />
                    <h1 className="main-title-pro">AI 타로 리딩</h1>
                    <div className="main-subtitle">AI가 해석하는 전문 타로 리딩 서비스</div>
                </div>
                <div className="main-divider" />
                {step === 'start' && (
                    <button className="button-pro" onClick={handleStart}>
                        무료 타로 점 보기
                    </button>
                )}
                {step === 'info' && (
                    <div className="select-Tarot-container-pro fade-in">
                        <h2 className="title-pro">연령대와 성별을 선택하세요</h2>
                        <div className="user-info-group">
                            <div style={{ margin: '20px 0 12px 0', color: '#e0baff', fontWeight: 500 }}>연령대</div>
                            <div className="age-group">
                                {ageOptions.map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() => setAgeRange(opt)}
                                        className={`theme-btn-pro${ageRange === opt ? ' active' : ''}`}
                                        style={{ minWidth: 80, margin: '2px 4px' }}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                            <div style={{ margin: '18px 0 10px 0', color: '#e0baff', fontWeight: 500 }}>성별</div>
                            <div className="gender-group">
                                {genderOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setGender(opt.value)}
                                        className={`theme-btn-pro${gender === opt.value ? ' active' : ''}`}
                                        style={{ minWidth: 80, margin: '2px 4px' }}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div style={{ marginTop: 20, color: '#b9a0ff', fontSize: '0.98em' }}>
                            연령대와 성별을 모두 선택하면 다음 단계로 자동 진행됩니다.
                        </div>
                    </div>
                )}
                {step === 'select' && (
                    <div className="select-Tarot-container-pro fade-in">
                        <h2 className="title-pro">타로카드 테마 설정</h2>
                        <div className="card-count-group">
                            {[1, 3, 5].map((num) => (
                                <button
                                    key={num}
                                    onClick={() => setMaxCards(num)}
                                    disabled={maxCards === num}
                                    className={`theme-btn-pro${maxCards === num ? ' active' : ''}`}
                                >
                                    {num}장
                                </button>
                            ))}
                        </div>
                        <div className="theme-list-group">
                            {themeOptions[maxCards].map((theme) => (
                                <button
                                    key={theme}
                                    onClick={() => setSelectedTheme(theme)}
                                    disabled={selectedTheme === theme}
                                    className={`theme-btn-pro${selectedTheme === theme ? ' active' : ''}`}
                                >
                                    {theme}
                                </button>
                            ))}
                        </div>
                        <button className="button-pro start" onClick={handleFinalStart}>
                            타로 확인하기
                        </button>
                    </div>
                )}
            </div>
            <footer className="main-footer">
                <span>
                    Powered by <b>Gemini AI</b> | © 2025 AI Tarot By Gudan
                </span>
            </footer>
        </div>
    );
}
