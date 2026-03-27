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
      "node_modules/**",
      "storybook-static/**",
      "_bmad/**",
      "_bmad-output/**",
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
  // Reglas de arquitectura — solo aplicar a codigo de la app (no a lib/supabase/ ni config)
  {
    files: [
      "app/**/*.{ts,tsx}",
      "components/**/*.{ts,tsx}",
      "lib/api/**/*.{ts,tsx}",
      "lib/validations/**/*.{ts,tsx}",
      "lib/utils/**/*.{ts,tsx}",
    ],
    rules: {
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
