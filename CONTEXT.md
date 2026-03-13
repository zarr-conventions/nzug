# NZ Development Context

This document captures the design decisions, open questions, and key references for the
**NZ (NetCDF-Zarr)** convention. It is intended to orient contributors and
to resume working sessions without re-deriving settled conclusions. This content was 
generated to document and iterative development process using Claude Opus 4.6.

---

## What NZ Is

NZ is a Zarr convention that provides the same structural role for the Zarr ecosystem
that the format definition parts of the [NetCDF Users Guide (NUG)](https://docs.unidata.ucar.edu/nug/current/) provides
for netCDF. It defines the minimum set of constraints above the Zarr v3 spec — structural
vocabulary, a typed data model, naming rules, and reserved attributes — that allows domain
conventions (primarily CF) to operate on Zarr data without modification to those domain
conventions.

**The single most important framing:** NZ allows CF to be applied to Zarr by substituting
"NZ array" for "NUG variable" and "NZ hierarchy" for "netCDF file" throughout the CF
spec. No changes to CF are required.

---

## Key References

| Resource                              | URL                                                             | Role                                                           |
| ------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------- |
| Zarr v3 specification                 | https://zarr-specs.readthedocs.io/en/latest/v3/core/v3.0.html   | Format spec NZ builds on                                     |
| zarr-conventions-spec                 | https://github.com/zarr-conventions/zarr-conventions-spec       | Framework NZ registers within                                |
| zarr-conventions org                  | https://github.com/zarr-conventions                             | Home for registered conventions                                |
| NetCDF Users Guide                    | https://docs.unidata.ucar.edu/nug/current/                      | Structural analogue NZ replaces                              |
| CF Metadata Conventions               | https://cfconventions.org/                                      | Primary domain convention NZ enables                         |
| NCZarr documentation                  | https://docs.unidata.ucar.edu/netcdf-c/current/nczarr_head.html | Unidata's existing netCDF-C Zarr backend; related but distinct |
| GeoZarr spec                          | https://github.com/zarr-developers/geozarr-spec                 | Higher-level convention; NZ is explicitly out of its scope   |
| CF conventions discussion #463        | https://github.com/orgs/cf-convention/discussions/463           | CF community thread that motivated NZ                        |
| zarr-developers discussion #76        | https://github.com/orgs/zarr-developers/discussions/76          | NZ proposal thread in zarr-developers                        |
| zarr-specs consolidated metadata #309 | https://github.com/zarr-developers/zarr-specs/issues/309        | Tracks formal standardization of consolidated metadata         |

---

## Settled Design Decisions

### Convention name and declaration

- Convention identifier is **`NZ-1.0`** (previously explored as `NZarr-1.0` and `NZUG-1.0`; name still subject to community input but the identifier format is settled).
- Declaration via `"conventions": "NZ-1.0"` in root group `attributes`. Space-separated
  for multi-convention datasets: `"conventions": "NZ-1.0 CF-1.12"`.
- `Conventions` (capital C, NUG legacy) treated as equivalent to `conventions` during reading.
- A `zarr_conventions` CMO entry in a **dataset** (per zarr-conventions-spec framework) is
  optional but recommended. The spec's Convention Declaration note correctly says datasets
  "MAY additionally include" this entry.
- The spec's "Convention Registration" section shows the CMO object that registers **the
  convention itself** in the zarr-conventions framework — a one-time act by the convention
  author, not a per-dataset requirement. These are two different things and should not be
  confused. The spec prose "The convention must be registered" describes the convention's
  own framework registration; it does not impose a MUST on datasets.

### Zarr v3 as baseline

NZ is written against **Zarr v3**, not v2. Key v3 features that motivated this:

- `dimension_names` is a first-class field in `zarr.json` (promoted from xarray's
  `_ARRAY_DIMENSIONS` attribute convention).
- `fill_value` is structurally distinct from user attributes, enabling clean separation
  from `_FillValue`.
- Unified `zarr.json` per node replaces v2's `.zgroup`/`.zarray`/`.zattrs` triplets.

### Normative additions above Zarr v3

Each addition was verified to be **safely ignorable** by a naive Zarr v3 reader — the data
remains readable; only interpretation is affected.

| Addition                        | Description                                                                                                                    | Safely ignorable?                                          |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| `dimension_names` required      | Every array MUST have fully populated `dimension_names` (no null/empty entries)                                                | ✅ Producer constraint only                                |
| Shared dimension constraint     | Within a group, arrays sharing a dimension label MUST have the same length along that axis                                     | ✅ Producer constraint only                                |
| Dimension coordinate definition | Structural identification: 1D array whose `dimension_names` entry matches its own name and whose values are strictly monotonic | ✅ Interpretive only                                       |
| `_nczarr_attr` annotation       | JSON object in `attributes` with a `"types"` key mapping attribute names to Zarr v3 type identifiers; adopted from NCZarr     | ✅ Ignoring causes silent precision loss, not read failure |
| `_FillValue` semantics          | Semantic missing data indicator, decoupled from storage `fill_value`                                                           | ✅ Ignoring means no masking, not a read failure           |
| Reserved attribute names        | Root group and array attribute names reserved with defined semantics                                                           | ✅ Seen as opaque key-value pairs by naive readers         |

**On scalar arrays and the safely-ignorable constraint:**
Scalar arrays (`shape: []`) are valid Zarr v3 — they are not an NZ invention. The Zarr v3
spec permits arrays with empty shape. Because scalar arrays are already part of the Zarr v3
format spec that NZ builds on, NZ can require them without violating the safely-ignorable
principle. The principle means NZ cannot require reader capabilities *beyond* Zarr v3; it
does not prevent NZ from requiring conformant use of Zarr v3 features that implementations
may have simply not exercised yet.

The distinction matters more broadly: NZ may normatively require any behavior that is
already permitted by Zarr v3 (structural constraints, required fields, type annotations in
attributes). What NZ cannot do is require new format-level capabilities that would cause a
naive Zarr v3 reader to fail on NZ datasets.

### Attribute namespacing

The zarr-conventions-spec SHOULD (not MUST) use namespace prefixes or nesting to avoid
collisions. NZ uses flat unprefixed attributes by design, for two reasons:

1. These attribute names (`_FillValue`, `scale_factor`, `coordinates`, etc.) already have
   de facto ecosystem-wide meaning — xarray, netCDF-python, and CF tools read them from
   Zarr `attributes` today. Prefixing would break all existing tooling.
2. NZ occupies the structural substrate tier, not the domain-convention tier that the
   namespacing guidance targets. The analogy: `zarr_format` and `node_type` are also
   unprefixed structural fields.

**Note:** `_nczarr_attr` is adopted from NCZarr (netCDF-C's Zarr backend), which uses the
same `_nczarr_attr` / `types` structure in Zarr v2 `.zattrs`. Using this established pattern
avoids a novel reserved name and provides direct interoperability with NCZarr-produced datasets.

### Separation of concerns — what is explicitly out of scope

This scoping is load-bearing. NZ does not take positions on:

- Coordinate reference systems and CRS encoding (GeoZarr, CF `grid_mapping`)
- Axis order and its relationship to CRS definitions
- Coordinate role identification beyond dimension coordinates (latitude, time, vertical)
- Cell methods, bounds, climatological statistics
- Discrete sampling geometries
- Multi-scale / pyramidal structures
- Inter-group dimension relationships
- Unlimited dimensions
- User-defined types (enums, compounds)
- Aggregation / virtual datasets (Kerchunk, Icechunk)

The intent: NZ can be ratified independently of the active GeoZarr and CF-Zarr debates.
Progress on those debates does not block NZ, and NZ ratification does not prejudice them.

### Consolidated metadata

NZ RECOMMENDS (not requires) consolidated metadata for object storage datasets, following
the zarr-python convention (stored under `consolidated_metadata` in root `zarr.json`).
Will be upgraded to MUST when zarr-specs #309 is finalized.

---

## The NUG → NZ Substitution Table

This table is the core deliverable. A CF-Zarr profile document cites NZ and performs
these substitutions; the CF spec itself is unchanged.

| NUG concept                        | NZ equivalent                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------ |
| netCDF file                        | Zarr v3 hierarchy                                                              |
| dimension                          | dimension label in `dimension_names` + shared dimension constraint             |
| variable                           | array                                                                          |
| coordinate variable                | dimension coordinate (1D array, `dimension_names` matches own name, monotonic) |
| global attribute                   | root group attribute                                                           |
| variable attribute                 | array attribute                                                                |
| typed attribute (`NC_FLOAT`, etc.) | attribute + optional `_nczarr_attr` type annotation                            |
| `_FillValue` variable attribute    | `_FillValue` array attribute                                                   |
| `Conventions` global attribute     | `conventions` root group attribute                                             |

---

## Open Questions

- **Convention name:** `NZ-1.0` vs `NZUG-1.0` vs `NZarr-1.0` vs something else. The zarr-conventions-spec
  uses UUID as primary identifier so the string name matters less for machine identification,
  but matters for human legibility and citation.
- **Scalar arrays:** The MUST on reader support is appropriate (scalar arrays are valid Zarr
  v3, not an NZ addition). The remaining question is whether the informative motivation text
  (use as single-valued coordinate variables) is sufficient, or whether the normative section
  should be more explicit about what "support" means for producers vs. readers.
- **Repository home:** zarr-conventions org is the natural home. Requires someone with org
  access to create the repo (USGS GitHub policy prevents creating repos under personal or
  org accounts for this work).
- **UUID registration:** A UUID and `schema_url` are needed for the zarr-conventions-spec
  CMO. These are assigned at registration time.

---

## Relationship to NCZarr

NCZarr is Unidata's implementation of netCDF-C on top of Zarr. It solves some of the same
problems (shared dimensions via `.nczgroup`, coordinate variables) but is tied to the
netCDF-C library and its `.nczarr` metadata extensions. NZ is not NCZarr: it is a
community convention that any implementation can adopt, defined wholly on top of the Zarr
v3 spec without netCDF-C library dependencies.
