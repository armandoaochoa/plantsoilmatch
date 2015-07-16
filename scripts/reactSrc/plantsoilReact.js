//React App Component Structure
// PlantSoilMatch
// - MatchForm
// - - PSOption
// - Output

//contains the entire frontend
var PlantSoilMatch = React.createClass({
  getInitialState: function() {
    return {
      output: ''
    };
  },
  //gets lists of plants and soils from database
  loadCollectionsFromServer: function() {
    url: this.props.url,
    dataType: 'json',
    cache: false,
    success: function(data) {
      this.setState({plants: data[0], soils: data[1]});
    }.bind(this),
    error: function(xhr, status, err) {
      console.error(this.props.url, status, err.toString());
    }.bind(this)
  },
  handleMatchFormSubmit: function(submission) {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: submission,
      success: function(result) {
        if (result == 0) {
          this.setState({output: 'bad combo!'});
        }
        if (result == 1) {
          this.setState({output: 'good combo!'});
        }
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  //check to see what exactly this does...
  //load initial collections of plants and soils
  //ping the server every minute if any additions
  componentDidMount: function() {
    this.loadCollectionsFromServer();
    setInterval(this.loadCollectionsFromServer, this.props.pollInterval);
  }
  render: function() {
    return (
      <div align="center">
        <MatchForm onMatchFormSubmit={this.handleMatchFormSubmit}/>
        <Output />
      </div>
    );
  }
});

//receives user input, aggregates & displays plant and soil collections
var MatchForm = React.createClass({
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
    var plantOptions = [];
    var soilOptions = [];
    this.props.plants.forEach(function(plant) {
      plantOptions.push(<PSOption name={plant} />);
    });
    this.props.soils.forEach(function(soil) {
      soilOptions.push(<PSOption name={soil} />);
    });
    return (
      <h3>Choose a type of plant and soil. Then combine them!</h3>
      <form className="plantsoilMatchForm" onSubmit={this.handleSubmit}>
        <p>
          Plant:
          <selection ref="plant">
            {plantOptions}
          </selection>
        </p>
        <p>
          Soil:
          <selection ref="soil">
            {soilOptions}
          </selection>
        </p>
        <input type="submit" value="Combine" />
      </form>
    );
  }
});

//assembles plant and soil types into drop-down lists
var PSOption = React.createClass({
  render: function() {
    var name = this.props.name;
    return (
      <option value="{name}">{name}</option>
    );
  }
});

//displays result from user submitting the form
var Output = React.createClass({
  render: function() {
    return (
      <p>{this.props.output}</p>
    );
  }
});

//hardcoded data, comment out after writing ajax calls
//var plants = ['Plant A', 'Plant B', 'Plant C', 'Plant D', 'Plant E'];
//var soils = ['Soil A', 'Soil B', 'Soil C', 'Soil D', 'Soil E', 'Soil F', 'Soil G', 'Soil H', 'Soil I', 'Soil J'];
//var output = 'output';

//instantiates the root component and injects into main DOM element
React.render(
  <PlantSoilMatch url="/app.js" pollInterval={60000} />,
  document.getElementById('content')
);
