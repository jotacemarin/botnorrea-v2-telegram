import { Model, Schema, model } from "mongoose";
import { ChatMessage } from "../models";
import { MongodbService } from "../services";

export class ChatMessageDao {
  private static schemaName: string = "chat_message";
  private static chatMessageSchema: Schema<ChatMessage>;
  public static chatMessageModel: Model<ChatMessage>;

  private constructor() {}

  public static async initInstance() {
    await MongodbService.initInstance();

    if (!ChatMessageDao.chatMessageSchema) {
      ChatMessageDao.chatMessageSchema = new Schema(
        {
          telegramMessage: { type: Schema.Types.Mixed, required: true },
          expireAt: { type: Schema.Types.Date, expires: 43200 },
        },
        {
          timestamps: true,
          expireAfterSeconds: 43200,
        }
      );
    }

    if (!ChatMessageDao.chatMessageModel) {
      ChatMessageDao.chatMessageModel = model(
        ChatMessageDao.schemaName,
        ChatMessageDao.chatMessageSchema
      );
    }
  }

  public static async save(
    chatMessage: ChatMessage
  ): Promise<ChatMessage | null> {
    return ChatMessageDao.chatMessageModel.create(chatMessage);
  }

  public static async getAll(chatId: Number): Promise<Array<ChatMessage>> {
    const chatMessages = await ChatMessageDao.chatMessageModel
      .find({ "telegramMessage.message.chat.id": chatId })
      .exec();
    if (!chatMessages || !chatMessages?.length) {
      return [];
    }

    return chatMessages;
  }
}
