import { expect, type Page, test } from "@playwright/test";
import { questions } from "../src/data/kandidator/pool";
import { MAX_QUESTIONS } from "../src/domain/kandidator/parameters";

const RESULT_HEADING = /Sur ces questions, vos réponses|Aucune comparaison possible/;

/** Gives the same answer to every question until the result page is shown. */
const answerUntilResult = async (page: Page, label: string) => {
  for (let number = 1; number <= MAX_QUESTIONS; number++) {
    await expect(page.getByText(`Question ${number} ·`)).toBeVisible();
    await page.getByRole("button", { name: label, exact: true }).click();
    const finished = page.getByText("Calcul du résultat…").or(page.getByRole("heading", { name: RESULT_HEADING }));
    await expect(page.getByText(`Question ${number + 1} ·`).or(finished)).toBeVisible();
    if (await finished.isVisible()) {
      break;
    }
  }
  await page.waitForURL(/\/resultat\?r=/);
};

const expectNoHorizontalScroll = async (page: Page) => {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );

  expect(overflow).toBeLessThanOrEqual(0);
};

test("full journey: home → quiz → result → why this result", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Commencer le test", exact: true }).click();
  await answerUntilResult(page, "Oui");

  await expect(page).toHaveURL(/\/resultat\?r=/);
  await expect(page.getByRole("heading", { level: 1, name: /Sur ces questions, vos réponses/ })).toBeVisible();
  await expect(page.getByText("Ce n'est pas une recommandation de vote.")).toBeVisible();
  const cards = page.getByRole("listitem").filter({ hasText: "Comparé sur" });
  expect(await cards.count()).toBeGreaterThanOrEqual(3);
  await expect(cards.first()).toContainText(/\d+ %/);

  await page.locator("details summary").first().click();
  await expect(page.locator("details").first().getByRole("link")).toHaveAttribute(
    "href",
    /^https:\/\/www\.assemblee-nationale\.fr\/dyn\/17\/scrutins\/\d+$/,
  );
  await expect(page.locator("details").first().getByRole("table")).toBeVisible();
  await expectNoHorizontalScroll(page);

  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: /Sur ces questions, vos réponses/ })).toBeVisible();
});

test("landing: figures from the pool, both calls to action lead to the quiz", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toContainText("votes");
  await expect(page.getByText(String(questions.length), { exact: true })).toBeVisible();
  await expectNoHorizontalScroll(page);

  await page.getByRole("link", { name: "Lancer le test", exact: true }).click();
  await expect(page).toHaveURL(/\/quiz$/);
  await expect(page.getByText("Question 1 ·")).toBeVisible();
});

test("previous question undoes the last answer", async ({ page }) => {
  await page.goto("/quiz");
  const question = page.getByRole("heading", { level: 1 });
  await expect(page.getByText("Question 1 ·")).toBeVisible();
  const firstText = await question.textContent();
  await expect(page.getByRole("button", { name: "Question précédente" })).toBeDisabled();

  await page.getByRole("button", { name: "Non", exact: true }).click();
  await expect(page.getByText("Question 2 ·")).toBeVisible();
  await page.getByRole("button", { name: "Question précédente" }).click();

  await expect(page.getByText("Question 1 ·")).toBeVisible();
  await expect(question).toHaveText(firstText ?? "");
  await expectNoHorizontalScroll(page);
});

test("only Neutral answers: no comparison", async ({ page }) => {
  await page.goto("/quiz");
  await answerUntilResult(page, "Neutre / Je ne sais pas");

  await expect(page.getByRole("heading", { level: 1, name: "Aucune comparaison possible" })).toBeVisible();
});

test("invalid result link", async ({ page }) => {
  await page.goto("/resultat?r=garbage");

  await expect(page.getByRole("heading", { level: 1, name: "Lien de résultat invalide" })).toBeVisible();
});
