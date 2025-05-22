// types/tarot.ts
export type TarotCard = {
  id: string;            // 고유 ID (예: "the-fool")
  name: string;          // 카드 이름 (예: "The Fool")
  suit: 'major' | 'cups' | 'pentacles' | 'swords' | 'wands';
  image: string;         // 이미지 경로
  isReversed: boolean; //역방향?
};
