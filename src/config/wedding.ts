export type AccountInfo = {
    bank: string;
    number: string;
    holder: string;
    memo?: string;
  };
  
  export type WeddingCopy = {
    heroSubtitle: string;
    storyTitle: string;
    galleryTitle: string;
    infoTitle: string;
    locationTitle: string;
    rsvpTitle: string;
    giftTitle: string;
    giftNotice: string;
  };
  
  export type WeddingConfig = {
    site: {
      baseUrl: string;
      ogImageUrl: string;
    };
    copy: WeddingCopy;
  
    couple: {
      groomName: string;
      brideName: string;
      tagline: string;
    };
  
    ceremony: {
      dateText: string;
      dateISO: string;
      venueName: string;
      venueAddress: string;
      venueDetail?: string;
      naverMapUrl: string;
    };
  
    contacts: {
      groomPhone?: string;
      bridePhone?: string;
      kakaoTalkLink?: string;
    };
  
    groomAccounts: AccountInfo[];
    brideAccounts: AccountInfo[];
    gallery: { src: string; alt?: string }[];
  };
  
  export const WEDDING: WeddingConfig = {
    site: {
      baseUrl: "https://YOUR_GITHUB_ID.github.io/20261212wedding/",
      ogImageUrl: "https://YOUR_GITHUB_ID.github.io/20261212wedding/images/og.webp",
    },
  
    copy: {
      heroSubtitle: "결혼식에 초대합니다.",
      storyTitle: "Our Story",
      galleryTitle: "Gallery",
      infoTitle: "Wedding Info",
      locationTitle: "Location",
      rsvpTitle: "RSVP",
      giftTitle: "마음 전하실 곳",
      giftNotice: "원하시는 분에 한해 마음 전하실 곳을 안내드립니다.",
    },
  
    couple: {
      groomName: "준",
      brideName: "쏭",
      tagline: "소중한 분들을 초대합니다.",
    },
  
    ceremony: {
      dateText: "2026.12.12 (토) 오후 1시 20분",
      dateISO: "2026-12-12T13:20:00+09:00",
      venueName: "까사그랑데 센트로",
      venueAddress: "서울특별시 광진구 능동로 87 건대입구역자이엘라 6층",
      venueDetail: "",
      naverMapUrl:
        "https://map.naver.com/p/search/%EA%B9%8C%EC%82%AC%EA%B7%B8%EB%9E%91%EB%8D%B0?c=17.08,0,0,0,dh",
    },
  
    contacts: {
      groomPhone: "01022805946",
      bridePhone: "01037964209",
      kakaoTalkLink: "",
    },
  
    groomAccounts: [
        { bank: "국민은행", number: "664202-04-039583", holder: "홍정준" },
    ],
    brideAccounts: [
        { bank: "신한은행", number: "000-000-000000", holder: "신송희" },
    ],
  
    gallery: [],
  };
  