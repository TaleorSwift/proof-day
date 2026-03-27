import { test, expect } from "@playwright/test";

test("ruta protegida sin sesion redirige a /login", async ({ page }) => {
  await page.goto("/communities");
  await expect(page).toHaveURL(/\/login/);
});

test("ruta /login es accesible sin sesion", async ({ page }) => {
  await page.goto("/login");
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("button", { name: "Continuar" })).toBeVisible();
});

test("landing / es accesible sin sesion", async ({ page }) => {
  await page.goto("/");
  // No redirige a /login
  await expect(page).not.toHaveURL(/\/login/);
});

test("ruta /profile sin sesion redirige a /login", async ({ page }) => {
  await page.goto("/profile");
  await expect(page).toHaveURL(/\/login/);
});
