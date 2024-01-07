import { APIGatewayEvent, Callback, Context } from "aws-lambda";
import { OK, BAD_REQUEST, NOT_FOUND } from "http-status";
import dayjs from "dayjs";
import { TelegramService } from "../../lib/services/telegram";
import { FormattingOptionsTg, UpdateTg, User } from "../../lib/models";
import { getTextCommand } from "../../lib/utils/telegramHelper";
import { UserDao } from "../../lib/dao/userDao";

const sendMessage = async (body: UpdateTg, text: string): Promise<void> => {
  TelegramService.initInstance();

  await TelegramService.sendMessage({
    chat_id: body?.message!.chat?.id,
    reply_to_message_id: body?.message?.message_id,
    parse_mode: FormattingOptionsTg.HTML,
    text,
  });

  return;
};

const getUsers = async (usernames: Array<string>): Promise<Array<User>> => {
  await UserDao.initInstance();
  const users = await UserDao.findByUsernames(usernames);
  if (!users || !users?.length) {
    return [];
  }

  return users;
};

const getDataFromBody = (body: UpdateTg): Array<string> => {
  const key = getTextCommand(body.message) ?? "";
  const usernames = body?.message!.text?.replace(key, "")?.trim()?.split(" ");

  return usernames;
};

const buildTime = (minutes: number): number =>
  dayjs().add(minutes, "minutes").unix();

const restrictPermissions = async (
  body: UpdateTg,
  user: User,
  minutes: number
): Promise<string> => {
  const untilDate = buildTime(minutes);

  TelegramService.initInstance();
  try {
    const { data } = await TelegramService.restrictChatMember({
      chat_id: body?.message!.chat?.id,
      user_id: user?.id,
      permissions: {
        can_send_messages: false,
        can_send_audios: false,
        can_send_documents: false,
        can_send_photos: false,
        can_send_videos: false,
        can_send_video_notes: false,
        can_send_voice_notes: false,
        can_send_polls: false,
        can_send_other_messages: false,
        can_add_web_page_previews: false,
        can_change_info: false,
        can_invite_users: false,
        can_pin_messages: false,
        can_manage_topics: false,
      },
      until_date: untilDate,
    });

    return data?.ok
      ? `@${user?.username} has been muted for ${minutes} minutes`
      : `You cannot do that, @${user?.username} is admin 😎`;
  } catch (error) {
    if (String(error?.response?.data?.description).includes("owner")) {
      return `@${user?.username} is owner 😎`;
    }

    return `@${user?.username} error: <code>${error?.response?.data?.description}</code>`;
  }
};

const restrictMembers = async (
  body: UpdateTg,
  users: Array<User>
): Promise<string> => {
  const responses = await Promise.all(
    users?.map(
      (user: User): Promise<string> => restrictPermissions(body, user, 10)
    )
  );

  return responses?.join("\n");
};

const execute = async (
  body: UpdateTg
): Promise<{ statusCode: number; body?: string }> => {
  const usernames = getDataFromBody(body);
  if (!usernames?.length) {
    await sendMessage(body, "Please type at least one User");
    return { statusCode: BAD_REQUEST };
  }

  const users = await getUsers(usernames);
  if (!users?.length) {
    await sendMessage(body, "Users not found");
    return { statusCode: NOT_FOUND };
  }

  const result = await restrictMembers(body, users);
  await sendMessage(body, `Members mute operations:\n\n${result}`);

  return { statusCode: OK };
};

export const telegramMembersMute = async (
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
