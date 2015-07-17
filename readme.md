# plantsoilmatch app

Plantsoilmatch is a very simple web app that lets you choose a type of plant and a type of soil to test whether or not they'd make a successful combo. I wrote it for a job interview and to learn how to use ReactJS, Express, and Azure DocumentDB.

### Front-end

Plantsoilmatch is a single page app. It has four ReactJS components:

* [PlantSoilMatch] - contains the entire frontend and both AJAX calls
* [MatchForm] - receives user input and displays plants and soils collections in drop-downs
* [PSOption] - each plant and soil in MatchForm's drop-downs
* [Output] - displays binary outcome of plant & soil combo after user submits form

The app has two functions. 1) Pings server every minute for plants and soils collections. In reality the lists of plants and soils are pretty unlikely to change, but this is more interesting. :) 2) Takes user's plant selection and soil selection and POSTs them to the server to find out if they are compatible. In reality, given how static this information is likely to be, it'd make more sense to pull the plants and soils collections once and reference them locally instead. But again, this way is a better learning exercise. :)

### Back-end

The back-end is written in Node with Express.

* [app.js] - contains server
* [plantsoilOperator.js] - core plantsoilOperator constructor/class with functions getPlants, getSoils, and checkIfCompatible
* [docdbUtils.js] - utility functions to interface with Azure DocumentDB

The structure is kept flat since this app is really simple.

### Database design

A user of this app is likely to be a gardener or some form of backyard agriculture hobbyist who might like to know whether soils they have on hand are acceptable for growing some desired plant. When thinking of the design, I note that the app only reads from the database. I also note that in production, the plants and soils collections are generally static barring some breakthroughs in agricultural research of new soil types or plant discoveries. I assume that the average plant has just a handful of compatible soils, so nesting compatibleSoils in each plant document makes sense and won't hurt performance.

In traditional NoSQL form, I've separated plants and soils into two different collections. However, it's worth noting that Andrew Liu, program manager of the DocumentDB engineering team, has [pointed out] that DocumentDB (and its pricing structure) approaches collections as "physical containers" for JSON documents rather than "logical namespaces." DocumentDB encourages thinking of collections as units of scale. One might redesign this database with just one collection to include both the plants and soils JSON trees.

I imagine that on success or failure, the user would like to know -- in addition to the outcome -- the full list of compatible soils with the plant selected. It makes sense to denormalize the compatible soils' (likely unchanging) information in each plant document to avoid making additional trips to DocumentDB (or sifting through another JSON tree) to search the Soils collection for information on each soil.

While not used in the app since DocumentDB is prepopulated, I've included the JSON trees for each collection in the initialDatabase folder.

### Installation

```sh
$ git clone [git-repo-url] plantsoil
$ cd plantsoil
$ npm install
```

### Resources used

I found these resources very helpful while learning and developing with React, Express, and DocumentDB:

* https://azure.microsoft.com/en-us/documentation/articles/documentdb-nodejs-application/
* https://azure.microsoft.com/en-us/documentation/articles/documentdb-sql-query/
* https://facebook.github.io/react/docs/tutorial.html
* https://facebook.github.io/react/docs/thinking-in-react.html
* https://leanpub.com/nodecraftsman

### Development

After developing, build JSX and change sourced scripts in index.html. Learn more [here].

[pointed out]:http://www.reddit.com/r/dotnet/comments/39hxav/i_work_on_the_azure_documentdb_team_ama/
[here]:https://facebook.github.io/react/docs/getting-started.html
