// src/config/wedding.ts
export type WeddingImage = {
    src: string;
    alt?: string;
  };
  
  export type WeddingConfig = {
    couple: {
      groomName: string;
      brideName: string;
      tagline: string; // 한 줄 문구
    };
    ceremony: {
      dateText: string;   // "2026.12.12 (토) 오후 1:00"
      dateISO: string;    // "2026-12-12T13:00:00+09:00"
      venueName: string;
      venueAddress: string;
      venueDetail?: string; // "3층 그랜드홀"
    };
    contacts: {
      groomPhone?: string;
      bridePhone?: string;
      kakaoTalkLink?: string; // 있으면
    };
    accounts: Array<{
      label: string;   // "신랑측"
      bank: string;
      number: string;
      holder: string;
    }>;
    gallery: WeddingImage[];
  };
  
  export const WEDDING: WeddingConfig = {
    couple: {
      groomName: "Groom",
      brideName: "Bride",
      tagline: "우리의 결혼식에 초대합니다.",
    },
    ceremony: {
      dateText: "2026.12.12 (토) 오후 1:00",
      dateISO: "2026-12-12T13:00:00+09:00",
      venueName: "웨딩홀 이름",
      venueAddress: "서울시 어딘가 123",
      venueDetail: "3층 그랜드홀",
    },
    contacts: {
      groomPhone: "010-0000-0000",
      bridePhone: "010-0000-0000",
      kakaoTalkLink: "",
    },
    accounts: [
      { label: "신랑측", bank: "국민", number: "000000-00-000000", holder: "홍길동" },
      { label: "신부측", bank: "신한", number: "000-000-000000", holder: "김영희" },
    ],
    gallery: [
      { src: "/images/sample-1.jpg", alt: "sample-1" },
      { src: "/images/sample-2.jpg", alt: "sample-2" },
      { src: "/images/sample-3.jpg", alt: "sample-3" },
    ],
  };
  