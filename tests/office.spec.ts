import { expect, test, type Page } from '@playwright/test';

type MonitoredPage = Page & { browserErrors?: string[] };
const games = ['inbox', 'bugs', 'server', 'coffee'] as const;

test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('e2e-initialized')) {
      localStorage.clear();
      sessionStorage.setItem('e2e-initialized', 'true');
    }
  });
  const errors: string[] = [];
  (page as MonitoredPage).browserErrors = errors;
  page.on('pageerror', (error) => errors.push(`page: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('Failed to load resource'))
      errors.push(`console: ${message.text()}`);
  });
  page.on('response', (response) => {
    if (response.status() >= 400) errors.push(`network ${response.status()}: ${response.url()}`);
  });
});

test.afterEach(async ({ page }) => {
  expect((page as MonitoredPage).browserErrors, 'unexpected browser errors').toEqual([]);
});

async function skipToOffice(page: Page, method: 'button' | 'Space' | 'Escape' = 'button') {
  await page.goto('/');
  await expect(page.getByTestId('skip-cinematic')).toBeVisible();
  if (method === 'button') await page.getByTestId('skip-cinematic').click();
  else await page.keyboard.press(method);
  await expect(page.getByTestId('office')).toBeVisible();
  await expect(page.getByText('EXPLORE THE OFFICE')).toBeVisible();
}

async function enterGame(page: Page, game: (typeof games)[number]) {
  await page.getByTestId(`workstation-${game}`).click();
  await expect(page.getByTestId('game-screen')).toBeVisible();
  await expect(page.getByText('QUICK BRIEFING')).toBeVisible();
}

async function startGame(page: Page) {
  await page.getByRole('button', { name: 'START SHIFT' }).click();
  await expect(page.getByText('QUICK BRIEFING')).toBeHidden();
}

async function scoreCorrectly(page: Page, minimum = 500) {
  for (let attempts = 0; attempts < 30; attempts += 1) {
    const score = Number(await page.getByTestId('score').textContent());
    if (score >= minimum) return score;
    const target = (await page.getByTestId('active-target').textContent())?.trim();
    if (!target) throw new Error('The active challenge target was not rendered');
    await page.getByRole('button', { name: new RegExp(`^\\d+\\s*${target}$`) }).click();
  }
  throw new Error(`Could not reach score ${minimum}`);
}

async function waitForResult(page: Page, heading: RegExp) {
  await expect(page.getByRole('heading', { name: heading })).toBeVisible({ timeout: 15_000 });
}

test('fresh launch renders cinematic and all three skip paths work', async ({ page }) => {
  for (const method of ['button', 'Space', 'Escape'] as const) {
    await skipToOffice(page, method);
    await page.reload();
  }
});

test('opening cinematic completes naturally and survives a mid-cinematic reload', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByText('BLOCKWORKS')).toBeVisible();
  await page.waitForTimeout(500);
  await page.reload();
  await expect(page.getByTestId('skip-cinematic')).toBeVisible();
  await expect(page.getByText('EXPLORE THE OFFICE')).toBeVisible({ timeout: 30_000 });
});

test('office input, pause, mute, volume, cancel and reset persistence are reliable', async ({
  page,
}) => {
  await skipToOffice(page);
  await page.keyboard.down('KeyW');
  await page.waitForTimeout(300);
  await page.keyboard.up('KeyW');
  await page.keyboard.press('Shift+KeyD');
  await page.keyboard.press('Space');

  await page.keyboard.press('KeyM');
  await expect(page.getByTestId('mute')).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await page.getByTestId('skip-cinematic').click();
  await expect(page.getByTestId('mute')).toHaveAttribute('aria-pressed', 'true');

  await page.getByTestId('settings').click();
  await expect(page.getByRole('heading', { name: 'SETTINGS' })).toBeVisible();
  await page.getByRole('slider').fill('0.25');
  await page.getByRole('button', { name: 'Reset progress' }).click();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByText('Erase every score')).toBeHidden();
  await page.getByRole('button', { name: 'Resume shift' }).click();

  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'PAUSED' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'PAUSED' })).toBeHidden();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Reset progress' }).click();
  await page.getByTestId('reset-progress').click();
  await page.reload();
  await page.getByTestId('skip-cinematic').click();
  await expect(page.getByText(/0\/12 PRODUCTIVITY CUBES/)).toBeVisible();
});

for (const game of games) {
  test(`${game}: tutorial, mistake, pause, loss, retry, win, persistence, exit and replay`, async ({
    page,
  }) => {
    await skipToOffice(page);
    await enterGame(page, game);
    await page.getByRole('button', { name: 'Back to office' }).click();
    await expect(page.getByTestId('office')).toBeVisible();

    await enterGame(page, game);
    await startGame(page);
    const target = (await page.getByTestId('active-target').textContent())?.trim();
    const buttons = page.locator('.action-grid button');
    for (let i = 0; i < 4; i += 1) {
      if ((await buttons.nth(i).innerText()).includes(target ?? '')) continue;
      await buttons.nth(i).click();
      break;
    }
    await expect(page.getByTestId('score')).toHaveText('0');

    await page.getByTestId('pause').click();
    await expect(page.getByRole('heading', { name: 'SHIFT PAUSED' })).toBeVisible();
    await page.getByRole('button', { name: 'Resume' }).click();
    await waitForResult(page, /INBOX CHAOS!/);
    await page.getByTestId('retry').click();
    await expect(page.getByTestId('score')).toHaveText('0');

    await scoreCorrectly(page, 600);
    await waitForResult(page, /RATING/);
    const finalScore = Number(await page.locator('.final-score').textContent());
    expect(finalScore).toBeGreaterThanOrEqual(500);
    await page.getByRole('button', { name: 'Return to office' }).click();
    await expect(page.getByTestId(`workstation-${game}`).locator('small')).toContainText(
      finalScore.toLocaleString(),
    );

    await page.reload();
    await page.getByTestId('skip-cinematic').click();
    await expect(page.getByTestId(`workstation-${game}`)).toContainText(
      finalScore.toLocaleString(),
    );
    await enterGame(page, game);
    await startGame(page);
    await scoreCorrectly(page, 80);
    await page.keyboard.press('KeyR');
    await expect(page.getByTestId('score')).toHaveText('0');
    await page.getByTestId('exit-game').click();
    await expect(page.getByTestId('game-screen')).toBeHidden();
  });
}

test('Deadline is locked initially, unlocks after four UI victories, then fails, retries and wins', async ({
  page,
}) => {
  await skipToOffice(page);
  const deadline = page.getByRole('button', { name: /Deadline Meltdown/ });
  await expect(deadline).toBeDisabled();

  for (const game of games) {
    await enterGame(page, game);
    await startGame(page);
    await scoreCorrectly(page, 600);
    await waitForResult(page, /RATING/);
    await page.getByRole('button', { name: 'Return to office' }).click();
  }
  await expect(deadline).toBeEnabled();
  await expect(deadline).toContainText('UNLOCKED');
  await deadline.click();
  await expect(page.getByText('SYSTEMS CRITICAL')).toBeVisible();
  await waitForResult(page, /TRY THE RESCUE AGAIN/);
  await page.getByRole('button', { name: 'RETRY EVENT' }).click();
  await expect(page.getByText('TRY THE RESCUE AGAIN')).toBeHidden();

  const stabilize = page.getByRole('button', { name: /STABILIZE/ });
  for (let i = 0; i < 12; i += 1) await stabilize.nth(i % 4).click();
  await expect(page.getByRole('heading', { name: 'BLOCKS REASSEMBLED!' })).toBeVisible();
  await expect(page.getByText(/Prism suit unlocked/)).toBeVisible();
  await page.getByRole('button', { name: 'Return to office' }).click();
  await expect(page.getByTestId('office')).toBeVisible();
  await page.reload();
  await page.getByTestId('skip-cinematic').click();
  await expect(page.getByRole('button', { name: /Deadline Meltdown/ })).toBeEnabled();
});
