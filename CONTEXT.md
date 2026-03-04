# NZUG Development Context

This document captures the design decisions, open questions, and key references for the
**NZUG (NetCDF-Zarr Users Guide)** convention. It is intended to orient contributors and
to resume working sessions without re-deriving settled conclusions. This content was 
generated to document and iterative development process using Claude Opus 4.6.

---

## What NZUG Is

NZUG is a Zarr convention that provides the same structural role for the Zarr ecosystem
that the format definition parts of the [NetCDF Users Guide (NUG)](https://docs.unidata.ucar.edu/nug/current/) provides
for netCDF. It defines the minimum set of constraints above the Zarr v3 spec — structural
vocabulary, a typed data model, naming rules, and reserved attributes — that allows domain
conventions (primarily CF) to operate on Zarr data without modification to those domain
conventions.

**The single most important framing:** NZUG allows CF to be applied to Zarr by substituting
"NZUG array" for "NUG variable" and "NZUG hierarchy" for "netCDF file" throughout the CF
spec. No changes to CF are required.

---

## Key References

| Resource                              | URL                                                             | Role                                                           |
| ------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------- |
| Zarr v3 specification                 | https://zarr-specs.readthedocs.io/en/latest/v3/core/v3.0.html   | Format spec NZUG builds on                                     |
| zarr-conventions-spec                 | https://github.com/zarr-conventions/zarr-conventions-spec       | Framework NZUG registers within                                |
| zarr-conventions org                  | https://github.com/zarr-conventions                             | Home for registered conventions                                |
| NetCDF Users Guide                    | https://docs.unidata.ucar.edu/nug/current/                      | Structural analogue NZUG replaces                              |
| CF Metadata Conventions               | https://cfconventions.org/                                      | Primary domain convention NZUG enables                         |
| NCZarr documentation                  | https://docs.unidata.ucar.edu/netcdf-c/current/nczarr_head.html | Unidata's existing netCDF-C Zarr backend; related but distinct |
| GeoZarr spec                          | https://github.com/zarr-developers/geozarr-spec                 | Higher-level convention; NZUG is explicitly out of its scope   |
| CF conventions discussion #463        | https://github.com/orgs/cf-convention/discussions/463           | CF community thread that motivated NZUG                        |
| zarr-developers discussion #76        | https://github.com/orgs/zarr-developers/discussions/76          | NZUG proposal thread in zarr-developers                        |
| zarr-specs consolidated metadata #309 | https://github.com/zarr-developers/zarr-specs/issues/309        | Tracks formal standardization of consolidated metadata         |

---

## Settled Design Decisions

### Convention name and declaration

- Convention identifier is **`NZUG-1.0`** (previously explored as `NZarr-1.0`; name still
  subject to community input but the identifier format is settled).
- Declaration via `"conventions": "NZUG-1.0"` in root group `attributes`. Space-separated
  for multi-convention datasets: `"conventions": "NZUG-1.0 CF-1.12"`.
- `Conventions` (capital C, NUG legacy) treated as equivalent to `conventions` during reading.
- A `zarr_conventions` CMO entry (per zarr-conventions-spec framework) is optional but
  recommended. See Appendix C of the spec for the registration object template.

### Zarr v3 as baseline

NZUG is written against **Zarr v3**, not v2. Key v3 features that motivated this:

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
| `_type` annotation              | JSON object in `attributes` mapping attribute names to explicit NZarr type identifiers                                         | ✅ Ignoring causes silent precision loss, not read failure |
| `_FillValue` semantics          | Semantic missing data indicator, decoupled from storage `fill_value`                                                           | ✅ Ignoring means no masking, not a read failure           |
| Reserved attribute names        | Root group and array attribute names reserved with defined semantics                                                           | ✅ Seen as opaque key-value pairs by naive readers         |

**One requirement that was identified as out of scope for a zarr-convention:**
Scalar array reader support (`shape: []`) was originally framed as a MUST for implementations.
This is a reader capability demand, not an interpretive convention, and conflicts with the
zarr-conventions-spec requirement that conventions be safely ignorable. This has been softened
to a SHOULD or reframed as informative.

### Attribute namespacing

The zarr-conventions-spec SHOULD (not MUST) use namespace prefixes or nesting to avoid
collisions. NZUG uses flat unprefixed attributes by design, for two reasons:

1. These attribute names (`_FillValue`, `scale_factor`, `coordinates`, etc.) already have
   de facto ecosystem-wide meaning — xarray, netCDF-python, and CF tools read them from
   Zarr `attributes` today. Prefixing would break all existing tooling.
2. NZUG occupies the structural substrate tier, not the domain-convention tier that the
   namespacing guidance targets. The analogy: `zarr_format` and `node_type` are also
   unprefixed structural fields.

**Exception flagged:** `_type` is novel (no existing ecosystem precedent) and could
reasonably take a prefix (e.g., `nzug:type`) without breaking anything. This remains open
for community input.

### Separation of concerns — what is explicitly out of scope

This scoping is load-bearing. NZUG does not take positions on:

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

The intent: NZUG can be ratified independently of the active GeoZarr and CF-Zarr debates.
Progress on those debates does not block NZUG, and NZUG ratification does not prejudice them.

### Consolidated metadata

NZUG RECOMMENDS (not requires) consolidated metadata for object storage datasets, following
the zarr-python convention (stored under `consolidated_metadata` in root `zarr.json`).
Will be upgraded to MUST when zarr-specs #309 is finalized.

---

## The NUG → NZUG Substitution Table

This table is the core deliverable. A CF-Zarr profile document cites NZUG and performs
these substitutions; the CF spec itself is unchanged.

| NUG concept                        | NZUG equivalent                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------ |
| netCDF file                        | Zarr v3 hierarchy                                                              |
| dimension                          | dimension label in `dimension_names` + shared dimension constraint             |
| variable                           | array                                                                          |
| coordinate variable                | dimension coordinate (1D array, `dimension_names` matches own name, monotonic) |
| global attribute                   | root group attribute                                                           |
| variable attribute                 | array attribute                                                                |
| typed attribute (`NC_FLOAT`, etc.) | attribute + optional `_type` annotation                                        |
| `_FillValue` variable attribute    | `_FillValue` array attribute                                                   |
| `Conventions` global attribute     | `conventions` root group attribute                                             |

---

## Open Questions

- **Convention name:** `NZUG-1.0` vs `NZarr-1.0` vs something else. The zarr-conventions-spec
  uses UUID as primary identifier so the string name matters less for machine identification,
  but matters for human legibility and citation.
- **`_type` namespacing:** Should `_type` take a prefix (`nzug:type`) given it is novel and
  has no legacy tooling to break?
- **Scalar arrays:** Soften to SHOULD or drop from normative content entirely and move to
  informative?
- **Repository home:** zarr-conventions org is the natural home. Requires someone with org
  access to create the repo (USGS GitHub policy prevents creating repos under personal or
  org accounts for this work).
- **UUID registration:** A UUID and `schema_url` are needed for the zarr-conventions-spec
  CMO. These are assigned at registration time.

---

## Relationship to NCZarr

NCZarr is Unidata's implementation of netCDF-C on top of Zarr. It solves some of the same
problems (shared dimensions via `.nczgroup`, coordinate variables) but is tied to the
netCDF-C library and its `.nczarr` metadata extensions. NZUG is not NCZarr: it is a
community convention that any implementation can adopt, defined wholly on top of the Zarr
v3 spec without netCDF-C library dependencies.
