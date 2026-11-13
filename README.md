# Sign Before You Shield

Build a mobile-first web app called SafeSign. It's an AI agent that checks

links, crypto contract addresses, or transactions before a beginner signs

them, and tells them in plain language if it's safe.

Design: dark theme, clean and modern, a shield icon as the logo. Friendly,

not technical.

Page layout:

- Header with the SafeSign logo and an English / Pidgin language toggle.

- Hero text: "Don't sign blind. Check it first."

- One large input box with the placeholder "Paste a link, contract address,

  or transaction hash".

- A "Check it" button under the input.

- A small note under the button: "We never ask for your seed phrase or

  private key."

- Basic validation: if the input is empty, show a friendly error and don't

  submit.

Use React with Tailwind. Keep the code in small, separate components.

Don't build any backend yet.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://sign-before-you-shield.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/499a4aed-a1b0-42e0-bbeb-dbd546685c1c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
