import { IdentityDecoraterService } from "@src/background/services/identity";
import { SemaphoreService } from "@src/background/services/proof";

import { ISemaphoreGenerateArgs, SemaphoreProofGenerator } from "..";

jest.mock("@src/background/services/identity", (): unknown => ({
  IdentityDecoraterService: {
    genFromSerialized: jest.fn(),
  }
}));

jest.mock("@src/background/services/proof/Semaphore");

describe("contentScripts/proof/semaphore", () => {
  const defaultGenerateArgs: ISemaphoreGenerateArgs = {
    identity: "identity",
    payload: {
      externalNullifier: "externalNullifier",
      signal: "0x0",
      circuitFilePath: "circuitFilePath",
      verificationKey: "verificationKey",
      zkeyFilePath: "zkeyFilePath",
    },
  };

  const emptyFullProof = {
    fullProof: {
      proof: {},
      publicSignals: {},
    },
  };

  beforeEach(() => {
    (IdentityDecoraterService.genFromSerialized as jest.Mock).mockReturnValue("serialized");
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("should generate proof properly", async () => {
    const semaphoreProofGenerator = SemaphoreProofGenerator.getInstance();
    const [semaphoreServiceInstance] = (SemaphoreService as jest.Mock).mock.instances as [{ genProof: jest.Mock }];
    semaphoreServiceInstance.genProof.mockResolvedValue(emptyFullProof);

    const result = await semaphoreProofGenerator.generate(defaultGenerateArgs);

    expect(semaphoreServiceInstance.genProof).toBeCalledTimes(1);
    expect(semaphoreServiceInstance.genProof).toBeCalledWith("serialized", defaultGenerateArgs.payload);
    expect(result).toStrictEqual(emptyFullProof);
  });
});
