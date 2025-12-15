/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./index.html",
      // src 폴더 내의 모든 .ts, .tsx 파일을 스캔하도록 설정
      "./src/**/*.{js,ts,jsx,tsx}", 
    ],
    theme: {
      extend: {
        // 여기에 결혼식 컨셉에 맞는 커스텀 색상, 폰트 등을 추가할 수 있습니다.
        // 예: primary: '#A54F7F' (결혼식 메인 컬러)
      },
    },
    plugins: [],
  }