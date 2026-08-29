export type AccountInfo = {
    bank: string;
    number: string;
    holder: string;
    relation?: string;
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
    image?: string;
  
    // ✅ 추가
    photo?: {
      fit?: "cover" | "contain";       
      padding?: string;                
      bg?: string;                     
      rounded?: string;                
      objectPosition?: string;         
    };
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
      /** 혼주 성함 · 서열 (MessageSection 의 "OOO · OOO의 장남 OOO" 표기에 쓰인다) */
      groomFather?: string;
      groomMother?: string;
      groomRank?: string;
      brideFather?: string;
      brideMother?: string;
      brideRank?: string;
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
      venueLat?: number;
      venueLng?: number;
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
      baseUrl: "https://jjsh-261212.com/",
      ogImageUrl: "https://jjsh-261212.com/images/og_image.webp",
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
      groomFather: "홍태환",
      groomMother: "노흥순",
      groomRank: "장남",
      brideFather: "신명범",
      brideMother: "오미영",
      brideRank: "장녀",
    },

    groomInfo: {
      name: "홍정준",
      role: "신랑",
      mbti: "ISTJ",
      hobby: "여행, 게임",
      introduction: "속은 따듯하고 언제나 긍정적인 사람입니다.",
      photoUrl: "images/profile_jun.webp",
    },

    brideInfo: {
      name: "신송희",
      role: "신부",
      mbti: "ISFJ",
      hobby: "여행, 게임",
      introduction: "따뜻하고 세심한 마음을 가진 사람입니다.",
      photoUrl: "images/profile_song.webp",
    },
    
    ceremony: {
      dateText: "2026.12.12 (토) 오후 1시 20분",
      dateISO: "2026-12-12T13:20:00+09:00",
      venueName: "까사그랑데 센트로",
      venueAddress: "서울특별시 광진구 능동로 87 건대입구역자이엘라 6층",
      venueLat: 37.539146,
      venueLng: 127.069655,
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
        { bank: "카카오뱅크", number: "3333-08-2171295", holder: "홍정준", relation: "신랑", kakaoPayUrl: "https://link.kakaopay.com/__/kAMNmIW" },
        { bank: "농협은행", number: "352-1883-4385-23", holder: "홍태환", relation: "신랑 아버지" },
        { bank: "신한은행", number: "110-278-098742", holder: "노흥순", relation: "신랑 어머니" },
    ],
    brideAccounts: [
        { bank: "카카오뱅크", number: "3333-06-7583309", holder: "신송희", relation: "신부", kakaoPayUrl: "https://link.kakaopay.com/__/kAMNmIW" },
        { bank: "신한은행", number: "110-234-567890", holder: "신명범", relation: "신부 아버지" },
        { bank: "우리은행", number: "1002-345-678901", holder: "오미영", relation: "신부 어머니" },
    ],
  
    gallery: [],

    story: [
      {
        icon: "✨",
        date: "2017년 여름",
        title: "첫 인연",
        description: "서로의 처음 만난 그 순간",
        image: "images/piano.webp",
        photo: { fit: "cover", padding: "p-0", bg: "bg-white" },
      },
      {
        icon: "💕",
        date: "2018년 여름",
        title: "설레는 시작",
        description: "서로에게 특별한 사람이 되어가는 순간",
        image: "images/lovestart.webp",
        photo: { fit: "cover", padding: "p-0", bg: "bg-white", objectPosition: "object-top" },
      },
      {
        icon: "🌸",
        date: "2018년 ~ 2024년",
        title: "함께한 날들",
        description: "웃음과 행복이 가득했던 우리의 이야기",
        image: "images/every.webp",
        photo: { fit: "cover", padding: "p-0", bg: "bg-neutral-50" },
      },
      {
        icon: "💍",
        date: "2025년",
        title: "프러포즈",
        description: "평생을 함께하기로 약속한 날",
        image: "images/marryme.webp",
        photo: { fit: "cover", padding: "p-0", bg: "bg-white" },
      },
      {
        icon: "🎊",
        date: "2026.12.12",
        title: "결혼",
        description: "새로운 이야기를 함께 그려 나아가는 날",
        image: "images/wedding.webp",
        photo: { fit: "cover", padding: "p-0", bg: "bg-white" },
      },
    ],
  };
  