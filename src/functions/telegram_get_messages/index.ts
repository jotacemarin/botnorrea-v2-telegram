import { APIGatewayEvent, Callback, Context } from "aws-lambda";
import { OK } from "http-status";
import { ChatMessageDao } from "../../lib/dao";

const execute = async (): Promise<any> => {
  await ChatMessageDao.initInstance();
  const messages = await ChatMessageDao.getAll();

  return { statusCode: OK, body: JSON.stringify(messages) };
};

export const telegramGetMessages = async (
  event: APIGatewayEvent,
  context: Context,
  callback: Callback
): Promise<void> => {
  context.callbackWaitsForEmptyEventLoop = false;

  const response = await execute();

  return callback(null, response);
};
