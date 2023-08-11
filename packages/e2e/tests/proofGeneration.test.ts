import { expect, test } from "../fixtures";
import { connectWallet, createAccount } from "../helpers/account";

test.describe("proof generation", () => {
  test.beforeEach(async ({ page, cryptKeeperExtensionId, context }) => {
    await createAccount({ page, cryptKeeperExtensionId, context });

    await page.goto(`chrome-extension://${cryptKeeperExtensionId}/popup.html`);
    await expect(page.getByTestId("home-page")).toBeVisible();

    await connectWallet({ page, cryptKeeperExtensionId, context });
    await expect(page.getByText("Connected to MetaMask")).toBeVisible();

    await page.goto("/");
  });

  test("should generate semaphore proof from Merkle proof storage address [health-check]", async ({ page }) => {
    await page.getByText("Generate proof from Merkle proof storage address").first().click();

    const cryptKeeper = await page.context().waitForEvent("page");
    await cryptKeeper.getByText("Approve").click();

    await expect(page.getByText("Semaphore proof generated successfully!")).toBeVisible();

    const proofJsonText = await page.getByTestId("proof-json").innerText();
    const parsedProof = JSON.parse(proofJsonText) as Record<string, unknown>;
    expect(parsedProof).toBeDefined();
  });

  test("should generate semaphore proof from Merkle proof artifacts [health-check]", async ({ page }) => {
    await page.getByText("Generate proof from Merkle proof artifacts").first().click();

    const cryptKeeper = await page.context().waitForEvent("page");
    await cryptKeeper.getByText("Approve").click();

    await expect(page.getByText("Semaphore proof generated successfully!")).toBeVisible();

    const proofJsonText = await page.getByTestId("proof-json").innerText();
    const parsedProof = JSON.parse(proofJsonText) as Record<string, unknown>;
    expect(parsedProof).toBeDefined();
  });

  test("should generate rln proof from Merkle proof storage address [health-check]", async ({ page }) => {
    await page.getByText("Generate proof from Merkle proof storage address").nth(1).click();

    const cryptKeeper = await page.context().waitForEvent("page");
    await cryptKeeper.getByText("Approve").click();

    await expect(page.getByText("RLN proof generated successfully!")).toBeVisible();

    const proofJsonText = await page.getByTestId("proof-json").innerText();
    const parsedProof = JSON.parse(proofJsonText) as Record<string, unknown>;
    expect(parsedProof).toBeDefined();
  });

  test("should generate rln proof from Merkle proof artifacts [health-check]", async ({ page }) => {
    await page.getByText("Generate proof from Merkle proof artifacts").nth(1).click();

    const cryptKeeper = await page.context().waitForEvent("page");
    await cryptKeeper.getByText("Approve").click();

    await expect(page.getByText("RLN proof generated successfully!")).toBeVisible();

    const proofJsonText = await page.getByTestId("proof-json").innerText();
    const parsedProof = JSON.parse(proofJsonText) as Record<string, unknown>;
    expect(parsedProof).toBeDefined();
  });
});
