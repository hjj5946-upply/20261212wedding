import './index.css'; // Tailwind CSS를 import 합니다.

function App() {
  return (
    // 1. 전체 화면을 차지하며 배경색을 회색으로 설정
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      
      {/* 2. 테스트 박스: 흰색 배경, 그림자, 패딩, 둥근 모서리 */}
      <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-sm w-full">
        
        {/* 3. 큰 폰트, 볼드, 특정 색상 적용 */}
        <h1 className="text-4xl font-bold text-teal-600 mb-4">
          Tailwind CSS Test
        </h1>
        
        {/* 4. Tailwind 유틸리티를 사용한 커스텀 스타일 */}
        <p className="text-gray-700 text-lg mb-6">
          이 텍스트가 **청록색(teal-600)** 이고, 배경이 **흰색(bg-white)** 이며, 
          큰 **그림자(shadow-2xl)** 가 보인다면 성공입니다!
        </p>

        {/* 5. 버튼 스타일 테스트 (hover 효과 포함) */}
        <button 
          className="bg-indigo-500 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 transform hover:scale-105"
        >
          버튼 테스트 (Hover Me)
        </button>
      </div>
    </div>
  );
}

export default App;