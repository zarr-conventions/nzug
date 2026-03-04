# NZUG-1.0 Convention Metadata

- **UUID**: d0a980b5-c644-4dcc-85a1-283799a58f40
- **Name**: NZUG-1.0
- **Schema URL**: "https://raw.githubusercontent.com/zarr-conventions/nzug/refs/tags/v1/schema.json"
- **Spec URL**: "https://github.com/zarr-conventions/nzug/blob/v1/README.md"
- **Scope**: Array, Group
- **Extension Maturity Classification**: Proposal
- **Owner**: @dblodgett-usgs

## Description

NZUG-1.0 (NetCDF Zarr Users Guide) is a Zarr convention that defines a structural interoperability layer for array-oriented scientific data on top of the [Zarr v3 specification](https://zarr-specs.readthedocs.io/en/latest/v3/core/v3.0.html). It serves the same structural role for the Zarr ecosystem that the [NetCDF Users Guide (NUG)](https://docs.unidata.ucar.edu/nug/current/) serves for netCDF: it defines a shared vocabulary of structural concepts, a typed data model, naming rules, and a small set of reserved attributes that domain conventions can be written against without modification.

The primary design goal is to allow existing domain conventions — in particular the [CF Metadata Conventions](https://cfconventions.org/) — to be applied to Zarr v3 datasets by replacing the NUG as the underlying structural reference, **with no changes required to the domain convention itself.**

NZUG-1.0 is not a geospatial convention, not a CF extension, and not a replacement for the Zarr v3 specification. It is the structural layer between the format specification and domain conventions.

All properties use standard attribute names (not namespaced) and are placed at the root `attributes` level following the [Zarr Conventions Specification](https://github.com/zarr-conventions/zarr-conventions-spec).

> This document proposes NZUG-1.0 as a Zarr convention. The keywords **MUST**, **MUST NOT**,
> **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**,
> and **OPTIONAL** in this document are to be interpreted as described in
> [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).
>
> All normative text is marked with the label **\[NZUG addition\]** where it adds constraints
> above the [Zarr v3 specification](https://zarr-specs.readthedocs.io/en/latest/v3/core/v3.0.html).
> All other content is either a restatement of v3 content for clarity or informative.

- Examples:
  - [Root group (minimal)](examples/root_group.json)
  - [Basic array](examples/array_basic.json)
  - [Array with typed attributes](examples/array_typed_attrs.json)
  - [Array with \_FillValue](examples/array_fillvalue.json)
  - [Root group with CF-1.12](examples/root_group_cf.json)
  - [Dimension coordinate](examples/dimension_coordinate.json)

## Motivation

- **Interoperability layer gap**: Domain conventions for scientific array data (like CF) are written against a format specification that provides structural primitives — named dimensions, typed variables, typed attributes, named coordinate systems. The Zarr v3 specification defines a capable storage model but deliberately leaves these structural refinements to conventions. NZUG fills that gap.
- **CF adoption without modification**: By providing NUG-equivalent structural concepts, NZUG allows CF to be applied to Zarr using a simple reference substitution (NUG → NZUG), without waiting for geospatial convention debates to resolve.
- **Stable foundation for domain conventions**: GeoZarr, OME-NGFF, and related conventions can build on NZUG rather than independently re-solving the same structural problems.
- **Implementation convergence**: Implementations can converge on shared structural behavior before domain-level semantics are fully standardized.

### Separation of Concerns

NZUG-1.0 is explicitly scoped to the structural interoperability layer. The following are **out of scope** and left to conventions that build on NZUG:

- Coordinate reference systems and geospatial metadata
- Standard names, units vocabularies, and physical quantity identification
- Coordinate types (latitude, longitude, time, vertical) and their encoding
- Cell methods, bounds variables, and climatological statistics
- Discrete sampling geometries and feature types
- Multi-scale, tiled, or pyramidal data structures
- Any other domain-specific semantic content

**This scoping is intentional and load-bearing.** The geospatial and Earth science communities are actively debating CRS encoding, axis order, coordinate role identification, and related questions. NZUG does not enter those debates. It provides the structural floor on which they can be settled independently.

### Relationship to the Zarr v3 Specification

NZUG-1.0 adds normative constraints and definitions above the Zarr v3 specification. It does not modify or contradict the Zarr v3 spec. Every valid NZUG-1.0 dataset is a valid Zarr v3 dataset. Implementations that support Zarr v3 can read NZUG-1.0 datasets; they will simply not enforce the additional constraints defined here.

### Relationship to Domain Conventions

A domain convention is a document that specifies scientific semantics for datasets built on a structural interoperability layer. The CF Metadata Conventions are the primary domain convention this document is designed to support. NZUG-1.0 provides to a CF-Zarr profile exactly what the NUG provides to CF-netCDF.

Domain conventions built on NZUG-1.0 MUST declare compliance using the `conventions` attribute defined in [Convention Declaration](#convention-declaration). They MAY add constraints above NZUG-1.0 but MUST NOT contradict it.

The ordering is: Zarr v3 spec → NZUG-1.0 → domain conventions (CF, GeoZarr, etc.).

## Convention Registration

The convention must be registered in `zarr_conventions`:

```json
{
  "zarr_conventions": [
    {
      "schema_url": "https://raw.githubusercontent.com/zarr-conventions/nzug/refs/tags/v1/schema.json",
      "spec_url": "https://github.com/zarr-conventions/nzug/blob/v1/README.md",
      "uuid": "d0a980b5-c644-4dcc-85a1-283799a58f40",
      "name": "NZUG-1.0",
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

A dataset is a NZUG-1.0 dataset if its root group `zarr.json` contains `"NZUG-1.0"` in its `conventions` attribute:

```json
{
  "zarr_format": 3,
  "node_type": "group",
  "attributes": {
    "conventions": "NZUG-1.0"
  }
}
```

A dataset conforming to multiple conventions lists them space-separated, ordered from most general to most specific:

```json
{
  "zarr_format": 3,
  "node_type": "group",
  "attributes": {
    "conventions": "NZUG-1.0 CF-1.12"
  }
}
```

The `conventions` attribute is case-insensitive for the purpose of matching convention identifiers. The `Conventions` attribute (capital C), used in the NUG, MUST be treated as equivalent to `conventions` during reading for backward compatibility with datasets produced by netCDF toolchains.

> **Note:** NZUG-1.0 uses the `conventions` string attribute at the root group level for declaration. This is consistent with the NUG `Conventions` attribute pattern and with how xarray and existing CF-Zarr tools already use this field. Datasets conforming to the [zarr-conventions-spec](https://github.com/zarr-conventions/zarr-conventions-spec) framework MAY additionally include a `zarr_conventions` entry per that framework.

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

**\[NZUG addition\]** In a NZUG-1.0 dataset, every array MUST have a fully populated `dimension_names` field. The `dimension_names` array MUST have the same length as `shape`. No entry in `dimension_names` may be `null` or the empty string `""`. The Zarr v3 specification makes `dimension_names` optional; NZUG-1.0 requires it.

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

**\[NZUG addition\]** Within a group, all arrays that share a dimension label MUST have the same length along that axis. This is the _shared dimension constraint_. It is the Zarr-convention equivalent of the NUG's shared named dimension: a dimension label within a group is not merely a name, it is a constraint on co-extent. Domain conventions may rely on this constraint to define co-location of arrays.

**\[NZUG addition\]** Dimension labels are scoped to the group containing the array. The same label used in different groups has no required relationship between groups unless a domain convention specifies otherwise.

### Dimension Coordinate

**\[NZUG addition\]** A _dimension coordinate_ is an array satisfying all of the following:

- It is contained in the same group as the array whose dimension it describes
- Its `dimension_names` contains exactly one entry
- That entry matches the array's own name within its group
- Its values are strictly monotonic (all distinct, either consistently increasing or consistently decreasing)

Dimension coordinate identification is structural. No additional attribute is required. This reproduces the NUG coordinate variable concept in Zarr v3 terms: the identification falls out of naming, shape, and value ordering.

An array named `lat` with `"dimension_names": ["lat"]` and monotonically ordered values is a dimension coordinate for the `lat` dimension in its group. An array named `lat` with `"dimension_names": ["y", "x"]` is not, regardless of its content.

### Auxiliary Array

An _auxiliary array_ is an array that provides coordinate or ancillary information for another array but does not satisfy the dimension coordinate definition above. How auxiliary arrays are associated with data arrays — including the attribute names and syntax used to declare those relationships — is left to domain conventions (e.g., CF's `coordinates` attribute). NZUG-1.0 defines the concept but does not reserve any attribute names for it.

### Scalar Array

**\[NZUG addition\]** A _scalar array_ is an array with `"shape": []`. NZUG-1.0 requires implementations to support scalar arrays. Its `dimension_names` MUST be an empty array `[]`. Scalar arrays are used to attach single-valued metadata as typed array values rather than attributes, preserving type information that the JSON attribute system cannot express.

## Type System

The NUG's typed attribute model is a load-bearing feature for domain conventions. CF's precision requirements for `scale_factor`, `add_offset`, and grid mapping CRS parameters depend on knowing whether an attribute value is `float32` or `float64`. Zarr v3's JSON attribute model does not provide this distinction. This section defines the NZUG-1.0 type system for attributes.

### Array Data Types

Array data types are as defined in the Zarr v3 specification. The following names are used throughout this document:

`bool`, `int8`, `uint8`, `int16`, `uint16`, `int32`, `uint32`, `int64`, `uint64`, `float32`, `float64`, `complex64`, `complex128`

### Attribute Value Types

Default type mapping from JSON attribute values to NZUG types:

| JSON value type       | NZUG default type           |
| --------------------- | --------------------------- |
| string                | `string`                    |
| boolean               | `bool`                      |
| integer number        | `int64`                     |
| floating-point number | `float64`                   |
| array of integers     | `int64[]`                   |
| array of floats       | `float64[]`                 |
| array of strings      | `string[]`                  |
| object                | untyped structured metadata |

Homogeneity is required within JSON arrays used as attribute values. A JSON array containing mixed numeric and string values is not a valid NZUG attribute value.

### Attribute Type Annotation

**\[NZUG addition\]** When a domain convention requires an attribute to be of a specific numeric type that differs from the JSON default, the array or group `zarr.json` MUST include a `_nczarr_attr` attribute. This adopts the attribute type annotation pattern established by [NCZarr](https://docs.unidata.ucar.edu/netcdf-c/current/nczarr_head.html) (netCDF-C's Zarr backend), adapted for Zarr v3.

The `_nczarr_attr` attribute is a JSON object containing a single key `"types"`, whose value is a JSON object mapping attribute names to type identifiers:

```json
{
  "zarr_format": 3,
  "node_type": "array",
  "shape": [8760, 721, 1440],
  "data_type": "int16",
  "dimension_names": ["time", "lat", "lon"],
  "attributes": {
    "scale_factor": 0.01,
    "add_offset": 273.15,
    "_nczarr_attr": {
      "types": {
        "scale_factor": "float32",
        "add_offset": "float32"
      }
    }
  }
}
```

Type identifiers may use either of two formats:

1. **Zarr v3 data type names** as defined in the [Zarr v3 specification](https://zarr-specs.readthedocs.io/en/latest/v3/core/v3.0.html): `bool`, `int8`, `uint8`, `int16`, `uint16`, `int32`, `uint32`, `int64`, `uint64`, `float32`, `float64`, `complex64`, `complex128`. Writers SHOULD use Zarr v3 data type names.
2. **NumPy dtype notation** ([reference](https://numpy.org/doc/stable/reference/arrays.dtypes.html)), consistent with NCZarr: `[endian][kind][size]` where endian is `<` (little-endian), `>` (big-endian), or `|` (not applicable); kind is `i` (signed integer), `u` (unsigned integer), `f` (float), or `S` (string); and size is the byte count. Writers MAY use NumPy dtype notation for interoperability with NCZarr.

The following table shows the correspondence between all three notations:

| NumPy dtype (LE) | Zarr v3 type   | NC type     |
| ---------------- | -------------- | ----------- |
| `<i1`            | `int8`         | `NC_BYTE`   |
| `<u1`            | `uint8`        | `NC_UBYTE`  |
| `<i2`            | `int16`        | `NC_SHORT`  |
| `<u2`            | `uint16`       | `NC_USHORT` |
| `<i4`            | `int32`        | `NC_INT`    |
| `<u4`            | `uint32`       | `NC_UINT`   |
| `<i8`            | `int64`        | `NC_INT64`  |
| `<u8`            | `uint64`       | `NC_UINT64` |
| `<f4`            | `float32`      | `NC_FLOAT`  |
| `<f8`            | `float64`      | `NC_DOUBLE` |
| `>S1`            | _(no equiv.)_  | `NC_CHAR`   |
| `\|Sn`           | _(no equiv.)_  | `NC_STRING` |
| _(no equiv.)_    | `bool`         | —           |
| _(no equiv.)_    | `complex64`    | —           |
| _(no equiv.)_    | `complex128`   | —           |

Readers MUST accept both notations. When reading NumPy dtype notation, readers MUST accept both little-endian (`<`) and big-endian (`>`) prefixes. The endian prefix indicates the type's byte width, not the storage endianness of attribute values (which are JSON).

The `_nczarr_attr` object need not annotate every attribute — only those whose default JSON type is insufficient. Unannotated numeric attributes are interpreted at their JSON default type per [Attribute Value Types](#attribute-value-types). The `_nczarr_attr` attribute is reserved by NZUG-1.0 and MUST NOT be used for other purposes. Implementations SHOULD suppress `_nczarr_attr` from user-visible attribute listings.

This mechanism is directly interoperable with datasets produced by [netCDF-C's NCZarr backend](https://docs.unidata.ucar.edu/netcdf-c/current/nczarr_head.html), which uses the same `_nczarr_attr` / `types` structure in Zarr v2 `.zattr` objects. NZUG-1.0 places this structure in Zarr v3 `zarr.json` `attributes`.

### The `_FillValue` Attribute

**\[NZUG addition\]** The attribute name `_FillValue` is reserved as the _semantic missing data indicator_. It is distinct from the storage-level `fill_value` field in `zarr.json`, which specifies the value used to initialize unwritten chunks.

When `_FillValue` is present in an array's attributes, convention-aware readers MUST treat values equal to `_FillValue` as missing data, regardless of the storage `fill_value`. When both are present and differ, `_FillValue` governs masking semantics. The type of `_FillValue` is determined by the `_nczarr_attr` type annotation if present, or defaults to the array's `data_type`.

This decoupling is necessary because Zarr's storage `fill_value` serves a different purpose (chunk initialization) than CF's `_FillValue` (semantic masking). In netCDF, these happen to be the same mechanism; in Zarr, they are independent. NZUG preserves CF's masking semantics by defining `_FillValue` as an attribute with clear precedence over the storage-level field.

## Properties

NZUG-1.0 uses standard (non-namespaced) attribute names. Only attributes that define or support the structural interoperability layer are reserved here. All domain-level attributes — including those defined by CF (e.g., `units`, `long_name`, `scale_factor`, `add_offset`, `coordinates`, `valid_range`) — are left to domain conventions and are not reserved by NZUG-1.0.

### Root Group Attributes

| Attribute     | Type   | Obligation | Semantics                                                         |
| ------------- | ------ | ---------- | ----------------------------------------------------------------- |
| `conventions` | string | MUST       | Space-separated convention identifiers; MUST include `"NZUG-1.0"` |

### Array Attributes

| Attribute      | Type                                                         | Obligation | Semantics                                                                                |
| -------------- | ------------------------------------------------------------ | ---------- | ---------------------------------------------------------------------------------------- |
| `_FillValue`   | (see [The \_FillValue Attribute](#the-_fillvalue-attribute)) | MAY        | Semantic missing data indicator                                                          |
| `_nczarr_attr` | object                                                       | MAY        | Attribute type annotations (see [Attribute Type Annotation](#attribute-type-annotation)) |

### Array Structural Requirements

**\[NZUG addition\]** The following structural requirements apply to all arrays in a NZUG-1.0 dataset:

| Field                       | Location         | Requirement                                                                    |
| --------------------------- | ---------------- | ------------------------------------------------------------------------------ |
| `dimension_names`           | `zarr.json` root | MUST be present; MUST have same length as `shape`; no `null` or `""` entries   |
| shared dimension constraint | within group     | All arrays sharing a dimension label MUST have the same length along that axis |

## Naming Rules

Names of arrays, groups, and attributes in NZUG-1.0 datasets:

- SHOULD begin with a letter (`A`–`Z`, `a`–`z`)
- SHOULD consist of letters, digits, and underscores
- MUST NOT contain the path separator `/`
- Are case-sensitive, but names that differ only by case SHOULD be avoided
- MAY contain period (`.`) or hyphen (`-`), but these are discouraged in names intended to be referenced in attribute values

These rules ensure that NZUG-1.0 names can be used unambiguously in CF attribute values (which reference array names as strings), in CDL text representations, and in URL path components.

## Consolidated Metadata

NZUG-1.0 RECOMMENDS the use of consolidated metadata for datasets served from object storage. When consolidated metadata is present, its content MUST be consistent with the individual `zarr.json` objects it summarizes. Convention-aware readers SHOULD prefer consolidated metadata when available.

Consolidated metadata in Zarr v3 is implemented by zarr-python and proposed for formal standardization in [zarr-specs #309](https://github.com/zarr-developers/zarr-specs/issues/309). NZUG-1.0 adopts the zarr-python convention pending that standardization: consolidated metadata is stored in the root group `zarr.json` under the `consolidated_metadata` key. When zarr-specs #309 is finalized, this section will be updated to cite the formal specification.

## What This Convention Enables (Informative)

A domain convention written against NZUG-1.0 has access to:

- **Named, constrained dimensions.** The shared dimension constraint means that dimension labels within a group carry co-extent guarantees, enabling CF to define co-location of arrays using the same semantics as netCDF.
- **Dimension coordinates.** Identified structurally, without any additional attribute, exactly as coordinate variables are identified in the NUG.
- **Typed attributes.** The `_nczarr_attr` type annotation mechanism (adopted from NCZarr) gives CF a way to express precision requirements for `scale_factor`, `add_offset`, and CRS parameters that would otherwise be lost in JSON serialization.
- **Semantic fill values.** `_FillValue` decoupled from the storage `fill_value`, preserving CF's masking semantics independently of Zarr's chunk initialization behavior.
- **Auxiliary arrays.** The auxiliary array concept is defined structurally, enabling domain conventions like CF to build their own coordinate association mechanisms (e.g., the `coordinates` attribute) on top of NZUG.

### NUG to NZUG Mapping Table

The existing CF conventions document can be applied to NZUG-1.0 datasets by substituting NZUG-1.0 structural concepts for their NUG equivalents:

| NUG concept                     | NZUG-1.0 equivalent                                                |
| ------------------------------- | ------------------------------------------------------------------ |
| netCDF file                     | Zarr v3 hierarchy                                                  |
| dimension                       | dimension label in `dimension_names` + shared dimension constraint |
| variable                        | array                                                              |
| coordinate variable             | dimension coordinate                                               |
| global attribute                | root group attribute                                               |
| variable attribute              | array attribute                                                    |
| typed attribute                 | attribute + optional `_nczarr_attr` type annotation                |
| `_FillValue` variable attribute | `_FillValue` array attribute                                       |
| `Conventions` global attribute  | `conventions` root group attribute                                 |

No changes to the CF conventions document are required to use CF semantics with NZUG-1.0 datasets. A CF-Zarr profile document citing NZUG-1.0 performs the mapping above and declares compliance with both.

## Out of Scope (Informative)

The following topics are explicitly deferred to conventions built on NZUG-1.0. They are active areas of community work in the CF, GeoZarr, and Zarr communities and are not ready for standardization at the structural interoperability layer.

**Coordinate reference systems.** How CRS information is encoded — whether via CF `grid_mapping`, GeoZarr `proj:` attributes, WKT2, PROJJSON, or other mechanisms — is a GeoZarr and CF community question. NZUG-1.0 reserves no CRS-related attribute names and takes no position on encoding.

**Axis order.** The relationship between the order of entries in `dimension_names` and the axis order expressed in a CRS definition is an open problem with known silent failure modes. NZUG-1.0 does not address it.

**Coordinate role identification beyond dimension coordinates.** Whether an array is a latitude coordinate, a time coordinate, or a vertical coordinate is determined by CF standard names, units, and the `axis` attribute. NZUG-1.0 identifies only dimension coordinates structurally; all further coordinate semantics are left to CF.

**Auxiliary coordinate association.** How auxiliary arrays are linked to data arrays (e.g., CF's `coordinates` attribute) is a domain convention concern. NZUG-1.0 defines the auxiliary array concept but does not reserve attribute names for declaring those relationships.

**Data description attributes.** Attribute names for units, long names, valid ranges, packing parameters (scale_factor, add_offset), and similar descriptive metadata are defined by domain conventions such as CF, not by NZUG-1.0.

**Unlimited dimensions.** The NUG supports unlimited dimensions for record-oriented appending. Zarr has no equivalent concept. NZUG-1.0 does not define one.

**User-defined types.** Enumerated, opaque, variable-length, and compound types from the netCDF-4 enhanced data model have no Zarr v3 equivalents. NZUG-1.0 does not address them.

**Aggregation and virtual datasets.** Kerchunk, Icechunk, and related virtual store approaches are out of scope.

**Inter-group dimension relationships.** NZUG-1.0 scopes the shared dimension constraint to within a group. Whether dimension labels carry meaning across group boundaries is left to domain conventions.

## Normative Summary

A NZUG-1.0 compliant dataset:

1. Is a valid Zarr v3 dataset.
2. Has `"NZUG-1.0"` in the `conventions` attribute of its root group `zarr.json`.
3. Has fully populated `dimension_names` (no `null` or empty-string entries) in every array `zarr.json`.
4. Satisfies the shared dimension constraint: within any group, all arrays sharing a dimension label have the same length along that axis.
5. Uses `_FillValue` in array attributes (when present) as the semantic missing data indicator, distinct from the storage `fill_value`.
6. Uses `_nczarr_attr` in array attributes (when present) to annotate numeric attribute precision using NumPy dtype notation or Zarr v3 data type names.
7. Uses reserved attribute names only as defined in [Properties](#properties).
8. Uses array and group names conforming to [Naming Rules](#naming-rules).

## Appendix A: Differences from the Zarr v3 Specification

| Topic                       | Zarr v3 spec                    | NZUG-1.0                                                  |
| --------------------------- | ------------------------------- | --------------------------------------------------------- |
| `dimension_names`           | Optional; entries may be `null` | Required; all entries must be non-null, non-empty strings |
| Shared dimension constraint | Not defined                     | Required within groups                                    |
| Dimension coordinate        | Not defined                     | Defined structurally                                      |
| Attribute type system       | JSON types only                 | JSON types + `_nczarr_attr` type annotation               |
| `_FillValue` semantics      | Not defined                     | Defined, decoupled from `fill_value`                      |
| Reserved attribute names    | Not defined                     | Defined in [Properties](#properties)                      |

## Appendix B: Differences from the NetCDF Users Guide

| Topic                   | NUG (netCDF)                                                       | NZUG-1.0                                                                                         |
| ----------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| Dimension definition    | Declared, named, and sized; shared by structural reference in file | Label in `dimension_names`; co-extent enforced by shared dimension constraint                    |
| Coordinate variable     | 1D variable whose name matches a dimension name                    | Array whose `dimension_names` entry matches its own name and whose values are strictly monotonic |
| Attribute type          | Declared NC type (`NC_FLOAT`, `NC_DOUBLE`, etc.)                   | JSON type + optional `_nczarr_attr` type annotation (NumPy dtype or Zarr v3 data type name)      |
| `Conventions` attribute | Root-level string, capital C                                       | `conventions` root group attribute; `Conventions` treated as equivalent during reading           |
| Unlimited dimension     | Supported                                                          | Not defined (out of scope)                                                                       |
| User-defined types      | Supported in netCDF-4                                              | Not defined (out of scope)                                                                       |
| File identification     | `.nc` suffix                                                       | `"zarr_format": 3` in root `zarr.json`                                                           |

## Known Implementations

This section helps potential implementers assess the convention's maturity and adoption, and provides a way for the community to collaborate on future revisions.

### Libraries and Tools

_No implementations yet. This convention is in the Proposal stage._

The following tools already use patterns compatible with NZUG-1.0:

- **[netCDF-C (NCZarr)](https://docs.unidata.ucar.edu/netcdf-c/current/nczarr_head.html)** — C library for netCDF data access. NCZarr's `_nczarr_attr` type annotation pattern is adopted by NZUG-1.0 for attribute type preservation.
- **[xarray](https://github.com/pydata/xarray)** — Python library for labeled multi-dimensional arrays. Uses `dimension_names`, `_FillValue`, and `conventions` attributes when reading/writing Zarr.
- **[netCDF-Java](https://github.com/Unidata/netcdf-java)** — Java library for scientific data access. Implements NUG semantics that NZUG-1.0 is designed to parallel.

### Datasets Using This Convention

_No datasets yet. Community contributions welcome._

### Resources

- [zarr-conventions discussions](https://github.com/orgs/zarr-conventions/discussions) — Community forum for convention development
- [CF Metadata Conventions](https://cfconventions.org/) — Primary domain convention this spec supports
- [Zarr v3 Specification](https://zarr-specs.readthedocs.io/en/latest/v3/core/v3.0.html) — Underlying format specification
- [NetCDF Users Guide](https://docs.unidata.ucar.edu/nug/current/) — The structural reference NZUG-1.0 parallels

_If you implement or use this convention, please add your implementation to this list by submitting a pull request._

## Acknowledgements

This convention specification is based on the [zarr-conventions template](https://github.com/zarr-conventions/template), which is itself based on the [STAC extensions template](https://github.com/stac-extensions/template/blob/main/README.md). The structural concepts are derived from the [NetCDF Users Guide](https://docs.unidata.ucar.edu/nug/current/) and adapted for the Zarr v3 data model.
