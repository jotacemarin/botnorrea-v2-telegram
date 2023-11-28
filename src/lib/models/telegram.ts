export enum ChatTypeTg {
  PRIVATE = "private",
  GROUP = "group",
  SUPERGROUP = "supergroup",
}

export enum EntityTypeTg {
  BOT_COMMAND = "bot_command",
}

export enum FormattingOptionsTg {
  MARKDOWN_V2 = "MarkdownV2",
  HTML = "HTML",
  MARKDOWN = "Markdown",
}

export interface ChatTg {
  id: number | string;
  title: string;
  type: ChatTypeTg | string;
  all_members_are_administrators: boolean;
}

export interface UserTg {
  id: number | string;
  is_bot: boolean;
  first_name: string;
  last_name: string;
  username: string;
  language_code: string;
}

export interface EntityTg {
  offset: number;
  length: number;
  type: EntityTypeTg;
}

export interface PhotoSizeTg {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  file_size: number;
}

export interface MessageTg {
  message_id: number;
  from: UserTg;
  chat: ChatTg;
  date: number;
  text: string;
  caption: string;
  entities?: Array<EntityTg>;
  caption_entities?: Array<EntityTg>;
  reply_to_message: MessageTg;
  photo: Array<PhotoSizeTg>;
}

export interface UpdateTg {
  update_id: number;
  message?: MessageTg;
  callback_query?: {
    id: string;
    from: UserTg;
    message: MessageTg;
    chat_instance: string;
    data: string;
  };
}
