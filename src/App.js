import React, { useMemo, useState } from "react";
import { perfumes as perfumeData } from "./perfumes";

/**
 * K-perfume AI
 * React 18 + Tailwind CSS 기반 모바일 향수 추천 앱
 * CodeSandbox에서 src/App.jsx에 붙여넣어 실행할 수 있습니다.
 */

const scentMeta = {
  citrus: {
    ko: "시트러스",
    en: "Citrus",
    emoji: "🍋",
    mood: "상큼하고 가벼운 향",
    color: "bg-yellow-300",
    text: "text-yellow-700",
  },
  floral: {
    ko: "플로럴",
    en: "Floral",
    emoji: "🌸",
    mood: "부드럽고 화사한 꽃향",
    color: "bg-pink-200",
    text: "text-pink-600",
  },
  woody: {
    ko: "우디",
    en: "Woody",
    emoji: "🌿",
    mood: "차분하고 깊이 있는 향",
    color: "bg-green-300",
    text: "text-green-700",
  },
  musk: {
    ko: "머스크",
    en: "Musk",
    emoji: "🫧",
    mood: "포근하고 은은한 잔향",
    color: "bg-stone-200",
    text: "text-stone-700",
  },
  oriental: {
    ko: "오리엔탈",
    en: "Oriental",
    emoji: "✨",
    mood: "달콤하고 고급스러운 향",
    color: "bg-amber-200",
    text: "text-amber-700",
  },
};

// 설문 더미 데이터 30개
const questions = [
  ["상큼하고 가벼운 향을 좋아하나요?", "citrus"],
  ["레몬, 오렌지처럼 산뜻한 향이 좋나요?", "citrus"],
  ["여름에 어울리는 청량한 향을 선호하나요?", "citrus"],
  ["무겁지 않고 밝은 느낌의 향이 좋나요?", "citrus"],
  ["기분 전환이 되는 향을 좋아하나요?", "citrus"],
  ["깔끔한 첫인상을 주는 향을 원하나요?", "citrus"],

  ["꽃향처럼 부드럽고 화사한 향을 좋아하나요?", "floral"],
  ["로맨틱하고 밝은 분위기의 향이 좋나요?", "floral"],
  ["은은한 플라워 향을 선호하나요?", "floral"],
  ["데이트에 어울리는 향을 찾고 있나요?", "floral"],
  ["부드럽고 따뜻한 인상의 향이 좋나요?", "floral"],
  ["화사하지만 부담스럽지 않은 향을 원하나요?", "floral"],

  ["나무 향처럼 차분한 향을 좋아하나요?", "woody"],
  ["깊고 안정적인 분위기의 향이 좋나요?", "woody"],
  ["성숙하고 단정한 이미지를 주는 향을 원하나요?", "woody"],
  ["가을, 겨울에 어울리는 향을 선호하나요?", "woody"],
  ["샌달우드나 시더우드 계열 향이 좋나요?", "woody"],
  ["무게감 있는 향을 좋아하나요?", "woody"],

  ["포근하고 은은한 잔향을 좋아하나요?", "musk"],
  ["비누 향이나 코튼 향처럼 깨끗한 향이 좋나요?", "musk"],
  ["강한 향보다 자연스럽게 남는 향을 선호하나요?", "musk"],
  ["매일 사용하기 편한 향을 찾고 있나요?", "musk"],
  ["호불호가 적은 향을 원하나요?", "musk"],
  ["부담 없는 데일리 향을 좋아하나요?", "musk"],

  ["달콤하고 고급스러운 향을 좋아하나요?", "oriental"],
  ["바닐라, 앰버처럼 따뜻한 향이 좋나요?", "oriental"],
  ["특별한 날에 어울리는 향을 원하나요?", "oriental"],
  ["강한 인상을 남기는 향을 선호하나요?", "oriental"],
  ["밤 분위기와 어울리는 향이 좋나요?", "oriental"],
  ["개성 있는 향을 좋아하나요?", "oriental"],
].map(([text, type], index) => ({
  id: index + 1,
  text,
  type,
}));

function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [gender, setGender] = useState("");
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [lastResult, setLastResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedPerfume, setSelectedPerfume] = useState(null);

  // 찜하기 토글
  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // 설문 결과 계산
  const calculateResult = () => {
    const scores = {
      citrus: 50,
      floral: 50,
      woody: 50,
      musk: 50,
      oriental: 50,
    };

    // 성별에 따른 초기 점수 보정
    if (gender === "male") {
      scores.woody += 5;
      scores.musk += 5;
      scores.oriental += 5;
    }

    if (gender === "female") {
      scores.floral += 5;
      scores.citrus += 5;
      scores.musk += 5;
    }

    // 질문별 응답 점수 반영
    questions.forEach((question) => {
      const answerValue = answers[question.id] || 0;
      scores[question.type] += answerValue * 3;
    });

    const topType = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];

    const result = {
      id: Date.now(),
      date: new Date().toLocaleDateString("ko-KR"),
      gender,
      scores,
      topType,
    };

    setLastResult(result);
    setHistory((prev) => [result, ...prev].slice(0, 5));
    setActiveTab("result");
  };

  // 설문 초기화
  const resetSurvey = () => {
    setGender("");
    setAnswers({});
    setCurrentQuestion(0);
    setActiveTab("survey");
  };

  return (
    <div className="min-h-screen bg-stone-100 flex justify-center">
      <div className="relative w-full max-w-[375px] h-[812px] bg-[#fbfaf5] overflow-hidden shadow-2xl">
        <Header />

        <main className="h-[742px] overflow-y-auto px-5 pb-28">
          {activeTab === "home" && <HomeScreen onStart={resetSurvey} />}

          {activeTab === "survey" && (
            <SurveyScreen
              gender={gender}
              setGender={setGender}
              answers={answers}
              setAnswers={setAnswers}
              currentQuestion={currentQuestion}
              setCurrentQuestion={setCurrentQuestion}
              onSubmit={calculateResult}
            />
          )}

          {activeTab === "result" && (
            <ResultScreen
              result={lastResult}
              onGoRecommend={() => setActiveTab("recommend")}
              onRestart={resetSurvey}
            />
          )}

          {activeTab === "recommend" && (
            <RecommendScreen
              result={lastResult}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              onSelectPerfume={(perfume) => {
                setSelectedPerfume(perfume);
                setActiveTab("detail");
              }}
            />
          )}

          {activeTab === "detail" && selectedPerfume && (
            <DetailScreen
              perfume={selectedPerfume}
              result={lastResult}
              isFavorite={favorites.includes(selectedPerfume.id)}
              toggleFavorite={toggleFavorite}
              onBack={() => setActiveTab("recommend")}
            />
          )}

          {activeTab === "chatbot" && <ChatbotScreen result={lastResult} />}

          {activeTab === "mypage" && (
            <MyPageScreen
              result={lastResult}
              history={history}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              onRestart={resetSurvey}
              onSelectPerfume={(perfume) => {
                setSelectedPerfume(perfume);
                setActiveTab("detail");
              }}
            />
          )}
        </main>

        <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="h-[70px] px-5 flex items-center justify-between bg-[#fbfaf5] border-b border-green-100">
      <div>
        <h1 className="text-xl font-bold text-green-900">K-perfume AI</h1>
        <p className="text-xs text-stone-500">취향 기반 향수 추천 서비스</p>
      </div>
      <div className="w-10 h-10 rounded-[12px] bg-yellow-300 flex items-center justify-center shadow-sm">
        🌿
      </div>
    </header>
  );
}

function HomeScreen({ onStart }) {
  return (
    <section className="pt-5 space-y-5">
      <div className="rounded-[12px] bg-green-900 text-white p-5 shadow-sm">
        <p className="text-sm text-yellow-200 mb-2">AI Perfume Test</p>
        <h2 className="text-2xl font-bold leading-tight">
          간단한 설문으로
          <br />
          나에게 맞는 향수를 찾아보세요.
        </h2>
        <p className="text-sm text-green-100 mt-3 leading-6">
          향수 지식이 없어도 취향, 분위기, 사용 상황을 바탕으로 어울리는 향
          계열과 제품을 추천해드립니다.
        </p>
        <button
          onClick={onStart}
          className="mt-5 w-full h-12 rounded-[12px] bg-yellow-300 text-green-950 font-bold"
        >
          향수 취향 테스트 시작하기
        </button>
      </div>

      <SectionTitle
        title="추천 방식"
        subtitle="설문 결과를 향 계열 점수로 분석해요."
      />

      <div className="grid grid-cols-2 gap-3">
        <FeatureCard icon="📝" title="취향 설문" desc="30개 문항 응답" />
        <FeatureCard icon="📊" title="향 계열 분석" desc="5개 계열 점수화" />
        <FeatureCard icon="💛" title="가격대 추천" desc="예산별 제품 제안" />
        <FeatureCard icon="🤖" title="AI 설명" desc="쉬운 추천 이유" />
      </div>
    </section>
  );
}

function SurveyScreen({
  gender,
  setGender,
  answers,
  setAnswers,
  currentQuestion,
  setCurrentQuestion,
  onSubmit,
}) {
  const question = questions[currentQuestion];
  const progress = Math.round(((currentQuestion + 1) / questions.length) * 100);
  const answeredCount = Object.keys(answers).length;
  const isComplete = gender && answeredCount === questions.length;

  return (
    <section className="pt-5 space-y-5">
      <SectionTitle
        title="향수 취향 설문"
        subtitle="1점부터 5점까지 선택해주세요."
      />

      <div className="rounded-[12px] bg-white border border-green-100 p-4">
        <p className="text-sm font-bold text-green-950 mb-3">성별 선택</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setGender("male")}
            className={`h-11 rounded-[12px] border text-sm font-bold ${
              gender === "male"
                ? "bg-green-900 text-white border-green-900"
                : "bg-white text-stone-600 border-stone-200"
            }`}
          >
            남성
          </button>
          <button
            onClick={() => setGender("female")}
            className={`h-11 rounded-[12px] border text-sm font-bold ${
              gender === "female"
                ? "bg-green-900 text-white border-green-900"
                : "bg-white text-stone-600 border-stone-200"
            }`}
          >
            여성
          </button>
        </div>
      </div>

      <div className="rounded-[12px] bg-white border border-green-100 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-green-950">
            Q{question.id}. {scentMeta[question.type].ko} 관련 질문
          </p>
          <p className="text-xs text-stone-500">
            {currentQuestion + 1}/{questions.length}
          </p>
        </div>

        <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden mb-5">
          <div
            className="h-full bg-green-700"
            style={{ width: `${progress}%` }}
          />
        </div>

        <h3 className="text-lg font-bold text-stone-900 leading-7 min-h-[72px]">
          {question.text}
        </h3>

        <div className="mt-5 grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((score) => (
            <button
              key={score}
              onClick={() =>
                setAnswers((prev) => ({
                  ...prev,
                  [question.id]: score,
                }))
              }
              className={`h-11 rounded-[12px] font-bold border ${
                answers[question.id] === score
                  ? "bg-yellow-300 border-yellow-300 text-green-950"
                  : "bg-white border-stone-200 text-stone-500"
              }`}
            >
              {score}
            </button>
          ))}
        </div>

        <div className="flex justify-between text-xs text-stone-400 mt-2">
          <span>전혀 아니다</span>
          <span>매우 그렇다</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setCurrentQuestion((prev) => Math.max(prev - 1, 0))}
          className="h-12 rounded-[12px] bg-white border border-stone-200 text-stone-600 font-bold"
        >
          이전
        </button>
        {currentQuestion === questions.length - 1 ? (
          <button
            onClick={onSubmit}
            disabled={!isComplete}
            className={`h-12 rounded-[12px] font-bold ${
              isComplete
                ? "bg-green-900 text-white"
                : "bg-stone-200 text-stone-400"
            }`}
          >
            결과 보기
          </button>
        ) : (
          <button
            onClick={() =>
              setCurrentQuestion((prev) =>
                Math.min(prev + 1, questions.length - 1)
              )
            }
            className="h-12 rounded-[12px] bg-green-900 text-white font-bold"
          >
            다음
          </button>
        )}
      </div>

      <p className="text-center text-xs text-stone-400">
        응답 완료: {answeredCount}/{questions.length}
      </p>
    </section>
  );
}

function ResultScreen({ result, onGoRecommend, onRestart }) {
  if (!result) {
    return (
      <EmptyState
        title="아직 설문 결과가 없어요."
        desc="먼저 향수 취향 테스트를 진행해주세요."
        buttonText="테스트 시작하기"
        onClick={onRestart}
      />
    );
  }

  const meta = scentMeta[result.topType];

  return (
    <section className="pt-5 space-y-5">
      <div className="rounded-[12px] bg-green-900 text-white p-5 text-center">
        <p className="text-sm text-yellow-200">추천 향 계열</p>
        <div className="text-5xl mt-3">{meta.emoji}</div>
        <h2 className="text-3xl font-bold mt-3">{meta.ko}</h2>
        <p className="text-sm text-green-100 mt-3 leading-6">
          당신은 {meta.mood}을 선호하는 편입니다. 향은 개인 취향에 따라 다르게
          느껴질 수 있습니다.
        </p>
      </div>

      <div className="rounded-[12px] bg-white border border-green-100 p-4">
        <h3 className="font-bold text-green-950 mb-3">추천 이유</h3>
        <p className="text-sm text-stone-600 leading-6">
          설문 응답에서 {meta.ko} 계열과 관련된 선호도가 높게 나타났습니다.
          따라서 {meta.mood}을 중심으로 한 향수가 잘 어울릴 가능성이 높습니다.
        </p>
      </div>

      <ScoreBars scores={result.scores} />

      <button
        onClick={onGoRecommend}
        className="w-full h-12 rounded-[12px] bg-yellow-300 text-green-950 font-bold"
      >
        추천 향수 보러가기
      </button>
    </section>
  );
}

function RecommendScreen({
  result,
  favorites,
  toggleFavorite,
  onSelectPerfume,
}) {
  const [search, setSearch] = useState("");
  const [priceFilter, setPriceFilter] = useState("전체");
  const [typeFilter, setTypeFilter] = useState(result?.topType || "전체");

  const filteredPerfumes = useMemo(() => {
    return perfumeData.filter((perfume) => {
      const meta = scentMeta[perfume.type];

      const matchSearch =
        perfume.name.includes(search) ||
        perfume.brand.toLowerCase().includes(search.toLowerCase()) ||
        meta.ko.includes(search);

      const matchPrice =
        priceFilter === "전체" || perfume.priceRange === priceFilter;
      const matchType = typeFilter === "전체" || perfume.type === typeFilter;

      return matchSearch && matchPrice && matchType;
    });
  }, [search, priceFilter, typeFilter]);

  return (
    <section className="pt-5 space-y-5">
      <SectionTitle
        title="추천 향수"
        subtitle={
          result
            ? `${scentMeta[result.topType].ko} 계열을 중심으로 추천해드려요.`
            : "검색과 필터로 향수를 찾아보세요."
        }
      />

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="향수명, 브랜드, 향 계열 검색"
        className="w-full h-12 rounded-[12px] bg-white border border-green-100 px-4 text-sm outline-none focus:border-green-700"
      />

      <div className="space-y-3">
        <FilterChips
          label="가격대"
          options={["전체", "1~3만원", "4~10만원", "10만원 이상"]}
          value={priceFilter}
          onChange={setPriceFilter}
        />

        <FilterChips
          label="향 계열"
          options={["전체", "citrus", "floral", "woody", "musk", "oriental"]}
          value={typeFilter}
          onChange={setTypeFilter}
          scent
        />
      </div>

      <p className="text-xs text-stone-400">
        총 {filteredPerfumes.length}개의 향수가 검색되었습니다.
      </p>

      <div className="space-y-3">
        {filteredPerfumes.map((perfume) => (
          <PerfumeCard
            key={perfume.id}
            perfume={perfume}
            isFavorite={favorites.includes(perfume.id)}
            toggleFavorite={toggleFavorite}
            onSelect={() => onSelectPerfume(perfume)}
          />
        ))}

        {filteredPerfumes.length === 0 && (
          <div className="rounded-[12px] bg-white border border-stone-200 p-5 text-center text-sm text-stone-500">
            조건에 맞는 향수가 없습니다.
          </div>
        )}
      </div>
    </section>
  );
}

function DetailScreen({ perfume, result, isFavorite, toggleFavorite, onBack }) {
  const meta = scentMeta[perfume.type];

  return (
    <section className="pt-5 space-y-5">
      <button onClick={onBack} className="text-sm text-green-700 font-bold">
        ← 추천 목록으로 돌아가기
      </button>

      <div className="rounded-[12px] bg-white border border-green-100 p-5">
        <div className="flex justify-between gap-3">
          <div>
            <p className="text-xs text-stone-400">{perfume.brand}</p>
            <h2 className="text-xl font-bold text-green-950 mt-1">
              {perfume.name}
            </h2>
          </div>
          <button
            onClick={() => toggleFavorite(perfume.id)}
            className={`w-11 h-11 rounded-[12px] ${
              isFavorite ? "bg-yellow-300" : "bg-stone-100"
            }`}
          >
            {isFavorite ? "♥" : "♡"}
          </button>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <div
            className={`w-14 h-14 rounded-[12px] ${meta.color} flex items-center justify-center text-2xl`}
          >
            {meta.emoji}
          </div>
          <div>
            <p className={`font-bold ${meta.text}`}>{meta.ko} 계열</p>
            <p className="text-sm text-stone-500">{perfume.price}</p>
          </div>
        </div>
      </div>

      <div className="rounded-[12px] bg-green-900 text-white p-5">
        <p className="text-sm text-yellow-200 mb-2">AI 추천 설명</p>
        <p className="text-sm leading-6 text-green-50">
          이 향수는 {meta.mood}을 좋아하는 분께 어울립니다. 첫 향은{" "}
          {perfume.top} 느낌으로 시작되고, 중심에는 {perfume.middle} 무드가
          느껴집니다. 마지막에는 {perfume.base} 잔향이 남아 {perfume.situation}{" "}
          상황에 사용하기 좋습니다.
        </p>
      </div>

      <div className="rounded-[12px] bg-white border border-green-100 p-4 space-y-3">
        <InfoRow label="탑 노트" value={perfume.top} />
        <InfoRow label="미들 노트" value={perfume.middle} />
        <InfoRow label="베이스 노트" value={perfume.base} />
        <InfoRow label="추천 상황" value={perfume.situation} />
        <InfoRow label="가격대" value={perfume.priceRange} />
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => {
            window.open(
              perfume.oliveyoungLink,
              "_blank",
              "noopener,noreferrer"
            );
          }}
          className="block w-full h-12 leading-[48px] text-center rounded-[12px] bg-yellow-300 text-green-950 font-bold"
        >
          올리브영에서 검색하기
        </button>

        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(perfume.oliveyoungLink);
            alert("링크가 복사되었습니다.");
          }}
          className="block w-full h-12 leading-[48px] text-center rounded-[12px] bg-white border border-gray-300 text-gray-700 font-bold"
        >
          링크 복사하기
        </button>
      </div>

      {result && (
        <div className="rounded-[12px] bg-yellow-100 p-4 text-sm text-green-950 leading-6">
          최근 설문 결과는 {scentMeta[result.topType].ko} 계열입니다. 현재
          제품의 향 계열과 비교해 취향 적합도를 확인해보세요.
        </div>
      )}
    </section>
  );
}

function ChatbotScreen({ result }) {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    {
      role: "ai",
      text: "안녕하세요. 원하는 분위기나 사용 상황을 알려주시면 향수를 추천해드릴게요.",
    },
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const userMessage = { role: "user", text: message };
    const aiMessage = {
      role: "ai",
      text: result
        ? `최근 결과가 ${scentMeta[result.topType].ko} 계열이므로, ${
            scentMeta[result.topType].mood
          }을 중심으로 추천드릴 수 있습니다. 데일리용이라면 부담 없는 제품부터 살펴보세요.`
        : "아직 설문 결과가 없어 일반 추천만 가능합니다. 먼저 취향 테스트를 진행하면 더 알맞은 추천을 받을 수 있습니다.",
    };

    setChat((prev) => [...prev, userMessage, aiMessage]);
    setMessage("");
  };

  return (
    <section className="pt-5 space-y-5">
      <SectionTitle title="AI 챗봇" subtitle="상황별 향수 추천을 물어보세요." />

      <div className="space-y-3">
        {chat.map((item, index) => (
          <div
            key={index}
            className={`max-w-[85%] rounded-[12px] p-3 text-sm leading-6 ${
              item.role === "ai"
                ? "bg-white border border-green-100 text-stone-600"
                : "bg-green-900 text-white ml-auto"
            }`}
          >
            {item.text}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {["출근용 추천", "데이트용 추천", "선물용 추천", "여름 향수"].map(
          (text) => (
            <button
              key={text}
              onClick={() => setMessage(text)}
              className="h-10 rounded-[12px] bg-yellow-100 text-green-900 text-sm font-bold"
            >
              {text}
            </button>
          )
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="예: 출근할 때 쓰기 좋은 향수"
          className="flex-1 h-12 rounded-[12px] bg-white border border-green-100 px-4 text-sm outline-none"
        />
        <button
          onClick={sendMessage}
          className="w-14 h-12 rounded-[12px] bg-green-900 text-white font-bold"
        >
          전송
        </button>
      </div>
    </section>
  );
}

function MyPageScreen({
  result,
  history,
  favorites,
  toggleFavorite,
  onRestart,
  onSelectPerfume,
}) {
  const favoritePerfumes = perfumeData.filter((item) =>
    favorites.includes(item.id)
  );

  return (
    <section className="pt-5 space-y-5">
      <SectionTitle
        title="마이페이지"
        subtitle="나의 취향 결과와 찜한 향수를 확인해요."
      />

      <div className="rounded-[12px] bg-green-900 text-white p-5">
        <p className="text-sm text-green-100">나의 최근 향 취향</p>
        <h2 className="text-2xl font-bold mt-2">
          {result ? scentMeta[result.topType].ko : "아직 결과 없음"}
        </h2>
        <p className="text-sm text-green-100 mt-2">
          {result ? `${result.date} 테스트 완료` : "테스트를 진행해보세요."}
        </p>
      </div>

      <button
        onClick={onRestart}
        className="w-full h-12 rounded-[12px] bg-yellow-300 text-green-950 font-bold"
      >
        다시 테스트하기
      </button>

      <div className="rounded-[12px] bg-white border border-green-100 p-4">
        <h3 className="font-bold text-green-950 mb-3">이전 테스트 결과</h3>
        {history.length > 0 ? (
          <div className="space-y-2">
            {history.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{scentMeta[item.topType].ko}</span>
                <span className="text-stone-400">{item.date}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-stone-400">저장된 결과가 없습니다.</p>
        )}
      </div>

      <div>
        <h3 className="font-bold text-green-950 mb-3">찜한 향수</h3>
        <div className="space-y-3">
          {favoritePerfumes.map((perfume) => (
            <PerfumeCard
              key={perfume.id}
              perfume={perfume}
              isFavorite
              toggleFavorite={toggleFavorite}
              onSelect={() => onSelectPerfume(perfume)}
            />
          ))}

          {favoritePerfumes.length === 0 && (
            <div className="rounded-[12px] bg-white border border-stone-200 p-5 text-center text-sm text-stone-400">
              아직 찜한 향수가 없습니다.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function PerfumeCard({ perfume, isFavorite, toggleFavorite, onSelect }) {
  const meta = scentMeta[perfume.type];

  return (
    <div className="rounded-[12px] bg-white border border-green-100 p-4 shadow-sm">
      <div className="flex gap-3">
        <div
          className={`w-14 h-14 rounded-[12px] ${meta.color} flex items-center justify-center text-2xl`}
        >
          {meta.emoji}
        </div>

        <div className="flex-1">
          <p className="text-xs text-stone-400">{perfume.brand}</p>
          <h3 className="font-bold text-green-950 leading-5">{perfume.name}</h3>
          <p className="text-xs text-stone-500 mt-1">
            {meta.ko} · {perfume.priceRange} · {perfume.price}
          </p>
        </div>

        <button
          onClick={() => toggleFavorite(perfume.id)}
          className={`w-9 h-9 rounded-[12px] ${
            isFavorite
              ? "bg-yellow-300 text-green-950"
              : "bg-stone-100 text-stone-400"
          }`}
        >
          {isFavorite ? "♥" : "♡"}
        </button>
      </div>

      <p className="text-sm text-stone-600 leading-6 mt-3">
        {perfume.description}
      </p>

      <button
        onClick={onSelect}
        className="mt-3 w-full h-10 rounded-[12px] bg-green-50 text-green-800 text-sm font-bold"
      >
        AI 상세 설명 보기
      </button>
    </div>
  );
}

function ScoreBars({ scores }) {
  const maxScore = Math.max(...Object.values(scores));

  return (
    <div className="rounded-[12px] bg-white border border-green-100 p-4">
      <h3 className="font-bold text-green-950 mb-4">향 계열 점수</h3>
      <div className="space-y-3">
        {Object.entries(scores).map(([key, value]) => {
          const meta = scentMeta[key];
          const width = Math.round((value / maxScore) * 100);

          return (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-bold text-stone-700">
                  {meta.emoji} {meta.ko}
                </span>
                <span className="text-stone-500">{value}점</span>
              </div>
              <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-700 rounded-full"
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FilterChips({ label, options, value, onChange, scent = false }) {
  return (
    <div>
      <p className="text-xs font-bold text-stone-500 mb-2">{label}</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {options.map((option) => {
          const display =
            scent && option !== "전체" ? scentMeta[option].ko : option;

          return (
            <button
              key={option}
              onClick={() => onChange(option)}
              className={`shrink-0 px-3 h-9 rounded-[12px] text-sm font-bold border ${
                value === option
                  ? "bg-green-900 text-white border-green-900"
                  : "bg-white text-stone-500 border-stone-200"
              }`}
            >
              {display}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="rounded-[12px] bg-white border border-green-100 p-4">
      <div className="text-2xl mb-2">{icon}</div>
      <p className="font-bold text-green-950">{title}</p>
      <p className="text-xs text-stone-500 mt-1">{desc}</p>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-stone-400">{label}</span>
      <span className="text-stone-700 font-medium text-right">{value}</span>
    </div>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-green-950">{title}</h2>
      <p className="text-sm text-stone-500 mt-1">{subtitle}</p>
    </div>
  );
}

function EmptyState({ title, desc, buttonText, onClick }) {
  return (
    <div className="pt-32 text-center">
      <div className="text-5xl mb-4">🌿</div>
      <h2 className="text-xl font-bold text-green-950">{title}</h2>
      <p className="text-sm text-stone-500 mt-2 leading-6">{desc}</p>
      <button
        onClick={onClick}
        className="mt-5 w-full h-12 rounded-[12px] bg-green-900 text-white font-bold"
      >
        {buttonText}
      </button>
    </div>
  );
}

function BottomNavigation({ activeTab, setActiveTab }) {
  const navItems = [
    { key: "home", label: "홈", icon: "🏠" },
    { key: "recommend", label: "추천", icon: "💛" },
    { key: "chatbot", label: "챗봇", icon: "🤖" },
    { key: "mypage", label: "마이페이지", icon: "👤" },
  ];

  return (
    <nav className="absolute bottom-0 left-0 right-0 h-[70px] bg-white border-t border-green-100 flex justify-around items-center">
      {navItems.map((item) => {
        const isActive = activeTab === item.key;

        return (
          <button
            key={item.key}
            onClick={() => setActiveTab(item.key)}
            className={`flex flex-col items-center gap-1 text-xs font-bold ${
              isActive ? "text-green-900" : "text-stone-400"
            }`}
          >
            <span
              className={`w-9 h-9 rounded-[12px] flex items-center justify-center ${
                isActive ? "bg-yellow-300" : "bg-transparent"
              }`}
            >
              {item.icon}
            </span>
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

export default App;
