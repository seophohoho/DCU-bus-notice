import express from "express";
import { parseContent, validate } from "./func.js";

const app = express();
const port = 3000;
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.post("/info", async (req, res) => {
  const reqTitle = validate(req.body.userRequest.utterance);

  if (reqTitle.length === 0) {
    const data = {
      version: "2.0",
      template: {
        outputs: [
          {
            simpleText: {
              text: "뭐라는지 모르겠네요 :) 다시 입력해주세요",
            },
          },
        ],
      },
    };
    res.json(data);
    return;
  }

  const info = await parseContent(reqTitle);

  const data = {
    version: "2.0",
    template: {
      outputs: [
        {
          textCard: {
            title: `${reqTitle}에서 출발하는 교내 순환 버스 정보입니다.`,
            description:
              "<운행노선>\n" + info[0] + "\n\n<첫정류장출발시간>\n" + info[1],
          },
        },
      ],
    },
  };
  res.json(data);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
