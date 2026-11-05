<%*
// 월간 노트 제목(YYYY-MM)을 우선하고, 그 외에는 현재 달을 사용한다.
const parsedMonth = moment(tp.file.title, "YYYY-MM", true);
const targetMonth = parsedMonth.isValid() ? parsedMonth : moment();
const monthKey = targetMonth.format("YYYY-MM");
const startDate = targetMonth.clone().startOf("month").format("YYYY-MM-DD");
const endDate = targetMonth.clone().endOf("month").format("YYYY-MM-DD");
let content = "---\n";
content += `created: ${tp.date.now("YYYY-MM-DD HH:mm")}\n`;
content += `month: ${monthKey}\n`;
content += `date_range: ${startDate} ~ ${endDate}\n`;
content += `tags: [monthly, ${targetMonth.format("YYYY")}년, ${targetMonth.format("MM")}월]\n`;
content += "focus: \n---\n\n";
content += "## Monthly Highlights\n\n";
content += "## Weekly Summary\n\n";
content += "| Period | Main Work | Weekly Note |\n";
content += "|---|---|---|\n";
tR = content;
%>
