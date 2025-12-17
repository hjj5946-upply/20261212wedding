export type AccountInfo = {
    bank: string;
    number: string;
    holder: string;
    memo?: string;
    kakaoPayUrl?: string;
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
  
  export type StoryTimeline = {
    icon: string;
    date: string;
    title: string;
    description: string;
  };

  export type CoupleInfo = {
    name: string;
    role: string;
    mbti?: string;
    hobby?: string;
    favorite?: string;
    introduction?: string;
    photoUrl?: string;
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

    groomInfo?: CoupleInfo;
    brideInfo?: CoupleInfo;

    ceremony: {
      dateText: string;
      dateISO: string;
      venueName: string;
      venueAddress: string;
      venueDetail?: string;
      naverMapUrl: string;
      kakaoMapUrl: string;
      tmapUrl: string;
    };

    contacts: {
      groomPhone?: string;
      bridePhone?: string;
      kakaoTalkLink?: string;
    };

    groomAccounts: AccountInfo[];
    brideAccounts: AccountInfo[];
    gallery: { src: string; alt?: string }[];
    story: StoryTimeline[];
  };
  
  export const WEDDING: WeddingConfig = {
    site: {
      baseUrl: "https://hjj5946-upply.github.io/20261212wedding/",
      ogImageUrl: "https://hjj5946-upply.github.io/20261212wedding/images/og.webp",
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
      groomName: "홍정준",
      brideName: "신송희",
      tagline: "소중한 분들을 초대합니다.",
    },

    groomInfo: {
      name: "준",
      role: "신랑",
      mbti: "ISTJ",
      hobby: "카메라, 여행",
      favorite: "여행, 게임",
      introduction: "언제나 긍정적이고 밝은 에너지를 가진 사람입니다.",
    },

    brideInfo: {
      name: "쏭",
      role: "신부",
      mbti: "ISFJ",
      hobby: "독서, 베이킹",
      favorite: "여행, 음악 감상, 게임",
      introduction: "따뜻하고 세심한 마음을 가진 사람입니다.",
    },
  
    ceremony: {
      dateText: "2026.12.12 (토) 오후 1시 20분",
      dateISO: "2026-12-12T13:20:00+09:00",
      venueName: "까사그랑데 센트로",
      venueAddress: "서울특별시 광진구 능동로 87 건대입구역자이엘라 6층",
      venueDetail: "",
      naverMapUrl:"https://map.naver.com/p/search/%EA%B9%8C%EC%82%AC%EA%B7%B8%EB%9E%91%EB%8D%B0?c=17.08,0,0,0,dh",
      kakaoMapUrl:"https://map.kakao.com/",
      tmapUrl:"https://www.tmap.co.kr/my_tmap/my_map_tip/map_tip.do#"
    },
  
    contacts: {
      groomPhone: "",
      bridePhone: "",
      kakaoTalkLink: "",
    },
  
    groomAccounts: [
        { bank: "카카오뱅크", number: "3333-08-2171295", holder: "홍정준", kakaoPayUrl: "https://link.kakaopay.com/__/kAMNmIW" },
    ],
    brideAccounts: [
        { bank: "카카오뱅크", number: "3333-06-7583309", holder: "신송희", kakaoPayUrl: "https://link.kakaopay.com/__/kAMNmIW" },
    ],
  
    gallery: [],

    story: [
      {
        icon: "✨",
        date: "2017년 여름",
        title: "첫 만남",
        description: "서로의 인연이 시작된 특별한 순간",
      },
      {
        icon: "💕",
        date: "2018년 여름",
        title: "설레는 시작",
        description: "서로에게 특별한 사람이 되어가는 순간",
      },
      {
        icon: "🌸",
        date: "2018년 ~ 2024년",
        title: "함께한 날들",
        description: "웃음과 행복이 가득했던 우리의 이야기",
      },
      {
        icon: "💍",
        date: "2025년",
        title: "프러포즈",
        description: "평생을 함께하기로 약속한 날",
      },
      {
        icon: "🎊",
        date: "2026.12.12",
        title: "결혼식",
        description: "새로운 시작을 함께 축하해주세요",
      },
    ],
  };
  