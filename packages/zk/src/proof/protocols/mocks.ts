import { Proof, RLNFullProof, RLNPublicSignals } from "@cryptkeeperzk/rln-proof";

export const mockRlnGenerateProof = jest.fn();
export const mockSemaphoreGenerateProof = jest.fn();
export const mockGetMerkleProof = jest.fn();
export const emptyFullProof: RLNFullProof = {
  snarkProof: {
    proof: {} as Proof,
    publicSignals: {} as RLNPublicSignals,
  },
  epoch: BigInt("0"),
  rlnIdentifier: BigInt("1"),
};
