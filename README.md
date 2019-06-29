# itemflow-electron

> An electron-vue project

#### Build Setup

```bash
# install dependencies
npm install

# serve with hot reload at localhost:9080
npm run dev

# build electron application for production
npm run build

# run unit & end-to-end tests
npm test


# lint all JS/Vue component files in `src/`
npm run lint

```

---

### Problem with "A dynamic link library (DLL) initialization routine failed."

I solved this problem by this advise on Electron page: To ensure your native dependencies are always matched electron version, simply add script "postinstall": "electron-builder install-app-deps" to your package.json.

And then I changed: `"postinstall": "electron-builder install-app-deps && npm run lint:fix"`. Then `npm run postinstall`.

Reference:

- [Electron Uncaught Error: A dynamic link library (DLL) initialization routine failed](https://stackoverflow.com/questions/36029955/electron-uncaught-error-a-dynamic-link-library-dll-initialization-routine-fai)

---

This project was generated with [electron-vue](https://github.com/SimulatedGREG/electron-vue)@[4c6ee7b](https://github.com/SimulatedGREG/electron-vue/tree/4c6ee7bf4f9b4aa647a22ec1c1ca29c2e59c3645) using [vue-cli](https://github.com/vuejs/vue-cli). Documentation about the original structure can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).
