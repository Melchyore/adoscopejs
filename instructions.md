## Transpile Typescript code

Since this project is written using Typescript, you need to transpile it.

You can run transpile.cmd to achieve that.

<aside class="notice">
You need typescript installed globally.
</aside>

## Run instructions

Go to your application's directory and run the following command :

`
adonis run:instructions path/to/your/directory
`

Path must be valid and point to the directory where you cloned Adoscope repository.

## Register provider

After, you need to register the provider inside `start/app.js` file in order to make use of it.

```js
const providers = [
  // ... Some providers you've registered before.
  'path/to/adoscope/dir/dist/providers/AdoscopeProvider'
]
```

## Register global middleware

Next, you need to register the middleware to ensure everything works as expected.

Inside `start/kernel.js` file, add the following :

```js
const serverMiddleware = [
  // ... Some middleware you've registered before.
  '@provider:Adoscope/App/Middleware/Authorize'
]
```

## Run migration file

Finally, run the following command :

`
adonis migration:run
`

And now you can start using Adoscope.

When you visit a page or execute a query to database, it will be caught and stored into your database.

More to come soon.
