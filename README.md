# NZ-1.0 NetCDF - Zarr Convention

- **UUID**: d0a980b5-c644-4dcc-85a1-283799a58f40
- **Name**: NZ-1.0
- **Schema URL**: "https://github.com/zarr-conventions/nz/blob/v1-proposed/schema.json"
- **Spec URL**: "https://github.com/zarr-conventions/nz/blob/v1-proposed/README.md"
- **Scope**: Array, Group
- **Extension Maturity Classification**: Proposal
- **Owner**: @dblodgett-usgs

## Description

NZ-1.0 (NetCDF Zarr convention) is a Zarr convention that defines a structural interoperability layer for array-oriented scientific data on top of the [Zarr v3 specification](https://zarr-specs.readthedocs.io/en/latest/v3/core/v3.0.html). It serves the same structural role for the Zarr ecosystem that the [NetCDF Users Guide (NUG)](https://docs.unidata.ucar.edu/nug/current/) serves for netCDF: it defines a shared vocabulary of structural concepts, a typed data model, naming rules, and a small set of reserved attributes that domain conventions can be written against without modification.

The primary design goal is to allow existing domain conventions — in particular the [CF Metadata Conventions](https://cfconventions.org/) — to be applied to Zarr v3 datasets by replacing the NUG as the underlying structural reference, **with no changes required to the domain convention itself.**

NZ is not a geospatial convention, not a CF extension, and not a replacement for the Zarr v3 specification. It is the structural layer between the format specification and domain conventions.

All properties use standard attribute names (not namespaced) and are placed at the root `attributes` level following the [Zarr Conventions Specification](https://github.com/zarr-conventions/zarr-conventions-spec).

> This document proposes NZ-1.0 as a Zarr convention. The keywords **MUST**, **MUST NOT**,
> **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**,
> and **OPTIONAL** in this document are to be interpreted as described in
> [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).
>
> All normative text is marked with the label **\[NZ addition\]** where it adds constraints
> above the [Zarr v3 specification](https://zarr-specs.readthedocs.io/en/latest/v3/core/v3.0.html).
> All other content is either a restatement of v3 content for clarity or informative.

- Examples:
  - [Root group (minimal)](examples/root_group.json)
  - [Basic array](examples/array_basic.json)
  - [Array with \_FillValue](examples/array_fillvalue.json)
  - [Root group with CF-1.12](examples/root_group_cf.json)
  - [Dimension coordinate](examples/dimension_coordinate.json)

## Motivation

- **Interoperability layer gap**: Domain conventions for scientific array data (like CF) are written against a format specification that provides structural primitives — named dimensions, typed variables, typed attributes, named coordinate systems. The Zarr v3 specification defines a capable storage model but deliberately leaves these structural refinements to conventions. NZ fills that gap.
- **Domain convention adoption**: By providing NUG-equivalent structural concepts, NZ allows domain conventions written against the NUG — such as CF — to be applied to Zarr using a simple reference substitution (NUG → NZ), without waiting for geospatial convention debates to resolve.
- **Stable foundation for domain conventions**: GeoZarr, OME-NGFF, and related conventions can build on NZ rather than independently re-solving the same structural problems.
- **Implementation convergence**: Implementations can converge on shared structural behavior before domain-level semantics are fully standardized.

### Separation of Concerns

NZ is explicitly scoped to the structural interoperability layer. The following are **out of scope** and left to conventions that build on NZ:

- Coordinate reference systems and geospatial metadata
- Standard names, units vocabularies, and physical quantity identification
- Coordinate types (latitude, longitude, time, vertical) and their encoding
- Cell methods, bounds variables, and climatological statistics
- Discrete sampling geometries and feature types
- Multi-scale, tiled, or pyramidal data structures
- Any other domain-specific semantic content

**This scoping is intentional and load-bearing.** The geospatial and Earth science communities are actively debating CRS encoding, axis order, coordinate role identification, and related questions. NZ does not enter those debates. It provides the structural floor on which they can be settled independently.

### Relationship to the Zarr v3 Specification

NZ adds normative constraints and definitions above the Zarr v3 specification. It does not modify or contradict the Zarr v3 spec. Every valid NZ-1.0 dataset is a valid Zarr v3 dataset. Implementations that support Zarr v3 can read NZ-1.0 datasets; they will simply not enforce the additional constraints defined here.

### Relationship to Zarr v2

NZ is defined against Zarr v3, but its structural concepts have direct analogues in Zarr v2 datasets. Many v2 datasets already follow the patterns NZ formalizes: xarray writes dimension names via the `_ARRAY_DIMENSIONS` attribute in `.zattrs`, and `_FillValue` and `conventions` are widely used. A Zarr v2 dataset that follows these existing practices is structurally equivalent to a NZ-1.0 dataset, differing only in the metadata container (`.zattrs` / `.zarray` vs unified `zarr.json`) and the dimension name mechanism (`_ARRAY_DIMENSIONS` attribute vs `dimension_names` field). NZ does not define a v2 profile, but implementations that support both format versions MAY apply NZ structural semantics to v2 datasets that use these established patterns.

### Relationship to Domain Conventions

A domain convention is a document that specifies semantics for datasets built on a structural interoperability layer. The CF Metadata Conventions are the primary domain convention this document is designed to support. NZ provides to a CF-Zarr profile exactly what the NUG provides to CF-netCDF.

Domain conventions built on NZ-1.0 MUST declare compliance using the `conventions` attribute defined in [Convention Declaration](#convention-declaration). They MAY add constraints above NZ-1.0 but MUST NOT contradict it. For backward compatibility, software that supports NetCDF in Zarr are encouraged to try to support data that do not declare compliance with NZ conventions but do adhere to its assumptions.

The ordering is: Zarr v3 spec → NZ-1.0 → domain conventions (CF, GeoZarr, etc.).

## Convention Registration

The convention must be registered in `zarr_conventions`:

```json
{
  "zarr_conventions": [
    {
      "schema_url": "https://raw.githubusercontent.com/zarr-conventions/nz/refs/tags/v1/schema.json",
      "spec_url": "https://github.com/zarr-conventions/nz/blob/v1/README.md",
      "uuid": "d0a980b5-c644-4dcc-85a1-283799a58f40",
      "name": "NZ-1.0",
      "description": "Structural interoperability layer for scientific array conventions on Zarr v3"
    }
  ]
}
```

## Applicable To

This convention can be used with these parts of the Zarr hierarchy:

- [x] Group
- [x] Array

## Convention Declaration

A dataset is a NZ-1.0 dataset if its root group `zarr.json` contains `"NZ-1.0"` in its `conventions` attribute:

```json
{
  "zarr_format": 3,
  "node_type": "group",
  "attributes": {
    "conventions": "NZ-1.0"
  }
}
```

A dataset conforming to multiple conventions lists them space-separated, ordered from most general to most specific:

```json
{
  "zarr_format": 3,
  "node_type": "group",
  "attributes": {
    "conventions": "NZ-1.0 CF-1.12"
  }
}
```

The `conventions` attribute is case-insensitive for the purpose of matching convention identifiers. The `Conventions` attribute (capital C), used in the NUG, MUST be treated as equivalent to `conventions` during reading for backward compatibility with datasets produced by netCDF toolchains.

> **Note:** NZ uses the `conventions` string attribute at the root group level for declaration. This is consistent with the NUG `Conventions` attribute pattern and with how xarray and existing CF-Zarr tools already use this field. Datasets conforming to the [zarr-conventions-spec](https://github.com/zarr-conventions/zarr-conventions-spec) framework MAY additionally include a `zarr_conventions` entry per that framework.

## Data Model

This section defines the structural concepts that domain conventions may reference normatively. Each concept is defined in terms of Zarr v3 `zarr.json` objects.

### Store and Hierarchy

A _store_ is any Zarr v3 key-value backend. A _hierarchy_ is the tree of nodes accessible from a root path in a store. These terms are as defined in the Zarr v3 specification.

### Node

A _node_ is either a group or an array, identified by the `zarr.json` at its path in the store. Every node has a `node_type` field in its `zarr.json` that is either `"group"` or `"array"`.

### Group

A _group_ is a node with `"node_type": "group"`. Groups may contain child groups and arrays. The _root group_ is the group at the root of the hierarchy. Group membership is determined by the key structure of the store: a node at path `P/child/zarr.json` is a direct child of the group at path `P/zarr.json`.

### Array

An _array_ is a node with `"node_type": "array"`. An array has a shape, a data type, a chunk grid, a codec pipeline, a fill value, and optionally dimension names and attributes, all carried in its `zarr.json`.

**\[NZ addition\]** In a NZ-1.0 dataset, every array MUST have a fully populated `dimension_names` field. The `dimension_names` array MUST have the same length as `shape`. No entry in `dimension_names` may be `null` or the empty string `""`. The Zarr v3 specification makes `dimension_names` optional; NZ requires it.

Example of a minimal compliant array `zarr.json`:

```json
{
  "zarr_format": 3,
  "node_type": "array",
  "shape": [8760, 721, 1440],
  "data_type": "float32",
  "dimension_names": ["time", "lat", "lon"],
  "chunk_grid": {
    "name": "regular",
    "configuration": { "chunk_shape": [100, 121, 240] }
  },
  "chunk_key_encoding": {
    "name": "default",
    "configuration": { "separator": "/" }
  },
  "fill_value": "NaN",
  "codecs": [
    { "name": "bytes", "configuration": { "endian": "little" } },
    { "name": "zstd", "configuration": { "level": 5 } }
  ],
  "attributes": {}
}
```

### Dimension

A _dimension_ is an axis of an array, identified by its position in `shape` and its corresponding label in `dimension_names`.

**\[NZ addition\]** Within a group, all arrays that share a dimension label MUST have the same length along that axis. This is the _shared dimension constraint_. It is the Zarr-convention equivalent of the NUG's shared named dimension: a dimension label within a group is not merely a name, it is a constraint on co-extent. Domain conventions may rely on this constraint to define co-location of arrays.

**\[NZ addition\]** Dimension labels are scoped to the group containing the array. The same label used in different groups has no required relationship between groups unless a domain convention specifies otherwise.

### Dimension Coordinate

**\[NZ addition\]** A _dimension coordinate_ is an array satisfying all of the following:

- It is contained in the same group as the array whose dimension it describes
- Its `dimension_names` contains exactly one entry
- That entry matches the array's own name within its group
- Its values are strictly monotonic (all distinct, either consistently increasing or consistently decreasing)

Dimension coordinate identification is structural. No additional attribute is required. This reproduces the NUG coordinate variable concept in Zarr v3 terms: the identification falls out of naming, shape, and value ordering.

An array named `lat` with `"dimension_names": ["lat"]` and monotonically ordered values is a dimension coordinate for the `lat` dimension in its group. An array named `lat` with `"dimension_names": ["y", "x"]` is not, regardless of its content.

### Auxiliary Array

An _auxiliary array_ is an array that provides coordinate or ancillary information for another array but does not satisfy the dimension coordinate definition above. How auxiliary arrays are associated with data arrays — including the attribute names and syntax used to declare those relationships — is left to domain conventions (e.g., the `coordinates` attribute used by CF). NZ defines the concept but does not reserve any attribute names for it.

### Scalar Array

**\[NZ addition\]** A _scalar array_ is an array that holds exactly one value. It is encoded in Zarr v3 with `"shape": []` (no dimensions) and `"dimension_names": []`. Despite having no dimensions, a scalar array contains a single typed data value in its chunk store. NZ requires implementations to support scalar arrays.

Scalar arrays are used as single-valued coordinate variables — for example, to represent a single pressure level or forecast time without introducing a size-one dimension. They are not a substitute for attributes: a scalar array is a first-class array node with a declared `data_type` and coordinate semantics, not JSON metadata. A naive Zarr v3 reader will read scalar arrays without error.

## Type System

Array data types are as defined in the Zarr v3 specification. Attribute values use JSON types with the default mapping defined below. Domain conventions are responsible for defining attribute-precision rules when required; NZ does not provide a general attribute type annotation mechanism.

### Array Data Types

Array data types are as defined in the Zarr v3 specification. The following names are used throughout this document:

`bool`, `int8`, `uint8`, `int16`, `uint16`, `int32`, `uint32`, `int64`, `uint64`, `float32`, `float64`, `complex64`, `complex128`

### Attribute Value Types

Default type mapping from JSON attribute values to NZ types:

| JSON value type       | NZ default type           |
| --------------------- | --------------------------- |
| string                | `string`                    |
| boolean               | `bool`                      |
| integer number        | `int64`                     |
| floating-point number | `float64`                   |
| array of integers     | `int64[]`                   |
| array of floats       | `float64[]`                 |
| array of strings      | `string[]`                  |
| object                | untyped structured metadata |

Homogeneity is required within JSON arrays used as attribute values. A JSON array containing mixed numeric and string values is not a valid NZ attribute value.

### The `_FillValue` Attribute

**\[NZ addition\]** The attribute name `_FillValue` is reserved as the _semantic missing data indicator_. It is distinct from the storage-level `fill_value` field in `zarr.json`, which specifies the value used to initialize unwritten chunks.

When `_FillValue` is present in an array's attributes, convention-aware readers MUST treat values equal to `_FillValue` as missing data, regardless of the storage `fill_value`. When both are present and differ, `_FillValue` governs masking semantics. The type of `_FillValue` is the array's `data_type`.

This decoupling is necessary because Zarr's storage `fill_value` serves a different purpose (chunk initialization) than the semantic use of `_FillValue` for missing data masking. In netCDF, these happen to be the same mechanism; in Zarr, they are independent. NZ preserves the NUG's masking semantics by defining `_FillValue` as an attribute with clear precedence over the storage-level field.

## Properties

NZ uses standard (non-namespaced) attribute names. Only attributes that define or support the structural interoperability layer are reserved here. All domain-level attributes — including those defined by CF (e.g., `units`, `long_name`, `scale_factor`, `add_offset`, `coordinates`, `valid_range`) — are left to domain conventions and are not reserved by NZ.

### Root Group Attributes

| Attribute     | Type   | Obligation | Semantics                                                         |
| ------------- | ------ | ---------- | ----------------------------------------------------------------- |
| `conventions` | string | MUST       | Space-separated convention identifiers; MUST include `"NZ-1.0"` |

### Array Attributes

| Attribute    | Type                                                         | Obligation | Semantics                       |
| ------------ | ------------------------------------------------------------ | ---------- | ------------------------------- |
| `_FillValue` | (see [The \_FillValue Attribute](#the-_fillvalue-attribute)) | MAY        | Semantic missing data indicator |

### Array Structural Requirements

**\[NZ addition\]** The following structural requirements apply to all arrays in a NZ-1.0 dataset:

| Field                       | Location         | Requirement                                                                    |
| --------------------------- | ---------------- | ------------------------------------------------------------------------------ |
| `dimension_names`           | `zarr.json` root | MUST be present; MUST have same length as `shape`; no `null` or `""` entries   |
| shared dimension constraint | within group     | All arrays sharing a dimension label MUST have the same length along that axis |

## Naming Rules

Names of arrays, groups, and attributes in NZ-1.0 datasets:

- SHOULD begin with a letter (`A`–`Z`, `a`–`z`)
- SHOULD consist of letters, digits, and underscores
- MUST NOT contain the path separator `/`
- Are case-sensitive, but names that differ only by case SHOULD be avoided
- MAY contain period (`.`) or hyphen (`-`), but these are discouraged in names intended to be referenced in attribute values

These rules ensure that NZ names can be used unambiguously in domain convention attribute values (which reference array names as strings), in CDL text representations, and in URL path components.

## Consolidated Metadata

NZ RECOMMENDS the use of consolidated metadata for datasets served from object storage. When consolidated metadata is present, its content MUST be consistent with the individual `zarr.json` objects it summarizes. Convention-aware readers SHOULD prefer consolidated metadata when available.

Consolidated metadata in Zarr v3 is implemented by zarr-python and proposed for formal standardization in [zarr-specs #309](https://github.com/zarr-developers/zarr-specs/issues/309). NZ adopts the zarr-python convention pending that standardization: consolidated metadata is stored in the root group `zarr.json` under the `consolidated_metadata` key. When zarr-specs #309 is finalized, this section will be updated to cite the formal specification.

## What This Convention Enables (Informative)

A domain convention written against NZ has access to:

- **Named, constrained dimensions.** The shared dimension constraint means that dimension labels within a group carry co-extent guarantees, enabling domain conventions to define co-location of arrays using the same semantics as netCDF.
- **Dimension coordinates.** Identified structurally, without any additional attribute, exactly as coordinate variables are identified in the NUG.
- **Typed attributes.** Array data types are declared via Zarr v3 `data_type`. Attribute values use JSON types; domain conventions MAY define precision rules for specific attributes when needed.
- **Semantic fill values.** `_FillValue` decoupled from the storage `fill_value`, preserving the NUG's masking semantics independently of Zarr's chunk initialization behavior.
- **Auxiliary arrays.** The auxiliary array concept is defined structurally, enabling domain conventions to build their own coordinate association mechanisms (e.g., the `coordinates` attribute) on top of NZ.

### NUG to NZ Mapping Table

The existing CF conventions document can be applied to NZ-1.0 datasets by substituting NZ structural concepts for their NUG equivalents:

| NUG concept                     | NZ-1.0 equivalent                                                |
| ------------------------------- | ------------------------------------------------------------------ |
| netCDF file                     | Zarr v3 hierarchy                                                  |
| dimension                       | dimension label in `dimension_names` + shared dimension constraint |
| variable                        | array                                                              |
| coordinate variable             | dimension coordinate                                               |
| global attribute                | root group attribute                                               |
| variable attribute              | array attribute                                                    |
| typed attribute                 | attribute (JSON type; precision rules left to domain conventions)  |
| `_FillValue` variable attribute | `_FillValue` array attribute                                       |
| `Conventions` global attribute  | `conventions` root group attribute                                 |

No changes to the CF conventions document are required to use CF semantics with NZ-1.0 datasets. A CF-Zarr profile document citing NZ performs the mapping above and declares compliance with both.

## Out of Scope (Informative)

The following topics are explicitly deferred to conventions built on NZ. They are active areas of community work in the CF, GeoZarr, and Zarr communities and are not ready for standardization at the structural interoperability layer.

**Coordinate reference systems.** How CRS information is encoded — whether via CF `grid_mapping`, GeoZarr `proj:` attributes, WKT2, PROJJSON, or other mechanisms — is a GeoZarr and CF community question. NZ reserves no CRS-related attribute names and takes no position on encoding.

**Axis order.** The relationship between the order of entries in `dimension_names` and the axis order expressed in a CRS definition is an open problem with known silent failure modes. NZ does not address it.

**Coordinate role identification beyond dimension coordinates.** Whether an array is a latitude coordinate, a time coordinate, or a vertical coordinate is determined by domain conventions through mechanisms such as standard names, units, and axis attributes. NZ identifies only dimension coordinates structurally; all further coordinate semantics are left to domain conventions.

**Auxiliary coordinate association.** How auxiliary arrays are linked to data arrays (e.g., the `coordinates` attribute) is a domain convention concern. NZ defines the auxiliary array concept but does not reserve attribute names for declaring those relationships.

**Data description attributes.** Attribute names for units, long names, valid ranges, packing parameters (scale_factor, add_offset), and similar descriptive metadata are defined by domain conventions such as CF, not by NZ.

**Unlimited dimensions.** The NUG supports unlimited dimensions for record-oriented appending. Zarr has no equivalent concept. NZ does not define one.

**User-defined types.** Enumerated, opaque, variable-length, and compound types from the netCDF-4 enhanced data model have no Zarr v3 equivalents. NZ does not address them.

**Aggregation and virtual datasets.** Kerchunk, Icechunk, and related virtual store approaches are out of scope.

**Inter-group dimension relationships.** NZ scopes the shared dimension constraint to within a group. Whether dimension labels carry meaning across group boundaries is left to domain conventions.

## Normative Summary

A NZ-1.0 compliant dataset:

1. Is a valid Zarr v3 dataset.
2. Has `"NZ-1.0"` in the `conventions` attribute of its root group `zarr.json`.
3. Has fully populated `dimension_names` (no `null` or empty-string entries) in every array `zarr.json`.
4. Satisfies the shared dimension constraint: within any group, all arrays sharing a dimension label have the same length along that axis.
5. Uses `_FillValue` in array attributes (when present) as the semantic missing data indicator, distinct from the storage `fill_value`.
6. Uses reserved attribute names only as defined in [Properties](#properties).
7. Uses array and group names conforming to [Naming Rules](#naming-rules).

## Appendix A: Differences from the Zarr v3 Specification

| Topic                       | Zarr v3 spec                    | NZ-1.0                                                  |
| --------------------------- | ------------------------------- | --------------------------------------------------------- |
| `dimension_names`           | Optional; entries may be `null` | Required; all entries must be non-null, non-empty strings |
| Shared dimension constraint | Not defined                     | Required within groups                                    |
| Dimension coordinate        | Not defined                     | Defined structurally                                      |
| Attribute type system       | JSON types only                 | JSON types; domain conventions define precision rules     |
| `_FillValue` semantics      | Not defined                     | Defined, decoupled from `fill_value`                      |
| Reserved attribute names    | Not defined                     | Defined in [Properties](#properties)                      |

## Appendix B: Differences from the NetCDF Users Guide

| Topic                   | NUG (netCDF)                                                       | NZ-1.0                                                                                         |
| ----------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| Dimension definition    | Declared, named, and sized; shared by structural reference in file | Label in `dimension_names`; co-extent enforced by shared dimension constraint                    |
| Coordinate variable     | 1D variable whose name matches a dimension name                    | Array whose `dimension_names` entry matches its own name and whose values are strictly monotonic |
| Attribute type          | Declared NC type (`NC_FLOAT`, `NC_DOUBLE`, etc.)                   | JSON type; domain conventions MAY define precision rules                                         |
| `Conventions` attribute | Root-level string, capital C                                       | `conventions` root group attribute; `Conventions` treated as equivalent during reading           |
| Unlimited dimension     | Supported                                                          | Not defined (out of scope)                                                                       |
| User-defined types      | Supported in netCDF-4                                              | Not defined (out of scope)                                                                       |
| File identification     | `.nc` suffix                                                       | `"zarr_format": 3` in root `zarr.json`                                                           |

## Known Implementations

This section helps potential implementers assess the convention's maturity and adoption, and provides a way for the community to collaborate on future revisions.

### Libraries and Tools

_No implementations yet. This convention is in the Proposal stage._

The following tools already use patterns compatible with NZ:

- **[netCDF-C (NCZarr)](https://docs.unidata.ucar.edu/netcdf-c/current/nczarr_head.html)** — C library for netCDF data access. NCZarr uses compatible dimension-naming and fill-value patterns when reading/writing Zarr.
- **[xarray](https://github.com/pydata/xarray)** — Python library for labeled multi-dimensional arrays. Uses `dimension_names`, `_FillValue`, and `conventions` attributes when reading/writing Zarr.
- **[netCDF-Java](https://github.com/Unidata/netcdf-java)** — Java library for scientific data access. Implements NUG semantics that NZ is designed to parallel.

### Datasets Using This Convention

_No datasets yet. Community contributions welcome._

### Resources

- [zarr-conventions discussions](https://github.com/orgs/zarr-conventions/discussions) — Community forum for convention development
- [CF Metadata Conventions](https://cfconventions.org/) — Primary domain convention this spec supports
- [Zarr v3 Specification](https://zarr-specs.readthedocs.io/en/latest/v3/core/v3.0.html) — Underlying format specification
- [NetCDF Users Guide](https://docs.unidata.ucar.edu/nug/current/) — The structural reference NZ parallels

_If you implement or use this convention, please add your implementation to this list by submitting a pull request._

## Acknowledgements

This convention specification is based on the [zarr-conventions template](https://github.com/zarr-conventions/template), which is itself based on the [STAC extensions template](https://github.com/stac-extensions/template/blob/main/README.md). The structural concepts are derived from the [NetCDF Users Guide](https://docs.unidata.ucar.edu/nug/current/) and adapted for the Zarr v3 data model.

This convention document was originally developed with assistance from Claude Opus 4.6. The [CONTEXT.md](CONTEXT.md) included as an ancillary file provides traceability to key references and decisions that were used in the process.