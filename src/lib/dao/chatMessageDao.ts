import { Model, Schema, model } from "mongoose";
import { ChatMessage } from "../models";
import { MongodbService } from "../services";

export class ChatMessageDao {
  private static schemaName: string = "chatMessage";
  private static chatMessageSchema: Schema<ChatMessage>;
  public static chatMessageModel: Model<ChatMessage>;

  private constructor() {}

  public static async initInstance() {
    await MongodbService.initInstance();

    if (!ChatMessageDao.chatMessageSchema) {
      ChatMessageDao.chatMessageSchema = new Schema(
        {
          message: { type: Schema.Types.Mixed, required: true },
        },
        {
          timestamps: true,
          // expireAfterSeconds: 43200,
          expireAfterSeconds: 30,
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
}
