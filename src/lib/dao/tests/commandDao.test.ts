import { Command } from "../../models";
import { MongodbService } from "../../services";
import { CommandDao } from "../commandDao";

jest.mock("../../services/mongodb");

describe("CommandDao Tests", () => {
  beforeEach(async () => {
    await MongodbService.initInstance();
    jest.clearAllMocks();
  });

  it("should init instance and create schema and model", async () => {
    await CommandDao.initInstance();

    expect(MongodbService.initInstance).toHaveBeenCalledTimes(1);

    expect(CommandDao.commandModel).toBeDefined();
  });

  it("should find command by key", async () => {
    const mockCommand = {
      key: "test",
      url: "http://example.com",
      enabled: true,
    };

    jest.spyOn(CommandDao.commandModel, "findOne").mockReturnValueOnce({
      exec: async () =>
        Promise.resolve({ ...mockCommand, toObject: () => mockCommand }),
    });

    const result = await CommandDao.findByKey("test");

    expect(result).toEqual(mockCommand);
    expect(CommandDao.commandModel.findOne).toHaveBeenCalledWith({
      key: "test",
    });
  });

  it("should return null when command not found by key", async () => {
    jest
      .spyOn(CommandDao.commandModel, "findOne")
      .mockReturnValueOnce({ exec: async () => Promise.resolve(null) });

    const result = await CommandDao.findByKey("nonexistent");

    expect(result).toBeNull();
    expect(CommandDao.commandModel.findOne).toHaveBeenCalledWith({
      key: "nonexistent",
    });
  });

  it("should save command", async () => {
    const mockCommand = {
      key: "test",
      url: "http://example.com",
      enabled: true,
    };

    jest.spyOn(CommandDao.commandModel, "updateOne").mockReturnValueOnce({});
    jest.spyOn(CommandDao.commandModel, "findOne").mockReturnValueOnce({
      exec: async () =>
        Promise.resolve({ ...mockCommand, toObject: () => mockCommand }),
    });

    const result = await CommandDao.save(mockCommand);

    expect(result).toEqual(mockCommand);
    expect(CommandDao.commandModel.updateOne).toHaveBeenCalledWith(
      { key: "test" },
      {
        key: "test",
        url: "http://example.com",
        enabled: true,
      },
      { upsert: true }
    );
  });

  it("should throw error when key is missing during save", async () => {
    await expect(
      CommandDao.save({ url: "http://example.com" } as Command)
    ).rejects.toThrow("key is missing");
    expect(CommandDao.commandModel.updateOne).not.toHaveBeenCalled();
  });

  it("should throw error when url is missing during save", async () => {
    await expect(CommandDao.save({ key: "test" } as Command)).rejects.toThrow(
      "url is missing"
    );
    expect(CommandDao.commandModel.updateOne).not.toHaveBeenCalled();
  });
});
