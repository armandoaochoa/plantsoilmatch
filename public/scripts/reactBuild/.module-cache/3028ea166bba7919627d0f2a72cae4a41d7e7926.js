//React App Component Structure
// PlantSoilMatch
// - MatchForm
// - - PSOption
// - Output

//contains the entire frontend
var PlantSoilMatch = React.createClass({displayName: "PlantSoilMatch",
  getInitialState: function() {
    return {
      output: ''
    };
  },
  //gets lists of plants and soils from database
  loadCollectionsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({plants: data.plants, soils: data.soils});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleMatchFormSubmit: function(submission) {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: submission,
      success: function(result) {
        this.setState({output: result.goodMatch ? 'good combo!' : 'bad combo!'});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  //load initial collections of plants and soils
  //ping the server regularly for changes to collections [more to demo React than for the app itself :)]
  componentDidMount: function() {
    this.loadCollectionsFromServer();
    setInterval(this.loadCollectionsFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      React.createElement("div", {align: "center"}, 
        React.createElement(MatchForm, {onMatchFormSubmit: this.handleMatchFormSubmit, soils: this.state.soils, plants: this.state.plants}), 
        React.createElement(Output, {output: this.state.output})
      )
    );
  }
});

//receives user input, aggregates & displays plant and soil collections
var MatchForm = React.createClass({displayName: "MatchForm",
  propTypes: {
    soils: React.PropTypes.arrayOf(React.PropTypes.shape({
      id: React.PropTypes.string.isRequired
    })),
    plants: React.PropTypes.array
  },
  getDefaultProps: function() {
    return {
      soils: [],
      plants: []
    }
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var plant = React.findDOMNode(this.refs.plant).value.trim();
    var soil = React.findDOMNode(this.refs.soil).value.trim();
    if (!plant || !soil) {
      return;
    }
    this.props.onMatchFormSubmit({plant: plant, soil: soil});
    return;
  },
  render: function() {
    var plantOptions = this.props.plants.map(function(plant) {
      return React.createElement(PSOption, {key: plant.id, name: plant.id});
    });
    var soilOptions = this.props.soils.map(function(soil) {
      return React.createElement(PSOption, {key: soil.id, name: soil.id});
    });

    return (
      React.createElement("div", null, 
        React.createElement("h3", null, "Choose a type of plant and soil. Then combine them!"), 
        React.createElement("form", {className: "plantsoilMatchForm", onSubmit: this.handleSubmit}, 
          React.createElement("p", null, 
            "Plant:", 
            React.createElement("select", {ref: "plant"}, 
              plantOptions
            )
          ), 
          React.createElement("p", null, 
            "Soil:", 
            React.createElement("select", {ref: "soil"}, 
              soilOptions
            )
          ), 
          React.createElement("input", {type: "submit", value: "Combine"})
        )
      )
    );
  }
});

//assembles plant and soil types into drop-down lists
var PSOption = React.createClass({displayName: "PSOption",
  propTypes: {
    name: React.PropTypes.string.isRequired
  },
  render: function() {
    var name = this.props.name;
    return (
      React.createElement("option", {value: name}, name)
    );
  }
});

//displays result from user submitting the form
var Output = React.createClass({displayName: "Output",
  propTypes: {
    output: React.PropTypes.string.isRequired
  },
  render: function() {
    return (
      React.createElement("p", null, this.props.output)
    );
  }
});

//instantiates the root component and injects into main DOM element
React.render(
  React.createElement(PlantSoilMatch, {url: "/service", pollInterval: 60000}),
  document.getElementById('content')
);
