<p align="center">
    <img width="96" height="96" src="https://static.fillout.com/logos/fillout-icon.png" alt="Fillout logo">
</p>

<h1 align="center">
  Fillout API Client
</h1>

<p align="center">
  TypeScript SDK for accessing forms and submissions 🚀
</p>

<br /><br />

## Connecting to the API

```js
import { Fillout } from "@fillout/api"

const fillout = new Fillout(FILLOUT_API_KEY)
```

You can generate an API key for your organization at https://build.fillout.com/home/settings/developer. It should start with `sk_prod_`.
Don't save secret keys in your code - use an environmental variable instead.

If you're on an Enterprise plan and you have Fillout submissions hosted in a different region, you'll need to use the `region` option, like so:

```js
const fillout = new Fillout(FILLOUT_API_KEY, { region: "eu" })
```

The values currently available are `us` (default), `eu` and `ca`. Check the base URL in your developer settings.

## Get started with these examples

Print a list of questions in a form:

```js
const forms = await fillout.getForms()

const formName = "Fillout SDK"
const formId = forms.find((f) => f.name === formName)?.formId
if (!formId) throw new Error("Missing form")

const form = await fillout.getForm(formId)

console.log(`Questions available in ${formName}:

${form.questions.map((question) => `${question.name} (${question.type})`).join("\n")}`)
```

Get the ten most recent submissions of a form:

```js
const submissions = await fillout.getSubmissions("foAdHjd1Duus", {
  includePreview: true,
  limit: 10,
  sort: "desc",
})
```

## Documentation

To find out what you can do, take a look at our [API documentation](https://www.fillout.com/help/fillout-rest-api).
This package also has TypeScript and JSDoc comments, so you should get some helpful hints in your editor :)

If you're looking to embed Fillout in a React project, try [@fillout/react](https://npmjs.org/package/@fillout/react)!
