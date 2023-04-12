import ZkIdentityDecorater from "@src/background/identityDecorater";
import { getEnabledFeatures } from "@src/config/features";

import HistoryService, { OperationType } from "..";
import LockService from "../../lock";
import SimpleStorage from "../../simpleStorage";

jest.mock("../../lock", (): unknown => ({
  __esModule: true,
  default: {
    getInstance: jest.fn(() => ({ encrypt: jest.fn(), decrypt: jest.fn() })),
  },
}));

jest.mock("../../simpleStorage");

type MockStorage = { get: jest.Mock; set: jest.Mock; clear: jest.Mock };

describe("background/services/history", () => {
  const service = HistoryService.getInstance();

  const defaultOperations = [
    {
      type: OperationType.CREATE_IDENTITY,
      identity: JSON.stringify({ secret: "1234", metadata: { identityStrategy: "random" } }),
      createdAt: new Date(),
    },
    {
      type: OperationType.CREATE_IDENTITY,
      identity: JSON.stringify({ secret: "1234", metadata: { identityStrategy: "interrep" } }),
      createdAt: new Date(),
    },
    {
      type: OperationType.DELETE_IDENTITY,
      identity: JSON.stringify({ secret: "1234", metadata: { identityStrategy: "interrep" } }),
      createdAt: new Date(),
    },
  ];
  const serializedDefaultOperations = JSON.stringify(defaultOperations);

  const defaultLockService = {
    decrypt: jest.fn(),
    encrypt: jest.fn(),
  };

  beforeEach(() => {
    defaultLockService.encrypt.mockReturnValue(serializedDefaultOperations);
    defaultLockService.decrypt.mockReturnValue(serializedDefaultOperations);

    (LockService.getInstance as jest.Mock).mockReturnValue(defaultLockService);

    (getEnabledFeatures as jest.Mock).mockReturnValue({ RANDOM_IDENTITY: true });

    (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
      instance.get.mockResolvedValue(serializedDefaultOperations);
    });
  });

  afterEach(async () => {
    await service.clear();
  });

  test("should load history operations properly", async () => {
    const operations = await service.loadOperations();

    expect(operations).toHaveLength(3);
    expect(service.getOperations()).toStrictEqual(operations);
  });

  test("should load history operations without random identities", async () => {
    (getEnabledFeatures as jest.Mock).mockReturnValue({ RANDOM_IDENTITY: false });

    const operations = await service.loadOperations();

    expect(operations).toHaveLength(2);
    expect(service.getOperations()).toStrictEqual(operations);
  });

  test("should load history operations properly if the store is empty", async () => {
    (SimpleStorage as jest.Mock).mock.instances.forEach((instance: MockStorage) => {
      instance.get.mockResolvedValue(null);
    });

    const operations = await service.loadOperations();

    expect(operations).toHaveLength(0);
    expect(service.getOperations()).toHaveLength(0);
  });

  test("should get cached operations without loading from store", () => {
    const operations = service.getOperations();

    expect(operations).toHaveLength(0);
  });

  test("should filter cached operations by type", async () => {
    await service.loadOperations();
    const operations = service.getOperations({ type: OperationType.CREATE_IDENTITY });

    expect(operations).toHaveLength(2);
  });

  test("should track operation properly", async () => {
    await service.loadOperations();
    await service.trackOperation(OperationType.CREATE_IDENTITY, {
      identity: ZkIdentityDecorater.genFromSerialized(defaultOperations[0].identity),
    });
    const cachedOperations = service.getOperations();

    expect(cachedOperations).toHaveLength(4);
  });
});