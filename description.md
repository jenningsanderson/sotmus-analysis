State of the Map US 2018: OpenStreetMap Data Analysis Workshop
=============
Jennings Anderson & Seth Fitzsimmons

Workshop: October 2018

#### Workshop Abstract

_With an overflowing Birds-of-a-Feather session on “OSM Data Analysis” the past few years at State of the Map US, we’d like to leave the nest as a flock. Many SotM-US attendees build and maintain various OSM data analysis systems, many of which have been and will be presented in independent sessions. Further, better analysis systems have yet to be built, and OSM analysis discussions often end with what is left to be built and how it can be done collaboratively. Our goal is to bring the data-analysis back into the discussion through an interactive workshop. Utilizing web-based interactive computation notebooks such as Zeppelin and Jupyter, we will step through the computation and visualization of various OpenStreetMap metrics._

### tl;dr: 
We skip the messy data-wrangling parts of OSM data analysis by pre-processing a number of datasets with [osm-wayback](https://github.com/osmlab/osm-wayback) and [osmesa](https://github.com/azavea/osmesa). This creates a series of CSV files with editing histories for a variety of US cities which workshop participants can immediately load into example analysis notebooks to quickly visualize OSM edits without ever having to touch raw OSM data.

## 1. Background
OpenStreetMap is more than an open map of the world: it is the cumulative product of billions of edits by nearly 1M active contributors (and another 4M registered users). Each object on the map  can be edited multiple times. Each time the major attributes of an object are changed in OSM, the version number is incremented. To get a general idea of how many major changes exist in the current map, we can count the version numbers for every object in the latest [osm-qa-tiles](https://osmlab.github.io/osm-qa-tiles/). This isn't _every single_ object in OSM, but includes nearly all roads, POIs, and buildings.

> ![ Histogram of Object Versions from OSM-QA-Tiles ](assets/osm_objects_by_version.png)

> OSM object versions by type. 475M objects in OSM have only been edited once, meaning they were created and haven't been subsequently edited in a major way. However, more than 200M have been edited more than once. _Note: Less than 10% of these edits are from bots, or imports._

Furthermore, when a contributor edits the map, the effect that their edit has depends on the type of OSM element that was modified. Moving nodes may also affect the geometry of ways and relations (lines and polygons) without those elements needing to be touched. Thus, a contributor's edits may have an indirect effect elsewhere (we track these as "minor versions"). Conversely, when editing a way or relation's tags, no geometries are modified, so counts within defined geographical boundaries often don't incorporate these edits. Therefore, to better understand the evolution of the map, we need analysis tools that can expose and account for these rich and nuanced editing histories. There are a plethora of community-maintained tools out there to help parse and process the massive OSM database though none of them currently handle the full-history and relationship between every object on the map. Questions such as "how many contributors have been active in this particular area?" are then very difficult to answer at scale. As we should expect, this number also varies drastically around the globe:

> ![ Map of 2015 users](assets/more_than_10_editors_2015.png)
> Map of areas with more than 10 active contributors in 2015 [source](http://mapbox.github.io/osm-analysis-collab/editor-density?yearIdx=10&layer=0&minUsers=10&minObjects=1&#3/30.72/15.15). The euro-centric editing focus doesn't surprise us, but this map also shows another area with an unprecedented number of active contributors in 2015: Nepal. This was in response to the April 2015 Nepal Earthquake. This is just one of many examples of the OSM editing history being situational, complex and often difficult to conceptualize at scale.



### Putting on a Workshop

The purpose of this workshop was two-fold: first, we wanted to take the OSM data analysis discussion past the "how do we best handle the data?" to actual _data analysis_. The complicated and often messy editing history of objects in OSM make simply transforming the data into something to be read by common data-science tools an exceedingly difficult task (described next).  Second, we hoped that providing such an environment to explore the data would in turn generate more questions around the data: What is it that people want to measure? What are the insightful analytics?

## 2. Preparing the Data: What is Available?

This was the most hand-wavey part of the workshop, and intentionally so. Seth and I have been tackling the problems of historical OpenStreetMap data representation independently for a few years now. Preparing for this workshop was one of the first times we had a chance to compare some of the numbers produced by [OSMesa](//github.com/azavea/osmesa) and [OSM-Wayback](//github.com/osmlab/osm-waybac), the respective full-history analysis infrastructures that we're building. As expected, there were some differences in our results based on howe we count objects and measure history, so this was a fantastic opportunity to sit down and talk through these differences and validate our measures. In short, there are many ways that people can edit the map and it's important to distinguish between the following edit types:

1. Creating a new object
2. Slightly editing an existing object's geometry (move the nodes around in a way)
3. Majorly editing an existing object's geometry (delete or add nodes in a way)
4. Edit an existing object's attributes (tag changes)
5. Delete an existing object

All but edit type 2 result in an increase in the version number of the OSM object. This makes identifying the edit easier at the OSM element level because the version number is true to the number of times the object has been edited. Edit type 2, however, a slight change to an object's geometry is a common edit that is often overlooked because it is not reflected in the version number. Moving the corners of a building to "square it up" or correcting a road to align better with aerial imagery are just two examples of edit type 2. We call these changes  **_minor versions_**. To account for these edits, we add a metadata field to an object called `minor version` that is `0` for newly created objects and `> 0` for any number of minor version changes between a major version. When another major version is created, the minor version is reset to `0`. For more information on minor versions and how osm-wayback calculates them, see [this document](https://github.com/osmlab/osm-wayback/).

#### Quantifying Edits
Each of the above edit types refer to a single map object. In this context, we consider map objects to be OSM objects which have some level of detailed attribute. As opposed to OSM elements (nodes, ways, or relations), an object is the logical representation of a real-world object: road, building, or POI. This is an important distinction to make when talking about OSM data because this is not a 1-1 relationship. OSM elements do not represent map objects. A rectangular building object, for example, is at minimum 5 OSM elements: at least 4 nodes (likely untagged) that define the corners and the way that references these nodes with an attribute of `building=*`. An edit to any one of these objects is then considered an edit to this building.

This may seem obvious when thinking about editing OpenStreetMap and how the map gets made, but reconstructing this version of OSM editing history from the database is difficult and largely remains an unsolved (unimplemented) problem at the global scale: i.e., there does not yet exist a single end-point to a service to simply reconstruct the history of any arbitrary object with regards to all 5 types of edits mentioned above.

#### Making the data Available
For this workshop then, we pre-computed a number of statistics for various cities that describe the historical OSM editing record at per-edit, per-changeset, and per-user granularities (further described below).


## 3. Interactive Analysis Environment

[Jupyter notebooks](http://jupyter.org) allowed us to host a single analysis environment for the workshop such that each participant did not have to install or run any analysis software on their own machines. This saved a lot of time and allowed participants to jump right into analysis. For the workshop, we used a single machine operated by ChameleonCloud.org and funded by the National Science Foundation to host the environment. I hope to provide this type of service again at other conferences or workshops. [Please be in touch](mailto:jennings.anderson@colorado.edu) if you are interested in hosting a similar workshop and I can see if hosting a similar environment for a short duration is possible!

Otherwise, it is possible to recreate the analysis environment locally with the following steps: 

1. [Download Jupyter](//jupyter.org)
2. Clone this repository: [jenningsanderson/sotmus-analysis](//github.com/jenningsanderson/sotmus-analysis)
3. Run Jupyter and navigate to `sotmus-analysis/analysis/` for the notebook examples.


## 4. Available Notebooks &amp; Datasets
We pre-processed data for a variety of regions with the following resolution:

1. [Per User Stats]()
2. [Per Changeset Stats]()
3. [Per Edit Stats]()


#### 1. Per User Stats
A comprehensive summary of editing statistics (new buildings, edited buildings, km of new roads, edited roads, number of sidewalks, etc.) [see full list here]() that are totaled for each user active in the area of interest. This dataset is ideal for comparing editing activity among users. Who has edited the most? Who is creating the most buildings? This dataset is great for building leaderboards and getting a general idea of how many users are active in an area and what the distribution of work per user looks like.

#### 2. Per Changeset Stats
The same editing statistics as above (see [full list of columns here]()) but with higher resolution: grouped by the changeset. A changeset is a very logical unit of analysis for looking at the evolution of the map in a given area. Since each changeset can only be from one user, this is the next level of detail from user summaries. Since changeset IDs are sequential, this is a great dataset for time-series analysis. Unfortunately, due to a lack of changeset extracts for the selected regions (time constraints, fun!), OSMesa-generated roll-ups do not include actual timestamps. This caused some confusion for a group looking at Chicago, as visualization of their building import did not show the condensed timeframe during which many changesets were made when using changeset ID as the x-axis.

#### 3. Per Edit Stats
This dataset records each individual edit to the map. This dataset is best for understanding exactly what changed on the map with each edit. Each edit tracks the tags changed as well as the geometry changes (if any). This dataset is (not surprisingly) significantly larger than the other two.



## 5. Results (Example Notebooks)

