/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./index.html",
      // src 폴더 내의 모든 .ts, .tsx 파일을 스캔하도록 설정
      "./src/**/*.{js,ts,jsx,tsx}", 
    ],
    theme: {
      extend: {
        fontFamily: {
          sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'sans-serif'],
        },
        colors: {
          // 웨딩 컬러 팔레트 - 부드러운 파스텔 톤
          wedding: {
            pink: {
              50: '#FFF5F7',
              100: '#FFE3E9',
              200: '#FFC7D4',
              300: '#FFA0B8',
              400: '#FF7099',
              500: '#FF4D7D',
              600: '#E63969',
              700: '#C02755',
            },
            peach: {
              50: '#FFF8F5',
              100: '#FFECE3',
              200: '#FFD4C2',
              300: '#FFB89A',
              400: '#FF9871',
              500: '#FF7A50',
            },
            cream: {
              50: '#FFFCF5',
              100: '#FFF8E8',
              200: '#FFEFD1',
              300: '#FFE4B3',
            },
            sage: {
              50: '#F7F9F7',
              100: '#E8F0E8',
              200: '#D4E4D4',
              300: '#B8D4B8',
              400: '#98C098',
            },
          },
        },
      },
    },
    plugins: [],
  }