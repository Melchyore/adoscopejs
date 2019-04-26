## Register provider

Once installed the authentication provider, make sure to register the provider inside `start/app.js` file in order to make use of it.

```js
const providers = [
  'Adoscope/dist/providers/AdoscopeProvider'
]
```

## Register global middleware

Next you need to do is register couple of middleware to ensure everything works as expected.

Middleware are defined inside `start/kernel.js` file.

```js
const globalMiddleware = [
  ''
]
```
