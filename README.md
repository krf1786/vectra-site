# vectra-site

Responsive website studio site for Vectra Systems.

## Run locally

```bash
npm install
npm run dev
```

Create a production build with `npm run build`.

## Contact form

The form opens a prefilled email draft by default. To submit directly, copy
`.env.example` to `.env.local` and set `VITE_FORM_ENDPOINT` to a Formspree form
URL or another endpoint that accepts JSON `POST` requests.

```bash
cp .env.example .env.local
```

Restart the development server after changing environment variables.
