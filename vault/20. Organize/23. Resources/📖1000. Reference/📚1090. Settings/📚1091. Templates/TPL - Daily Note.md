<%*
// --- 날씨 선택 로직 (선택/취소 기능 추가) ---
const weatherOptions = ["☀️ 맑음", "⛅️ 구름", "🌧️ 비", "⛈️ 천둥", "❄️ 눈", "🌫️ 안개", "완료"];
let displayWeatherOptions = [...weatherOptions]; // 표시될 옵션 배열 (초기 상태 복사)
let weatherResponses = []; // 실제 선택된 값 저장 배열 (예: "☀️ 맑음")
let selectedWeather;

while (true) { // "완료" 또는 취소 시 종료되도록 변경
  selectedWeather = await tp.system.suggester(displayWeatherOptions, displayWeatherOptions); // 표시 옵션과 반환값을 동일하게 설정

  if (!selectedWeather) { // 사용자가 취소(Esc 등)한 경우
    break;
  }

  if (selectedWeather === "완료") { // 사용자가 "완료"를 선택한 경우
    break;
  }

  const isAlreadySelected = selectedWeather.startsWith("✅ ");
  const actualOptionText = isAlreadySelected ? selectedWeather.substring(2) : selectedWeather;
  const indexInOriginal = weatherOptions.indexOf(actualOptionText); // 원본 옵션에서의 인덱스

  if (indexInOriginal > -1 && indexInOriginal < weatherOptions.length -1) { // "완료" 제외 유효한 옵션인지 확인
    const displayIndex = displayWeatherOptions.indexOf(selectedWeather); // 현재 표시되는 옵션에서의 인덱스

     if (isAlreadySelected) {
        // --- Deselection ---
        weatherResponses = weatherResponses.filter(item => item !== actualOptionText);
        displayWeatherOptions[displayIndex] = actualOptionText; // 체크마크 제거
     } else {
        // --- Selection ---
        weatherResponses.push(actualOptionText);
        displayWeatherOptions[displayIndex] = `✅ ${actualOptionText}`; // 체크마크 추가
     }
  }
}
const weatherVal = weatherResponses.map(x => x.split(" ")[0]).join(", ");

// --- 기분(mood) 선택 로직 (기존과 동일) ---
const moodDisplayOptions = ["😃 좋음", "😐 보통", "😞 안 좋음"];
const moodReturnValues = ["😃", "😐", "😞"];
const selectedMood = await tp.system.suggester(moodDisplayOptions, moodReturnValues);
const moodVal = selectedMood || "";

// --- 현재 년도와 월 가져오기 (기존과 동일) ---
const currentYear = tp.date.now("YYYY년");
const currentMonth = tp.date.now("MM월");
// --- 최종 노트 내용 생성 (time 속성 추가) ---
let content = "---\n";
content += `created: ${tp.date.now("YYYY-MM-DD HH:mm:ss")}\n`;
content += `weather: ${weatherVal}\n`;
content += `mood: ${moodVal}\n`;
content += `tags: [daily, ${currentYear}, ${currentMonth}]\n`;
content += "---\n";
content += "## Daily Journal\n\n";
content += "### Workout Journal\n\n";
content += "## Completed / What I Learned\n\n";

tR = content;
%>
