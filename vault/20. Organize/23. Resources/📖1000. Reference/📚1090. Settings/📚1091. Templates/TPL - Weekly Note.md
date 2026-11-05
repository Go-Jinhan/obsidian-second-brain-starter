<%*
// --- 날짜 및 태그 계산 ---
const parsedWeek = moment(tp.file.title, "GGGG-[W]WW", true);
const now = parsedWeek.isValid() ? parsedWeek : moment(); // Templater는 moment.js를 내장하고 있습니다.
const weekOfYear = now.format("GGGG-[W]WW"); // ISO 주차 형식 (예: 2024-W30)
const startOfWeek = now.clone().startOf('isoWeek').format("YYYY-MM-DD"); // 해당 주의 월요일
const endOfWeek = now.clone().endOf('isoWeek').format("YYYY-MM-DD"); // 해당 주의 일요일
const dateRange = `${startOfWeek} ~ ${endOfWeek}`; // 날짜 범위 문자열
const currentYear = now.format("YYYY"); // 현재 연도 (예: 2025)
const currentMonth = now.format("MM"); // 현재 월 (예: 05)

// --- 노트 내용 생성 ---
let content = "---\n";
content += `created: ${tp.date.now("YYYY-MM-DD HH:mm")}\n`; // 생성 날짜 추가
content += `week: ${weekOfYear}\n`; // 계산된 주차 삽입
content += `date_range: ${dateRange}\n`; // 계산된 날짜 범위 삽입
content += `tags: [weekly, ${currentYear}, ${currentMonth}]\n`; // 계산된 태그 삽입
content += "focus: \n"; // focus 속성은 비워둠
content += "---\n"; // 속성 블록 종료 후 빈 줄

// --- 본문 내용 추가 ---
content += "## Daily Highlights\n";
content += "- Mon:\n";
content += "- Tue:\n";
content += "- Wed:\n";
content += "- Thu:\n";
content += "- Fri:\n";
content += "- Sat:\n";
content += "- Sun:\n\n";
content += "## Key Insights / Lessons\n\n";
content += "## Highlights / Gratitude\n\n";
content += "## Weekly Review / Feedback\n";
content += "##### - What Went Well\n\n";
content += "##### - What Could Have Been Better\n\n";
content += "##### - Areas for Improvement\n\n";
content += "## Next Week’s Schedule\n\n";
content += "## Next Week’s Goals\n\n";
content += "## Next Week’s To-Dos\n\n";
content += "## Preparation\n"; // 마지막 섹션

tR = content; // 최종 생성된 내용을 Templater에 전달
%>
