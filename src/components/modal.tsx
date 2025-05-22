import type { ReactNode } from 'react';
import { useEffect } from 'react';
import './modal.css';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
    useEffect(() => {
        if (!isOpen) return;
        // 1. 현재 스크롤 위치 저장
        const scrollY = window.scrollY;
        // 2. body를 고정
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.overflowY = 'scroll';
        document.body.style.width = '100%';

        // 3. 언마운트/닫기 때 원상복구
        return () => {
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.left = '';
            document.body.style.right = '';
            document.body.style.overflowY = '';
            document.body.style.width = '';
            // 4. 스크롤 위치 복구
            window.scrollTo(0, scrollY);
        };
    }, [isOpen]);

    if (!isOpen) return null;
    return (
        <div
            className="modal-container"
            style={{
                position: 'fixed',
                zIndex: 1000,
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            onClick={onClose}
        >
            <div
                className="modal-box"
                onClick={(e) => e.stopPropagation()} // 모달 바깥 클릭 시 닫기, 내부 클릭은 닫히지 않음
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        fontSize: 20,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#fff',
                    }}
                >
                    ✕
                </button>
                {children}
            </div>
        </div>
    );
}
