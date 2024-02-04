import { APIGatewayEvent, Callback, Context } from "aws-lambda";
import { OK, BAD_REQUEST } from "http-status";
import { SendVideoParams, TelegramService } from "../../lib/services";

const execute = async (
  body: SendVideoParams
): Promise<{ statusCode: number; body?: string }> => {
  if (!body?.chat_id) {
    return {
      statusCode: BAD_REQUEST,
      body: JSON.stringify({ error: "chat_id is missing" }),
    };
  }

  TelegramService.initInstance();
  try {
    const sendMessageResponse = await TelegramService.sendVideo(body);

    return { statusCode: OK, body: JSON.stringify(sendMessageResponse?.data) };
  } catch (error) {
    console.log(error);
  }
  return { statusCode: OK };
};

export const telegramSendVideo = async (
  event: APIGatewayEvent,
  context: Context,
  callback: Callback
): Promise<void> => {
  context.callbackWaitsForEmptyEventLoop = false;

  if (!event?.body) {
    return callback(null, { statusCode: BAD_REQUEST });
  }

  const body = JSON.parse(event?.body);
  const response = await execute(body);
  return callback(null, response);
};
