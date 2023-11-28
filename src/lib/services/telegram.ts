import axios, { AxiosResponse, AxiosInstance } from "axios";
import { EntityTg, UserTg, FormattingOptionsTg } from "../models";
import { MessageTg } from "../models/telegram";

const { TELEGRAM_BOT_TOKEN } = process.env;

interface SetWebhookResponse {
  ok: boolean;
  result: boolean;
  description: string;
}

interface GetWebhookInfoResponse {
  ok: boolean;
  result: {
    url: string;
    has_custom_certificate: boolean;
    pending_update_count: number;
    max_connections: number;
    ip_address: string;
  };
}

export interface SendMessageParams {
  chat_id: number | string;
  text: string;
  message_thread_id?: number;
  parse_mode?: FormattingOptionsTg;
  entities?: Array<EntityTg>;
  protect_content?: boolean;
  reply_to_message_id?: number;
  reply_markup?: any;
}

export interface SendPhotoParams {
  chat_id: number | string;
  photo: string;
  caption?: string;
  parse_mode?: FormattingOptionsTg;
  caption_entities?: Array<EntityTg>;
  reply_to_message_id?: number;
  allow_sending_without_reply?: boolean;
  protect_content?: boolean;
  reply_markup?: any;
}

export interface EditMessageReplyMarkupParams {
  chat_id: number | string;
  message_id: number | string;
  reply_markup: {
    inline_keyboard: Array<any>;
  };
}

interface SendMessageResponse {
  ok: boolean;
  result: {
    message_id: number;
    message_thread_id: number;
    from: UserTg;
    sender_chat: any;
    date: number;
    entities: Array<EntityTg>;
  };
}

interface GetChatResponse {
  ok: boolean;
  result: {
    id: number | string;
    title: string;
    username: string;
    type: string;
  };
}

interface GetChatMemberResponse {
  ok: boolean;
  result: {
    user: UserTg;
    status: string;
    is_anonymous: boolean;
  };
}

interface EditMessageReplyMarkupResponse {
  ok: boolean;
  result: MessageTg;
}

export class TelegramService {
  private static instance: AxiosInstance;

  private constructor() {}

  public static initInstance(): void {
    if (!this.instance) {
      this.instance = axios.create({
        baseURL: `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`,
      });
    }
  }

  public static setWebhook(
    url: string
  ): Promise<AxiosResponse<SetWebhookResponse>> {
    return TelegramService.instance.post("/setWebhook", { url });
  }

  public static getWebhookInfo(): Promise<
    AxiosResponse<GetWebhookInfoResponse>
  > {
    return TelegramService.instance.get("/getWebhookInfo");
  }

  public static sendMessage(
    params: SendMessageParams
  ): Promise<AxiosResponse<SendMessageResponse>> {
    return TelegramService.instance.post("/sendMessage", params);
  }

  public static sendPhoto(
    params: SendPhotoParams
  ): Promise<AxiosResponse<SendMessageResponse>> {
    return TelegramService.instance.post("/sendPhoto", params);
  }

  public static getChat(
    chatId: number | string
  ): Promise<AxiosResponse<GetChatResponse>> {
    return TelegramService.instance.get("/getChat", {
      params: { chat_id: chatId },
    });
  }

  public static getChatMember(
    chatId: number | string,
    userId: number | string
  ): Promise<AxiosResponse<GetChatMemberResponse>> {
    return TelegramService.instance.get("/getChatMember", {
      params: { chat_id: chatId, user_id: userId },
    });
  }

  public static editMessageReplyMarkup(
    params: EditMessageReplyMarkupParams
  ): Promise<AxiosResponse<EditMessageReplyMarkupResponse>> {
    return TelegramService.instance.post("/editMessageReplyMarkup", params);
  }
}
