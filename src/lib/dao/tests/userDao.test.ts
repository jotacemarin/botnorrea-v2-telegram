import { User } from "../../models";
import { MongodbService } from "../../services";
import { UserDao } from "../userDao";

jest.mock("../../services/mongodb");

describe("UserDao Tests", () => {
  beforeEach(async () => {
    await MongodbService.initInstance();
    jest.clearAllMocks();
  });

  it("should init instance and create schema and model", async () => {
    await UserDao.initInstance();

    expect(MongodbService.initInstance).toHaveBeenCalledTimes(1);
    expect(UserDao.userModel).toBeDefined();
  });

  it("should get schema name", () => {
    const schemaName = UserDao.getSchemaName();

    expect(schemaName).toBe("user");
  });

  it("should find user by Telegram ID", async () => {
    const mockUser = { id: 123, username: "testUser" };

    jest.spyOn(UserDao.userModel, "findOne").mockReturnValueOnce({
      exec: async () =>
        Promise.resolve({ ...mockUser, toObject: () => mockUser }),
    });

    const result = await UserDao.findByTelegramId(123);

    expect(result).toEqual(mockUser);
    expect(UserDao.userModel.findOne).toHaveBeenCalledWith({ id: 123 });
  });

  it("should return null when user not found by Telegram ID", async () => {
    jest
      .spyOn(UserDao.userModel, "findOne")
      .mockReturnValueOnce({ exec: async () => Promise.resolve(null) });

    const result = await UserDao.findByTelegramId(456);

    expect(result).toBeNull();
    expect(UserDao.userModel.findOne).toHaveBeenCalledWith({ id: 456 });
  });

  it("should find users by usernames", async () => {
    const mockUsers = [
      { id: 1, username: "user1" },
      { id: 2, username: "user2" },
    ];

    jest.spyOn(UserDao.userModel, "find").mockReturnValueOnce({
      exec: async () => Promise.resolve(mockUsers),
    });

    const result = await UserDao.findByUsernames(["user1", "user2"]);

    expect(result).toEqual(mockUsers);
    expect(UserDao.userModel.find).toHaveBeenCalledWith({
      $or: [{ username: "user1" }, { username: "user2" }],
    });
  });

  it("should find user by username", async () => {
    const mockUser = { id: 123, username: "testUser" };

    jest.spyOn(UserDao.userModel, "findOne").mockReturnValueOnce({
      exec: async () =>
        Promise.resolve({ ...mockUser, toObject: () => mockUser }),
    });

    const result = await UserDao.findByUsername("testUser");

    expect(result).toEqual(mockUser);
    expect(UserDao.userModel.findOne).toHaveBeenCalledWith({
      username: "testUser",
    });
  });

  it("should return null when user not found by username", async () => {
    jest.spyOn(UserDao.userModel, "findOne").mockReturnValueOnce({
      exec: async () => Promise.resolve(null),
    });

    const result = await UserDao.findByUsername("nonexistentUser");

    expect(result).toBeNull();
    expect(UserDao.userModel.findOne).toHaveBeenCalledWith({
      username: "nonexistentUser",
    });
  });

  it("should save user", async () => {
    const mockUser = { id: 123, username: "testUser" };

    jest.spyOn(UserDao.userModel, "updateOne").mockReturnValueOnce({});
    jest.spyOn(UserDao.userModel, "findOne").mockReturnValueOnce({
      exec: async () =>
        Promise.resolve({ ...mockUser, toObject: () => mockUser }),
    });

    const result = await UserDao.save(mockUser);

    expect(result).toEqual(mockUser);
    expect(UserDao.userModel.updateOne).toHaveBeenCalledWith(
      { id: 123 },
      mockUser,
      { upsert: true }
    );
  });

  it("should throw error when id is missing during save", async () => {
    await expect(
      UserDao.save({ username: "testUser" } as User)
    ).rejects.toThrow("id is missing");
    expect(UserDao.userModel.updateOne).not.toHaveBeenCalled();
  });

  it("should throw error when username is missing during save", async () => {
    await expect(UserDao.save({ id: 123 } as User)).rejects.toThrow(
      "username is missing"
    );
    expect(UserDao.userModel.updateOne).not.toHaveBeenCalled();
  });
});
