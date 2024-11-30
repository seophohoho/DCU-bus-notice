import axios from "axios";
import * as cheerio from "cheerio";

export const TARGET_1 = "하양역";
export const TARGET_2 = "캠퍼스 정문 출발";

export function validate(req) {
  if (req === TARGET_1) return TARGET_1;
  else if (req === "정문") return TARGET_2;
  else return "";
}

export async function getHtml() {
  try {
    return await axios.get("https://www.cu.ac.kr/life/welfare/schoolbus");
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function parseContent(target) {
  const html = await getHtml();
  if (!html) {
    console.error("Failed to fetch HTML.");
    return [];
  }

  const $ = cheerio.load(html.data);
  const result = [];

  $("h5.c_common_title").each((_, element) => {
    const title = $(element).text().trim();

    if (title.toLowerCase().includes(target.toLowerCase())) {
      const tableRows = $(element)
        .next(".s_common")
        .find(".table_wrapper tbody tr");

      tableRows.each((_, row) => {
        const [label, value] = $(row)
          .find("td")
          .map((_, cell) => $(cell).text().trim())
          .get();

        if (label === "운행노선" || label === "첫정류장출발시간") {
          const formattedValue =
            label === "첫정류장출발시간"
              ? value
                  .split(",")
                  .map((time) => time.trim())
                  .join("\n") + "\n"
              : value;

          result.push(formattedValue);
        }
      });
    }
  });

  return result;
}
