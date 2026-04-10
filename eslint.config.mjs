import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Ignorar ficheros generados y de configuracion del sistema
  {
    ignores: [
      ".next/**",
      ".vercel/**",
      "node_modules/**",
      "storybook-static/**",
      "_bmad/**",
      "_bmad-output/**",
      ".claude/**",
      // next-env.d.ts es generado por Next.js — usa triple-slash reference necesario
      "next-env.d.ts",
      // app/auth/confirm/route.ts es el template oficial de Supabase Next.js.
      // Importa solo un *type* de @supabase/supabase-js — no crea clientes directamente.
      "app/auth/confirm/route.ts",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Calidad de codigo
      "no-empty": "error",
      "no-console": ["warn", { allow: ["error"] }],
      // Permitir require() en tailwind.config.ts (plugins)
      "@typescript-eslint/no-require-imports": "warn",
    },
  },
  // Reglas de arquitectura — aplicar a codigo de la app, middleware raiz y tests
  // Excluir lib/supabase/ (es el unico sitio donde se permite importar @supabase/ssr directamente)
  {
    files: [
      "app/**/*.{ts,tsx}",
      "components/**/*.{ts,tsx}",
      "lib/api/**/*.{ts,tsx}",
      "lib/validations/**/*.{ts,tsx}",
      "lib/utils/**/*.{ts,tsx}",
      "middleware.ts",
      "tests/**/*.{ts,tsx}",
    ],
    rules: {
      // Bloquear importaciones directas de Supabase fuera de lib/supabase/
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@supabase/supabase-js",
              message:
                "No importar @supabase/supabase-js directamente. Usa lib/supabase/client.ts o lib/supabase/server.ts.",
            },
            {
              name: "@supabase/ssr",
              message:
                "No importar @supabase/ssr directamente. Usa lib/supabase/client.ts, lib/supabase/server.ts o lib/supabase/middleware.ts.",
            },
          ],
        },
      ],
      // Bloquear creacion de clientes Supabase directamente fuera de lib/supabase/
      // Nota: imports de tipos (@supabase/supabase-js types) SI estan permitidos
      "no-restricted-syntax": [
        "error",
        {
          // Bloquear: createBrowserClient(), createServerClient(), createClient() de @supabase/ssr
          selector:
            "ImportDeclaration[source.value='@supabase/ssr'] > ImportSpecifier[imported.name=/^create/]",
          message:
            "No crear clientes Supabase directamente. Usa lib/supabase/client.ts o lib/supabase/server.ts.",
        },
        {
          selector: "CallExpression[callee.property.name='getSession']",
          message:
            "Usa getClaims() o getUser() en su lugar. getSession() no verifica el token con el Auth server y es inseguro.",
        },
      ],
    },
  },
];

export default eslintConfig;
