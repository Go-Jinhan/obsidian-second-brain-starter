<%*
// --- 타입 선택 로직 ---
const textItems = ["💡 Idea", "📄 Reference", "📓 Book", "📦 Project"];
const valueItems = ["Idea", "Reference", "Book", "Project"];
const selectedType = await tp.system.suggester(textItems, valueItems);
const typeVal = selectedType || "";

// 사용자가 선택을 취소하면 스크립트 중단 (파일 생성은 계속됨)
if (!typeVal) {
  new Notice("타입 선택이 취소되었습니다. 파일 이동이 실행되지 않습니다.");
  // 기본 내용만 생성하고 종료하기 위해 tR 설정
  let content = "---\n";
  content += `created: ${tp.date.now("YYYY-MM-DD HH:mm")}\n`;
  content += `updated: ${tp.file.last_modified_date("YYYY-MM-DD HH:mm")}\n`;
  content += `tags: [note, ${tp.date.now("YYYY년")}, ${tp.date.now("MM월")}]\n`;
  content += `type: \n`; // 타입은 비워둠
  content += "---\n\n> [!abstract] Distill(추출, 요약)\n";
  content += "> -\n";
  tR = content;
  return; // 스크립트 실행 중단
}

// --- 추가 명칭 입력 및 변수 정의 ---
let newFileName = tp.file.title;
let projectNameInput = "";
let bookNameInput = "";
let bookStatusInput = "";
let bookRatingInput = "";

if (typeVal === "Project") {
  projectNameInput = (await tp.system.prompt("프로젝트 이름을 입력하세요:") || "").replace(/[\\/:*?"<>|]/g, "-").replace(/\[\[|\]\]/g, "").replace(/[\r\n\t]/g, " ").trim();
  newFileName = `📦P-${projectNameInput || "Untitled Project"}`;
} else if (typeVal === "Book") {
  bookNameInput = (await tp.system.prompt("책 제목을 입력하세요:") || "").replace(/[\\/:*?"<>|]/g, "-").replace(/\[\[|\]\]/g, "").replace(/[\r\n\t]/g, " ").trim();
  newFileName = `📓B-${bookNameInput || "Untitled Book"}`;

  // status 선택창 (이모지 포함 리스트)
  const statusLabels = ["📖 Reading (읽는 중)", "✅ Completed (완독)", "💤 Paused (독서 중단)", "📌 To Read (읽을 예정)"];
  const statusValues = ["📖Reading", "✅Completed", "💤Paused", "📌ToRead"];
  const selectedStatus = await tp.system.suggester(statusLabels, statusValues);
  bookStatusInput = selectedStatus || "📖Reading";

  // rating 선택창
  const ratingLabels = ["⭐⭐⭐⭐⭐ (5점)", "⭐⭐⭐⭐ (4점)", "⭐⭐⭐ (3점)", "⭐⭐ (2점)", "⭐ (1점)", "선택 안함"];
  const ratingValues = ["⭐⭐⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐", "⭐⭐", "⭐", ""];
  const selectedRating = await tp.system.suggester(ratingLabels, ratingValues);
  bookRatingInput = selectedRating || "";
}

// --- 최종 노트 내용 생성 ---
let content = "---\n";

// 타입별 메타데이터 레이아웃 조립 (위쪽 배치할 핵심 데이터)
if (typeVal === "Book") {
  content += `book_title: "${bookNameInput || ""}"\n`;
  content += `author: \n`;
  content += `status: "${bookStatusInput}"\n`;
  content += `start_date: ${tp.date.now("YYYY-MM-DD")}\n`;
  content += `finish_date: \n`;
  content += `total_page: \n`;
  content += `rating: "${bookRatingInput}"\n`;
  content += `publish_date: \n`;
  content += `category: \n`;
  content += `cover_url: \n`;
  content += `key_takeaway: \n`;

  // reference 행 추가 및 구매처 검색 링크 자동 조립 (순수 URL)
  content += `reference:\n`;
  if (bookNameInput) {
    const encodedName = encodeURIComponent(bookNameInput);
    content += `  - "https://search.kyobobook.co.kr/search?keyword=${encodedName}"\n`;
    content += `  - "http://www.yes24.com/Product/Search?domain=ALL&query=${encodedName}"\n`;
    content += `  - "https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=${encodedName}"\n`;
  } else {
    content += `  - \n`;
  }
} else if (typeVal === "Project") {
  content += `start_date: ${tp.date.now("YYYY-MM-DD")}\n`;
  content += `end_date: \n`;
}

// 공통 관리형 메타데이터 (아래쪽 배치할 데이터)
content += `created: ${tp.date.now("YYYY-MM-DD HH:mm")}\n`;
content += `updated: ${tp.file.last_modified_date("YYYY-MM-DD HH:mm")}\n`;

if (typeVal === "Book") {
  content += `tags: [note, ${tp.date.now("YYYY년")}, ${tp.date.now("MM월")}, 📚독서]\n`;
} else {
  content += `tags: [note, ${tp.date.now("YYYY년")}, ${tp.date.now("MM월")}]\n`;
}

content += `type: ${typeVal}\n`;
if (typeVal === "Reference") {
  content += "source:\n  - \n"; // 목록 형태로 추가
}

content += "---\n";

// 타입별 본문 구성
if (typeVal === "Project") {
  content += `## ${projectNameInput || "Untitled Project"}\n\n`;
  content += `## Twyla Tharp First Memo\n\n`;
  content += `## Project Progress\n\n`;
  content += `## The Hemingway Bridge\n`;
} else if (typeVal === "Book") {
  content += `## 📓 책 소개\n`;
  content += `- **읽게 된 계기:** \n`;
  content += `- **한 줄 요약:** \n\n`;
  content += `## 🧠 핵심 생각 & 제텔카스텐 (Zettelkasten)\n`;
  content += `> [!note] 이 책에서 파생된 핵심 생각이나 챕터별 상세 노트를 연결합니다.\n`;
  content += `- \n\n`;
  content += `## 📝 책 속 핵심 문장 & 개인적 기록\n`;
  content += `- \n\n`;
  content += `## 📋 목차\n`;
  content += `- \n`;
} else {
  content += `> [!abstract] Distill(추출, 요약)\n`;
  content += `> -\n`;
}

// 먼저 파일 내용을 채웁니다.
tR = content;

// --- 파일 이동 로직 ---
let targetFolderPath = "";

if (typeVal === "Idea") {
  // 대상 폴더 경로 (Vault 루트 기준)
  targetFolderPath = "10. Capture/11. Zettelkasten-FleetingNotes";
} else if (typeVal === "Reference") {
  // 대상 폴더 경로 (Vault 루트 기준)
  targetFolderPath = "10. Capture/12. Zettelkasten-ReferenceNotes";
} else if (typeVal === "Book") {
  // 대상 폴더 경로 (Vault 루트 기준)
  targetFolderPath = "20. Organize/23. Resources/📖500. Humanities and Knowledge/📚501. Books";
} else if (typeVal === "Project") {
  // 대상 폴더 경로 (Vault 루트 기준)
  targetFolderPath = "20. Organize/21. 📦Projects";
}

// 대상 폴더가 지정되었는지 확인 후 파일 이동 실행
if (targetFolderPath) {
  // 만약 Book이나 Project 타입이라면 하위 폴더 생성 처리
  let finalFolderPath = targetFolderPath;
  if (typeVal === "Book" && bookNameInput) {
    finalFolderPath = `${targetFolderPath}/📓B-${bookNameInput}`;
  } else if (typeVal === "Project" && projectNameInput) {
    finalFolderPath = `${targetFolderPath}/📦P-${projectNameInput}`;
  }

  // 폴더가 존재하지 않으면 생성
  if (finalFolderPath !== targetFolderPath) {
    const folderExists = await app.vault.adapter.exists(finalFolderPath);
    if (!folderExists) {
      await app.vault.createFolder(finalFolderPath);
    }
  }

  // tp.file.move가 확장자를 자동으로 붙이므로 이동 경로에는 확장자를 넣지 않습니다.
  let newPath = `${finalFolderPath}/${newFileName}`;
  let counter = 1;

  // 파일이 이미 존재하는 경우, 파일 이름에 숫자를 추가하여 중복을 피합니다.
  while (await tp.file.exists(`${newPath}.md`)) {
    newPath = `${finalFolderPath}/${newFileName} (${counter})`;
    counter++;
  }

  try {
    // 파일을 새 경로로 이동
    await tp.file.move(newPath);
    new Notice(`파일이 ${finalFolderPath} 폴더로 이동되었습니다.`);
  } catch (error) {
    new Notice(`파일 이동 중 오류 발생: ${error}`, 10000); // 오류 메시지 표시 (10초)
    console.error("File move error:", error);
  }
}
%>
