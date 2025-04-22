# n8n-nodes-openai-structured-outputs

This is a community node for n8n that enables you to extract structured JSON from unstructured text by leveraging OpenAI’s **Structured Outputs** feature with a user‑provided JSON Schema.

---

## Installation

1. **Clone or install** the package into your n8n custom nodes folder:

   ```bash
   cd ~/.n8n/custom
   git clone https://github.com/SebasCrucer/n8n-nodes-openai-structured-outputs.git
   cd n8n-nodes-openai-structured-outputs
   pnpm install
   pnpm build
   ```

2. **Restart** your n8n instance.
3. Your new **OpenAI Structured Output** node will appear under **Community Nodes → Utility**.

_For more details on installing community nodes, see the official guide:_  
https://docs.n8n.io/integrations/community-nodes/installation/

---

## Operations

### Extract JSON

Use the **Extract JSON** operation to send text to the OpenAI Chat Completions endpoint with your JSON Schema injected into `response_format`. The node will:

1. Call `POST /v1/chat/completions` with:

   - `model` (selectable)
   - `messages`: system prompt + user text
   - `response_format`: `{ type: "json_schema", json_schema: { name, schema, strict: true } }`
   - optional parameters like `temperature`

2. Receive the AI’s response, automatically:
   - **Validate** HTTP errors (`4xx`/`5xx`)
   - **Parse** the first choice’s `message.content` as JSON
   - **Validate** the parsed JSON against your schema (using AJV with coercion, defaults, and stripping extra fields)
   - **Output**:
     ```jsonc
     {
     	"parsed": {
     		/* your valid JSON */
     	},
     	"errors": [
     		/* AJV errors, if any */
     	],
     }
     ```

#### Node Parameters

| Parameter   | Name          | Type    | Default  | Description                                               |
| ----------- | ------------- | ------- | -------- | --------------------------------------------------------- |
| Model       | `model`       | options | `gpt-4o` | OpenAI model to use (e.g. `gpt-4o-mini`, `o3-mini`, etc.) |
| JSON Schema | `jsonSchema`  | json    | `""`     | A valid JSON Schema (injected into `response_format`)     |
| Text        | `text`        | string  | `""`     | Input text from which to extract structured data          |
| Temperature | `temperature` | number  | `1`      | Sampling temperature (0–1)                                |

---

## Credentials

This node uses the built‑in `OpenAI API` credential:

1. **API Key** (required)
2. **Organization ID** (optional)
3. **Base URL** (defaults to `https://api.openai.com/v1`)

Configure these under **Settings → API Credentials → OpenAI** in n8n.

---

## Compatibility

- **n8n version:** ≥ 1.x with Community Nodes API v1
- **Node.js:** ≥ 18.10
- **AJV version:** 8.x (bundled)

---

## Usage

1. Add the **OpenAI Structured Output** node to your workflow.
2. Select **Extract JSON**.
3. Fill in your **Model**, paste or compose your **JSON Schema**, and supply the **Text**.
4. Connect an output to inspect:
   - `parsed`: the coerced, default‑filled, extra‑fields‑removed object
   - `errors`: any AJV validation errors

You can chain this into further nodes (e.g., write to a database, send an email) knowing the JSON conforms to your schema.

---

## JSON Schema Reference

We leverage the industry‑standard **JSON Schema** draft (see official docs):  
https://json-schema.org/understanding-json-schema/

### Notes on Keyword Support

OpenAI’s Structured Outputs supports many common JSON Schema keywords, but also has explicit limitations. Below is a summary of what works (✔) and what does **not** (✘) for each data type:

#### String

- ✔ **type**
- ✔ **enum**
- ✔ **const**
- ✔ **contentEncoding** (if supported)
- ✔ **contentMediaType** (if supported)
- ✘ **minLength**, **maxLength**, **pattern**, **format**

#### Number & Integer

- ✔ **type**
- ✔ **enum**
- ✔ **const**
- ✔ **exclusiveMinimum**, **exclusiveMaximum**
- ✘ **minimum**, **maximum**, **multipleOf**

#### Boolean

- ✔ **type**
- ✔ **enum**
- ✔ **const**

#### Object

- ✔ **type**
- ✔ **properties**
- ✔ **required**
- ✔ **additionalProperties**
- ✔ **dependencies** (if supported)
- ✔ **patternDependentSchemas** (if supported)
- ✘ **patternProperties**, **unevaluatedProperties**, **propertyNames**, **minProperties**, **maxProperties**

#### Array

- ✔ **type**
- ✔ **items**
- ✔ **additionalItems**
- ✔ **prefixItems** (if supported)
- ✘ **unevaluatedItems**, **contains**, **minContains**, **maxContains**, **minItems**, **maxItems**, **uniqueItems**

#### General (Multiple Types)

- ✔ **enum**
- ✔ **const**
- ✔ **anyOf**
- ✔ **allOf** (not explicitly unsupported)
- ✘ **oneOf**, **not** (unsupported or untested)
- ✔ **if**, **then**, **else** (if supported)
- ✔ **description**, **title**
- ✘ **default**
- ✘ **$ref**, **$defs/definitions** (no external references)

> **Tip:** Schema reuse via `$defs` inside the same document may work, but external `$ref` is not supported.

---

## Resources

- **n8n Community Nodes**: https://docs.n8n.io/integrations/community-nodes/
- **OpenAI Chat Completions**: https://platform.openai.com/docs/guides/chat/introduction
- **JSON Schema Official**: https://json-schema.org/understanding-json-schema/

---

## Version History

- **0.1.0** (2025‑04‑22)
  - Initial release: Extract JSON via OpenAI Structured Outputs with full AJV validation, coercion, defaults, and extra‑field removal.

---

_Created by Diego Sebastian Cruz Cervantes · MIT License_
