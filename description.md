### State of the Map US 2018: OSM Data Analysis Workshop

**Purpose**: OSM data analysis can be an overwhelming and daunting task for a multitude of reasons. First, the data is _big_. While the definition of what consitutes as "big data" is often contested, a database with a planet's worth of geospatial data is certainly not a small dataset. Furthermore, in its most compact form, the data requires specific utilities to be consumed.

The data is self-referential. As simple as the OSM data model aims to be, it becomes complicated out of it's primary context. Designed to work in a relational database, OSM objects require nontrivial reconstruction steps to exist on their own: the coordinates embedded in node objects need to be extracted and re-embedded into the individual objects that reference them.

Lastly, while the full-history of OSM is available, the nuances of the _entire editing history_ is hidden within.



#### What is an Edit?
There are many ways to edit the map. Perhaps the most obvious is the creation of objects on the map. In terms of the editing record, these are objects edited where their version number is 1. After the creation of an object, there are two types of edits that can subsequently occur: an edit to either the geoemtry or the metadata. Depending on the type of geometry edit, there may or may not be a corresponding increment in the version number property of the object. We call these intermediate geometry versions minor versions. The other type of edit is strictly to the object's tags. 
adding the height of a building or the name of a road or store are all examples of these edits. 

It is also common for these metadata to be created at the same time as the object itself, with the version 1 geometry creation. When counting edits to the map, then, how should we quantify these different types of edits? That is, if measuring for a single unit of "work," are all edits equal?


### Workshop Approach
To ensure that workshop attendees don't spend a lot of time wrangling wrangling OSM data, we have created CSV exports for various regions of the US, corresponding mainly to major cities. These are not exports of raw OSM data, but instead specifically formatted CSVs typically with one OSM object or one edit to an OSM object per line. These human and machine-readable files are not always the most space efficient but they are designed to be easily consumed by popular data science tools such as Python or R. 

These CSVs differ from the raw editing record of OSM objects by including the following:
 - All edits to objects, including changes to minor geometries.
 - Only edits to identifiable objects. That is, a road exists as a single element, not one element (way) that references other objects (nodes) -- and unless the nodes have their own tags (represent a stoplight in an intersection, for example, these individual nodes are not recorded.
 - Calculated deltas between versions. Instead of calculating the 
