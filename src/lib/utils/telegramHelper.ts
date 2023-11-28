import { EntityTypeTg, UpdateTg } from "../models";
import { MessageTg } from "../models/telegram";

const filterTextCommandEntity = ({ type, offset }) =>
  type === EntityTypeTg.BOT_COMMAND && offset === 0;

const checkIfHasTextCommand = (message: MessageTg) => {
  const entities = message?.entities ?? [];
  const caption_entities = message?.caption_entities ?? [];
  const commands = [...entities, ...caption_entities]?.filter(
    filterTextCommandEntity
  );
  return Boolean(commands?.length);
};

const getTextCommandPosition = (
  message: MessageTg
): { offset: number; length: number } => {
  const entities = message?.entities ?? [];
  const caption_entities = message?.caption_entities ?? [];
  const commands = [...entities, ...caption_entities]?.filter(
    filterTextCommandEntity
  );
  if (!commands?.length) {
    return { offset: 0, length: 0 };
  }

  const [{ offset, length }] = commands;
  return { offset, length };
};

const getTextCommandKey = (
  message: MessageTg,
  position: { offset: number; length: number }
) => {
  const text = message?.text ?? message?.caption;
  const key = text?.substring(position?.offset, position?.length);

  return key?.trim();
};

export const getTextCommand = (message: MessageTg): string | null => {
  const hasTextCommand = checkIfHasTextCommand(message);
  if (!hasTextCommand) {
    return null;
  }

  const position = getTextCommandPosition(message);
  const key = getTextCommandKey(message, position);
  if (!key) {
    return null;
  }

  if (key === "") {
    return null;
  }

  return key;
};
