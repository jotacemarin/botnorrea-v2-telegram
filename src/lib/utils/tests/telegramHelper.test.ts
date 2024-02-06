import { EntityTypeTg, UpdateTg } from "../../models";
import { getTextCommand } from "../telegramHelper";

describe("Write unit test to getTextCommand", () => {
  it("return the command if text contains it", () => {
    const command: string = "/debug";
    const body: UpdateTg = {
      update_id: 262661470,
      message: {
        message_id: 154,
        from: {
          id: 1346557085,
          is_bot: false,
          first_name: "Oleg",
          last_name: "Marino",
          username: "popeye",
          language_code: "en",
        },
        chat: {
          id: 1346557085,
          type: "private",
        },
        date: 1699730820,
        text: `${command} teste the test`,
        entities: [{ offset: 0, length: 6, type: EntityTypeTg.BOT_COMMAND }],
      },
    };
    expect(getTextCommand(body)).toEqual(command);
  });

  it("return null when text does not include the command ", () => {
    const body: UpdateTg = {
      update_id: 262661470,
      message: {
        message_id: 154,
        from: {
          id: 1346557085,
          is_bot: false,
          first_name: "Oleg",
          last_name: "Marino",
          username: "popeye",
          language_code: "en",
        },
        chat: {
          id: 1346557085,
          type: "private",
        },
        date: 1699730820,
        text: `teste the test`,
        entities: [],
      },
    };
    expect(getTextCommand(body)).toBeNull();
  });

  it("return null if text contains a command but not at begining", () => {
    const command: string = "/debug";
    const body: UpdateTg = {
      update_id: 262661470,
      message: {
        message_id: 154,
        from: {
          id: 1346557085,
          is_bot: false,
          first_name: "Oleg",
          last_name: "Marino",
          username: "popeye",
          language_code: "en",
        },
        chat: {
          id: 1346557085,
          type: "private",
        },
        date: 1699730820,
        text: `hi ${command} teste the test`,
        entities: [{ offset: 3, length: 6, type: EntityTypeTg.BOT_COMMAND }],
      },
    };
    expect(getTextCommand(body)).toBeNull();
  });
});
