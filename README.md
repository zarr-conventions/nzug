# Template Convention Metadata

- **UUID**: 00000000-0000-0000-0000-000000000000
- **Name**: Template
- **Schema URL**: "https://raw.githubusercontent.com/zarr-conventions/template/refs/tags/v1/schema.json"
- **Spec URL**: "https://github.com/zarr-conventions/template/blob/v1/README.md"
- **Scope**: Array, Group
- **Extension Maturity Classification**: Proposal
- **Owner**: @your-github-handle, @another-github-handle

## Description

This convention defines [brief description of what this convention does]. All properties use the `template:` namespace prefix (or nested `template` object) and are placed at the root `attributes` level following the [Zarr Conventions Specification](https://github.com/zarr-conventions/zarr-conventions-spec).

[Add more detailed description of the convention, its purpose, and how it fits into the Zarr ecosystem. Explain what problem it solves and how it should be used.]

- Examples:
  - [Convention metadata only](examples/minimal_example.json)
  - [Key-prefixed pattern (recommended)](examples/key_prefixed_example.json)
  - [Nested pattern](examples/nested_example.json)

## Motivation

- **First benefit**: Explanation of the first key benefit this convention provides
- **Second benefit**: Explanation of the second key benefit
- **Third benefit**: Explanation of additional benefits
- **Use case alignment**: How this convention aligns with common use cases in the domain

## Convention Registration

The convention must be registered in `zarr_conventions`:

```json
{
  "zarr_conventions": [
    {
      "schema_url": "https://raw.githubusercontent.com/zarr-conventions/template/refs/tags/v1/schema.json",
      "spec_url": "https://github.com/zarr-conventions/template/blob/v1/README.md",
      "uuid": "00000000-0000-0000-0000-000000000000",
      "name": "template:",
      "description": "Brief description of the convention"
    }
  ]
}
```

## Applicable To

This convention can be used with these parts of the Zarr hierarchy:

- [x] Group
- [x] Array

## Properties

All properties are placed at the root `attributes` level. To avoid attribute name collisions with other conventions, this convention supports the following pattern [remove the pattern irrelevant for this convention]:

#### 1. Key-Prefixed Pattern (Recommended)

Individual attributes are prefixed with `template:`. This is the recommended approach as it enables better composability - other conventions can extend objects defined by this convention.

**Convention metadata name**: `template:`

| Field Name           | Type                      | Description                                  |
| -------------------- | ------------------------- | -------------------------------------------- |
| template:new_field   | string                    | **REQUIRED**. Describe the required field... |
| template:xyz         | [XYZ Object](#xyz-object) | Describe the field...                        |
| template:another_one | \[number]                 | Describe the field...                        |

**Example**:

```json
{
  "attributes": {
    "zarr_conventions": [{ "name": "template:", "spec_url": "..." }],
    "template:new_field": "example value",
    "template:xyz": { "x": 1.0, "y": 2.0, "z": 3.0 }
  }
}
```

#### 2. Nested Pattern

All convention properties are nested under a single `template` key.

**Convention metadata name**: `template`

| Field Name | Type                                | Description                                  |
| ---------- | ----------------------------------- | -------------------------------------------- |
| template   | [Template Object](#template-object) | **REQUIRED**. Template convention properties |

**Example**:

```json
{
  "attributes": {
    "zarr_conventions": [{ "name": "template", "spec_url": "..." }],
    "template": {
      "new_field": "example value",
      "xyz": { "x": 1.0, "y": 2.0, "z": 3.0 }
    }
  }
}
```

### Template Object

When using the nested pattern, all properties are contained in the `template` object:

| Field Name  | Type                      | Description                                  |
| ----------- | ------------------------- | -------------------------------------------- |
| new_field   | string                    | **REQUIRED**. Describe the required field... |
| xyz         | [XYZ Object](#xyz-object) | Describe the field...                        |
| another_one | \[number]                 | Describe the field...                        |

### Additional Field Information

#### new_field (template:new_field or template.new_field)

This is a much more detailed description of the field `new_field`...

### XYZ Object

This is the introduction for the purpose and the content of the XYZ Object...

| Field Name | Type   | Description                                  |
| ---------- | ------ | -------------------------------------------- |
| x          | number | **REQUIRED**. Describe the required field... |
| y          | number | **REQUIRED**. Describe the required field... |
| z          | number | **REQUIRED**. Describe the required field... |

## Known Implementations

This section helps potential implementers assess the convention's maturity and adoption, and provides a way for the community to collaborate on future revisions.

### Libraries and Tools

- **[Library/Tool Name](https://link-to-repo)** - Brief description of the implementation
  - Language: Python/JavaScript/Rust/etc.
  - Status: Experimental/Stable/Production
  - Maintainer: @github-handle
  - Since: Version X.Y or Date

- **[Another Implementation](https://link)** - Description
  - Language: Language
  - Status: Status
  - Maintainer: @handle
  - Since: Version/Date

### Datasets Using This Convention

- **[Dataset Name](https://link-to-dataset)** - Description of the dataset and how it uses this convention
- **[Another Dataset](https://link)** - Description

### Resources

- Tutorials, blog posts, or other resources demonstrating this convention
- Community discussions or working groups

_If you implement or use this convention, please add your implementation to this list by submitting a pull request._

## Acknowledgements

This template is based on the [STAC extensions template](https://github.com/stac-extensions/template/blob/main/README.md).
