import axios, { AxiosResponse, AxiosInstance } from "axios";
import { EntityTg, UserTg, FormattingOptionsTg } from "../models";

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
  message_id: number;
  message_thread_id: number;
  from: UserTg;
  sender_chat: any;
  date: number;
  entities: Array<EntityTg>;
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

  public static async restrictChatMember(
    params: RestrictChatMemberParams
  ): Promise<AxiosResponse<{ ok: boolean; result: boolean }>> {
    return TelegramService.instance.post("/restrictChatMember", params);
  }
}
