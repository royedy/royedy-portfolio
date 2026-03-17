const { useState, useEffect, useRef } = React; 

function App() { 
  const [projects, setProjects] = useState([]); 
  const [selectedId, setSelectedId] = useState(null); 
  const [hoveredIndex, setHoveredIndex] = useState(null); 
  const [mouseX, setMouseX] = useState(null); 
  // 🌟 모달 창을 열고 닫는 마법의 스위치 상태 추가
  const [isAboutOpen, setIsAboutOpen] = useState(false); 
  
  const itemRefs = useRef([]); 
  const scrollContainerRef = useRef(null); 

  useEffect(() => {
    fetch('./projects.json')
      .then((response) => response.json())
      .then((data) => setProjects(data))
      .catch((error) => console.error("Data load failed:", error));
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, [selectedId]); 

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || selectedId !== null) return;

    const handleWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY * 1.5; 
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [selectedId]);

  const handleMouseMove = (e) => { setMouseX(e.clientX); }; 
  const handleMouseLeaveGrid = () => { setMouseX(null); setHoveredIndex(null); }; 

  if (projects.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white text-xs tracking-[0.3em] font-light">
        LOADING PROJECTS...
      </div>
    );
  }

  return ( 
    <div className="relative min-h-screen flex flex-col"> 
      <style>{`
        .hide-scroll::-webkit-scrollbar { display: none; }
        /* 모달이 부드럽게 나타나도록 애니메이션 추가 */
        .fade-in { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      {/* 🌟 ABOUT 모달 컴포넌트 추가 */}
      {isAboutOpen && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm fade-in pointer-events-auto"
          onClick={() => setIsAboutOpen(false)} /* 배경 클릭 시 닫힘 */
        >
          <div 
            className="flex flex-col items-center justify-center p-12 md:p-16 border border-white/20 bg-black max-w-lg w-11/12"
            onClick={(e) => e.stopPropagation()} /* 모달 내부 클릭 시 안 닫히게 방어 */
          >
            <p className="text-white text-sm tracking-widest leading-loose text-center font-light mb-10">
              This portfolio is continuously being updated.<br />
              Thank you!
            </p>
            <button 
              onClick={() => setIsAboutOpen(false)}
              className="text-[10px] tracking-[0.2em] border border-white px-8 py-3 hover:bg-white hover:text-black transition-all tight-spacing text-white"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      <header className="fixed top-0 left-0 right-0 flex justify-between items-center p-8 z-50 mix-blend-difference pointer-events-none"> 
        <div className="text-2xl font-black tracking-tighter cursor-pointer logo-font pointer-events-auto" onClick={() => setSelectedId(null)}>ROYEDY</div> 
        {selectedId === null && ( 
          <div 
            className="text-sm font-medium tracking-widest cursor-pointer hover:line-through tight-spacing pointer-events-auto"
            onClick={() => setIsAboutOpen(true)} /* 🌟 클릭 시 모달 열기 */
          >
            ABOUT
          </div> 
        )} 
      </header> 

      {selectedId === null ? ( 
        <main className="flex-grow flex items-center justify-center fade-enter w-full overflow-hidden" 
          onMouseMove={handleMouseMove} 
          onMouseLeave={handleMouseLeaveGrid}> 
          
          <div 
            ref={scrollContainerRef}
            className="flex h-[35vh] w-full gap-4 items-center overflow-x-auto hide-scroll px-[10vw]" 
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          > 
            <div className="flex gap-4 mx-auto"> 
              {projects.map((project, index) => { 
                let translateY = 0; 
                if (mouseX !== null && itemRefs.current[index]) { 
                  const rect = itemRefs.current[index].getBoundingClientRect(); 
                  const centerX = rect.left + rect.width / 2; 
                  const distance = Math.abs(mouseX - centerX); 
                  const influence = Math.max(0, 1 - distance / 300); 
                  translateY = -influence * 60; 
                } 
                return ( 
                  <div 
                    key={index} 
                    ref={el => itemRefs.current[index] = el} 
                    className={`accordion-item relative cursor-pointer overflow-hidden 
                    ${hoveredIndex === index ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`} 
                    style={{ 
                      width: hoveredIndex === index ? 'calc(35vh * 1.25)' : '60px', 
                      height: '35vh', flexShrink: 0, 
                      transform: `translateY(${translateY}px)` 
                    }} 
                    onMouseEnter={() => setHoveredIndex(index)} 
                    onClick={() => setSelectedId(project.id)} 
                  > 
                    <img src={project.thumb} className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${hoveredIndex === index ? 'grayscale-0' : 'grayscale'}`} alt={project.title} /> 
                    <div className={`absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-500 ${hoveredIndex === index ? 'opacity-100' : 'opacity-0'}`}> 
                      <span className="project-title text-white">{project.title}</span> 
                    </div> 
                  </div> 
                ); 
              })} 
            </div>
          </div> 
        </main> 
      ) : ( 
        <main className="flex-grow flex flex-col items-center pt-32 pb-32 fade-enter relative"> 
          <div className="w-full flex flex-col relative" style={{ maxWidth: '1200px' }}> 
            <div className="sticky top-10 z-[100] w-full h-0 flex justify-end pointer-events-none"> 
              <button 
                onClick={() => setSelectedId(null)} 
                className="absolute transform translate-x-12 md:translate-x-16 -translate-y-4 text-3xl font-light mix-blend-difference hover:rotate-90 hover:scale-110 transition-all duration-300 cursor-pointer pointer-events-auto" 
                aria-label="Close project" 
              > 
                ✕ 
              </button> 
            </div> 

            {projects.find(p => p.id === selectedId).details.map((src, i) => ( 
              <img key={i} src={src} className="w-full h-auto block" alt="Detail" /> 
            ))} 
            <button onClick={() => setSelectedId(null)} className="mt-24 self-center text-[10px] tracking-[0.2em] border border-white px-12 py-5 hover:bg-white hover:text-black transition-all tight-spacing">BACK TO PROJECTS</button> 
          </div> 
        </main> 
      )} 

      <footer className="fixed bottom-0 left-0 right-0 flex justify-between items-end p-8 z-50 mix-blend-difference text-[10px] font-light tight-spacing pointer-events-none"> 
        <div className="leading-relaxed pointer-events-auto"> 
          <p>GRAPHIC / TYPOGRAPHY / BRANDING</p> 
          <p>2026 STUDIO RYDY</p> 
        </div> 
        <div className="text-right space-y-1 pointer-events-auto"> 
          <a href="mailto:hugh26@naver.com" className="block hover:underline cursor-pointer">EMAIL</a> 
          <a href="https://www.instagram.com/rroedyyy/" target="_blank" rel="noopener noreferrer" className="block hover:underline cursor-pointer">INSTAGRAM</a> 
        </div> 
      </footer> 
    </div> 
  ); 
} 

const root = ReactDOM.createRoot(document.getElementById('root')); 
root.render(<App />);