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
  reply_markup?: {
    inline_keyboard: Array<any>;
  };
  has_spoiler?: boolean;
}

export interface EditMessageParams {
  chat_id: number | string;
  message_id: number | string;
  text: string;
  message_thread_id?: number;
  parse_mode?: FormattingOptionsTg;
  entities?: Array<EntityTg>;
  protect_content?: boolean;
  reply_to_message_id?: number;
  reply_markup?: {
    inline_keyboard: Array<any>;
  };
  has_spoiler?: boolean;
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
  reply_markup?: {
    inline_keyboard: Array<any>;
  };
  has_spoiler?: boolean;
}

export interface SendVideoParams {
  chat_id: number | string;
  video: string;
  caption?: string;
  parse_mode?: FormattingOptionsTg;
  caption_entities?: Array<EntityTg>;
  reply_to_message_id?: number;
  allow_sending_without_reply?: boolean;
  protect_content?: boolean;
  reply_markup?: {
    inline_keyboard: Array<any>;
  };
  has_spoiler?: boolean;
}

export interface EditMessageReplyMarkupParams {
  chat_id: number | string;
  message_id: number | string;
  reply_markup: {
    inline_keyboard: Array<any>;
  };
}

interface ChatPermissions {
  can_send_messages: boolean;
  can_send_audios: boolean;
  can_send_documents: boolean;
  can_send_photos: boolean;
  can_send_videos: boolean;
  can_send_video_notes: boolean;
  can_send_voice_notes: boolean;
  can_send_polls: boolean;
  can_send_other_messages: boolean;
  can_add_web_page_previews: boolean;
  can_change_info: boolean;
  can_invite_users: boolean;
  can_pin_messages: boolean;
  can_manage_topics: boolean;
}

export interface RestrictChatMemberParams {
  chat_id: number | string;
  user_id: number | string;
  permissions: ChatPermissions;
  until_date?: number;
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

  public static editMessage(
    params: EditMessageParams
  ): Promise<AxiosResponse<SendMessageResponse>> {
    return TelegramService.instance.post("/editMessageText", params);
  }

  public static sendPhoto(
    params: SendPhotoParams
  ): Promise<AxiosResponse<SendMessageResponse>> {
    return TelegramService.instance.post("/sendPhoto", params);
  }

  public static sendVideo(
    params: SendVideoParams
  ): Promise<AxiosResponse<SendMessageResponse>> {
    return TelegramService.instance.post("/sendVideo", params);
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

  public static async restrictChatMember(
    params: RestrictChatMemberParams
  ): Promise<AxiosResponse<{ ok: boolean; result: boolean }>> {
    return TelegramService.instance.post("/restrictChatMember", params);
  }
}
