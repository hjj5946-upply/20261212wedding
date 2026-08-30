import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// 인트로가 fixed 오버레이라 인트로 동안 문서 높이가 0에 가깝다.
// 브라우저 기본 스크롤 복원을 켜두면 본문이 마운트되어 페이지가 길어지는 순간
// 새로고침 직전 위치(예: 갤러리)로 되돌아가므로 복원을 끈다.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
