import { APIGatewayEvent, Callback, Context } from "aws-lambda";
import { OK, BAD_REQUEST, UNAUTHORIZED } from "http-status";
import { TelegramService } from "../../lib/services";
import { UserDao } from "../../lib/dao";
import { FormattingOptionsTg } from "../../lib/models";

interface PublicWebhookParams {
  chat_id: number | string;
  text?: string;
  photo?: string;
  video?: string;
  text_is_spoiler?: boolean;
  media_is_spoiler?: boolean;
}

const checkAuthorization = async (event: APIGatewayEvent) => {
  if (
    !event?.queryStringParameters?.id ||
    !event?.queryStringParameters?.username
  ) {
    return false;
  }

  const { id, username } = event?.queryStringParameters;

  await UserDao.initInstance();

  try {
    const user = await UserDao.findByIdAndUsername(id, username);
    return Boolean(user);
  } catch (_error) {
    return false;
  }
};

const buildText = (body: PublicWebhookParams): string | undefined => {
  if (!body?.text) {
    return;
  }

  return body?.text_is_spoiler
    ? `<tg-spoiler>${body.text}</tg-spoiler>`
    : body.text;
};

const sendToChat = async (body: PublicWebhookParams): Promise<any | null> => {
  if (body?.photo) {
    const { data } = await TelegramService.sendPhoto({
      chat_id: body.chat_id,
      photo: body.photo,
      caption: buildText(body),
      has_spoiler: body?.media_is_spoiler,
      parse_mode: FormattingOptionsTg.HTML,
    });
    return data;
  }

  if (body?.video) {
    const { data } = await TelegramService.sendVideo({
      chat_id: body.chat_id,
      video: body.video,
      caption: buildText(body),
      has_spoiler: body?.media_is_spoiler,
      parse_mode: FormattingOptionsTg.HTML,
    });
    return data;
  }

  if (body?.text) {
    const { data } = await TelegramService.sendMessage({
      chat_id: body.chat_id,
      text: body?.text_is_spoiler
        ? `<tg-spoiler>${body.text}</tg-spoiler>`
        : body.text,
      has_spoiler: body?.media_is_spoiler,
      parse_mode: FormattingOptionsTg.HTML,
    });
    return data;
  }

  return null;
};

const execute = async (
  body: PublicWebhookParams
): Promise<{ statusCode: number; body?: string }> => {
  if (!body?.chat_id) {
    return {
      statusCode: BAD_REQUEST,
      body: JSON.stringify({ error: "chat_id is missing" }),
    };
  }

  if (!body?.text && !body?.photo && !body?.video) {
    return {
      statusCode: BAD_REQUEST,
      body: JSON.stringify({ error: "all params is missing" }),
    };
  }

  if (body?.photo && body?.video) {
    return {
      statusCode: BAD_REQUEST,
      body: JSON.stringify({ error: "too many params" }),
    };
  }

  if (body?.media_is_spoiler && typeof body?.media_is_spoiler !== "boolean") {
    return {
      statusCode: BAD_REQUEST,
      body: JSON.stringify({ error: "media_is_spoiler param is not boolean" }),
    };
  }

  if (body?.text_is_spoiler && typeof body?.text_is_spoiler !== "boolean") {
    return {
      statusCode: BAD_REQUEST,
      body: JSON.stringify({ error: "text_is_spoiler param is not boolean" }),
    };
  }

  TelegramService.initInstance();
  const sendMessageResponse = await sendToChat(body);
  if (!sendMessageResponse) {
    return {
      statusCode: BAD_REQUEST,
      body: JSON.stringify({ error: "text param is missing" }),
    };
  }

  return { statusCode: OK, body: JSON.stringify(sendMessageResponse) };
};

export const telegramPublicWebhook = async (
  event: APIGatewayEvent,
  context: Context,
  callback: Callback
): Promise<void> => {
  context.callbackWaitsForEmptyEventLoop = false;

  const checkAuth = await checkAuthorization(event);
  if (!checkAuth) {
    return callback(null, { statusCode: UNAUTHORIZED });
  }

  if (!event?.body) {
    return callback(null, { statusCode: BAD_REQUEST });
  }

  const body = JSON.parse(event?.body);
  const response = await execute(body);
  return callback(null, response);
};
