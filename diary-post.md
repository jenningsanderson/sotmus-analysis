State of the Map US 2018: OpenStreetMap Data Analysis Workshop
----------------------------------------------------
Jennings Anderson & Seth Fitzsimmons

#### Workshop Abstract

_With an overflowing Birds-of-a-Feather session on “OSM Data Analysis” the past few years at State of the Map US, we’d like to leave the nest as a flock. Many SotM-US attendees build and maintain various OSM data analysis systems, many of which have been and will be presented in independent sessions. Further, better analysis systems have yet to be built, and OSM analysis discussions often end with what is left to be built and how it can be done collaboratively. Our goal is to bring the data-analysis back into the discussion through an interactive workshop. Utilizing web-based interactive computation notebooks such as Zeppelin and Jupyter, we will step through the computation and visualization of various OpenStreetMap metrics._

### 1. How?
To pull this off, we're going to skip the messy data-wrangling parts of OSM data analysis and pre-process a number of datasets with [osm-wayback](https://github.com/osmlab/osm-wayback) and [osmesa](https://github.com/azavea/osmesa). The end result is a series of CSV files with various editing histories for each



### 1. Background
There is a story behind every object on the map. OSM is more than an open map of the world. It is the cumulative product of billions of edits by nearly 1M active contributors (and another 4M registered users). Each object can be edited multiple times. Each time the major attributes of an object are changed in OSM, the version number is incremented. To get a rough idea of how many major changes exist in the current map, we can count the version numbers for every object in the latest [osm-qa-tiles](https://osmlab.github.io/osm-qa-tiles/). This isn't _every single_ object in OSM, but includes nearly all roads, POIs, and buildings.

> ![ Histogram of Object Versions from OSM-QA-Tiles ](assets/osm_objects_by_version.png)

> OSM object versions by type. 475M objects in OSM have only been edited once, meaning they were created and haven't been subsequently edited in a major way. However, more than 200M have been edited more than once. _Note: Less than 10% of these edits are from bots, or imports._

To understand the evolution of the map, we need analysis tools that can expose these rich editing histories. There are a plethora of community-maintained tools out there to help parse and process the massive OSM database though none of them currenlty handle the full-history of each object on the map. Questions such as "how many contributors have been active in this particular area?" are then very difficult to answer at scale. As we should expect, this number varies drastically around the globe:

> ![ Map of 2015 users](assets/more_than_10_editors_2015.png)
> Map of areas with more than 10 active contributors in 2015 [source](http://mapbox.github.io/osm-analysis-collab/editor-density?yearIdx=10&layer=0&minUsers=10&minObjects=1&#3/30.72/15.15). The euro-centric editing focus doesn't surprise us, but this map also shows another area with an unprecedent number of active contributors in 2015: Nepal. This was in response to the April 2015 Nepal Earthquake. This is just one of many examples of the OSM editing history being situational, complex and often difficult to conceptualize at scale.

The purpose of this workshop was two-fold: first, we wanted to take the OSM data analysis discussion past the "how do we best handle the data?" to actual _analysis_ and second, we hoped that providing such an environment to explore the data would in turn generate more questions around the data: What is it that people want to measure? What are the insightful analytics?

### 2. Data Prepration
This was the most hand-wavey part of the workshop, and intentionally so. Seth and I have been tackling the problems of historical OpenStreetMap data representation for a long time. We have been building independent analysis infrastructures in parallel. We are hardly the first do to so, but are some of the few to have not given up and moved on. The first



#### Single dataset, multiple results
Preparing for this workshop was one of the first times Seth and I have had a chance to compare some of the numbers produced by [OSMesa](//github.com/azavea/osmesa) and [OSM-Wayback](//github.com/osmlab/osm-waybac), our respective full-history analysis infrastructures. As expected, there were differences in how we count objects and versioning, but we were able to think through these differences and

##### Differences:

OSMesa generally produces and counts more objects than OSM-Wayback. This is because it (a) handles multipolygons and relations better (more true to the original OSM data structure) and (b) includes deleted objects. OSM-Wayback is designed to enrich a


### 1. Interative Analysis Environment

[Jupyter notebooks](http://jupyter.org) allowed us to host a single analysis environment for everyone and each participant did not have to install or run any analysis software on their own machines.

*Post Workshop*: Want to recreate the analysis environment on your own?

1. [Download Jupyter](//jupyter.org)
2. Clone this repository: [jenningsanderson/sotmus-analysis](//github.com/jenningsanderson/sotmus-analysis)
3. Run Jupyter and nagivage to `sotmus-analysis/analysis/` for the notebook examples.


### Available Notebooks &amp; Datasets
We pre-processed data for a variety of regions for with the following resolution:

1. [Per User Stats]()
2. [Per Changeset Stats]()
3. [Per Edit Stats]()


#### 1. Per User Stats
A comprehensive summary of editing statistics (new buildings, edited buildings, km of new roads, edited roads, number of sidewalks, etc.) [see full list here]() that are totaled for each user active in the area of interest. This dataset is ideal for comparing editing activity among users. Who has edited the most? Who is creating the most buildings? This dataset is great for building leaderboards and getting a general idea of how many users are active in an area and what the distribution of work per user looks like.

#### 2. Per Changeset Stats
The same editing statistics as above (see [full list of columns here]()) but with higher resolution: grouped by the changeset. A changeset is a very logical unit of anlaysis for looking at the evolution of the map in a given area. Since each changeset can only be from one user, this is the next level of detail from user summaries. Since changeset IDs are sequential, this is a great dataset for time-series analysis.

#### 3. Per Edit Stats
This dataset records each individual edit to the map. This dataset is best for understanding exactly what changed on the map with each edit. Each edit tracks the tags changed as well as the geometry changes (if any). This dataset is (not surprisingly) significantly larger than the other two.















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
