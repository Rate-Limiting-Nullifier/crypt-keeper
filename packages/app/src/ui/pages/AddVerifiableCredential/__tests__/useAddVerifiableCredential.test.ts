/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";

import { hashVC, serializeVC } from "@src/background/services/credentials/utils";
import { closePopup } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { addVerifiableCredential, rejectVerifiableCredentialRequest } from "@src/ui/ducks/verifiableCredentials";

import { defaultVCName, useAddVerifiableCredential } from "../useAddVerifiableCredential";

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/ui/ducks/app", (): unknown => ({
  closePopup: jest.fn(),
}));

jest.mock("@src/ui/ducks/verifiableCredentials", (): unknown => ({
  addVerifiableCredential: jest.fn(),
  rejectVerifiableCredentialRequest: jest.fn(),
  renameVerifiableCredential: jest.fn(),
  deleteVerifiableCredential: jest.fn(),
  fetchVerifiableCredentials: jest.fn(),
  useVerifiableCredentials: jest.fn(),
}));

describe("ui/pages/AddVerifiableCredential/useAddVerifiableCredential", () => {
  const mockDispatch = jest.fn();

  const mockVerifiableCredential = {
    context: ["https://www.w3.org/2018/credentials/v1"],
    id: "http://example.gov/credentials/3732",
    type: ["VerifiableCredential", "UniversityDegreeCredential"],
    issuer: "https://example.edu/issuers/14",
    issuanceDate: new Date("2010-01-01T19:23:24Z"),
    credentialSubject: {
      id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
      claims: {
        type: "BachelorDegree",
        name: "Bachelor of Science and Arts",
      },
    },
  };
  const mockSerializedVerifiableCredential = serializeVC(mockVerifiableCredential);

  const expectedCryptkeeperVerifiableCredential = {
    vc: mockVerifiableCredential,
    metadata: {
      hash: hashVC(mockVerifiableCredential),
      name: defaultVCName,
    },
  };

  const oldHref = window.location.href;

  Object.defineProperty(window, "location", {
    value: {
      href: oldHref,
    },
    writable: true,
  });

  describe("basic hook functionality", () => {
    beforeEach(() => {
      (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

      window.location.href = `http://localhost:3000/verifiable-credentials?serializedVerifiableCredential=${mockSerializedVerifiableCredential}`;
    });

    afterEach(() => {
      jest.clearAllMocks();

      window.location.href = oldHref;
    });

    test("should return initial data", async () => {
      const { result } = renderHook(() => useAddVerifiableCredential());

      await waitFor(() => {
        expect(result.current.cryptkeeperVC).toStrictEqual(expectedCryptkeeperVerifiableCredential);
        expect(result.current.error).toBe(undefined);
      });
    });

    test("should close the modal properly", async () => {
      const { result } = renderHook(() => useAddVerifiableCredential());

      await waitFor(() => {
        expect(result.current.cryptkeeperVC).toStrictEqual(expectedCryptkeeperVerifiableCredential);
      });

      act(() => {
        result.current.onCloseModal();
      });

      expect(closePopup).toBeCalledTimes(1);
      expect(mockDispatch).toBeCalledTimes(1);
    });

    test("should toggle renaming properly", async () => {
      const newName = "a new name";

      const { result } = renderHook(() => useAddVerifiableCredential());

      await waitFor(() => {
        expect(result.current.cryptkeeperVC).toStrictEqual(expectedCryptkeeperVerifiableCredential);
      });

      act(() => {
        result.current.onRename(newName);
      });

      expect(result.current.cryptkeeperVC!.metadata.name).toBe(newName);
    });

    test("should approve the verifiable credential properly", async () => {
      const { result } = renderHook(() => useAddVerifiableCredential());

      await waitFor(() => {
        expect(result.current.cryptkeeperVC).toStrictEqual(expectedCryptkeeperVerifiableCredential);
      });

      await act(async () => result.current.onApprove());

      expect(addVerifiableCredential).toBeCalledTimes(1);
    });

    test("should reject the verifiable credential properly", async () => {
      const { result } = renderHook(() => useAddVerifiableCredential());

      await waitFor(() => {
        expect(result.current.cryptkeeperVC).toStrictEqual(expectedCryptkeeperVerifiableCredential);
      });

      await act(async () => Promise.resolve(result.current.onReject()));

      expect(rejectVerifiableCredentialRequest).toBeCalledTimes(1);
      expect(mockDispatch).toBeCalledTimes(2);
    });

    test("should handle an error properly", async () => {
      (addVerifiableCredential as jest.Mock).mockImplementation(() => {
        throw new Error("Could not add verifiable credential!");
      });

      const { result } = renderHook(() => useAddVerifiableCredential());

      await waitFor(() => {
        expect(result.current.cryptkeeperVC).toStrictEqual(expectedCryptkeeperVerifiableCredential);
      });

      await act(async () => result.current.onApprove());

      expect(result.current.error).toBe("Could not add verifiable credential!");
    });
  });

  describe("no serialized verifiable credential", () => {
    beforeEach(() => {
      (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

      window.location.href = `http://localhost:3000/verifiable-credentials`;
    });

    afterEach(() => {
      jest.clearAllMocks();

      window.location.href = oldHref;
    });

    test("should process no search param accordingly", async () => {
      const { result } = renderHook(() => useAddVerifiableCredential());

      await waitFor(() => {
        expect(result.current.cryptkeeperVC).toBe(undefined);
        expect(result.current.error).toBe(undefined);
      });
    });

    test("should handle renaming with an undefined verifiable credential properly", async () => {
      const { result } = renderHook(() => useAddVerifiableCredential());

      await waitFor(() => {
        expect(result.current.cryptkeeperVC).toBe(undefined);
        expect(result.current.error).toBe(undefined);
      });

      act(() => result.current.onRename("new name"));

      expect(result.current.cryptkeeperVC).toBe(undefined);
    });

    test("should handle approval with an undefined verifiable credential properly", async () => {
      const { result } = renderHook(() => useAddVerifiableCredential());

      await waitFor(() => {
        expect(result.current.cryptkeeperVC).toBe(undefined);
        expect(result.current.error).toBe(undefined);
      });

      await act(async () => result.current.onApprove());

      expect(result.current.cryptkeeperVC).toBe(undefined);
    });
  });
});
