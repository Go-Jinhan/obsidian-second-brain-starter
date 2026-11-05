<%*
// --- 사용자 입력 및 날짜/시간 정보 ---
let projectName = (await tp.system.prompt("프로젝트 이름을 입력하세요:") || "").replace(/[\\/:*?"<>|]/g, "-").replace(/[\r\n\t]/g, " ").trim();
if (!projectName) projectName = "무제 프로젝트"; // 입력 없을 시 기본값
const createdDate = tp.date.now("YYYY-MM-DD HH:mm");
const updatedDate = createdDate;
const year = tp.date.now("YYYY년");
const month = tp.date.now("MM월");

// --- 노트 내용 생성 ---
let content = "---\n";
content += `created: ${createdDate}\n`;
content += `updated: ${updatedDate}\n`;
content += `tags: [Project, ${year}, ${month}, note]\n`; // 기본 태그 추가
content += `type: Project\n`;
content += `start_date: ${createdDate.substring(0, 10)}\n`;
content += `end_date: \n`;
content += "---\n\n";
content += `## ${projectName}\n\n`; // 프로젝트 이름을 제목으로 사용
content += "## Twyla Tharp First Memo\n\n"; // 트와일라 타프 섹션
content += "## Project Progress\n\n"; // 프로젝트를 어떻게 진행했는지 적는 섹션
content += "## The Hemingway Bridge\n"; // 허밍웨이 다리 섹션

tR = content;
%>
