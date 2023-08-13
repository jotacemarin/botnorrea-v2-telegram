import { TelegramChat } from "./TelegramChat";
import { TelegramUser } from "./TelegramUser";

export interface TelegramUpdate {
  update_id: number;
  message: {
    message_id: number;
    from: TelegramUser;
    chat: TelegramChat;
    date: number;
    text: string;
  };
}