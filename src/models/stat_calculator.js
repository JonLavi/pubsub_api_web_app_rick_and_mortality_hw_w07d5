const PubSub = require('../helpers/pub_sub.js');
const incomingData = require('../data/sample_data.js');
const seasons = require('../data/seasons.js')

const StatCalculator = function () {
  this.characters = [];
}

StatCalculator.prototype.bindEvents = function () {

  // making all seasons data
  PubSub.subscribe('Mortality:character-list-ready', (event) => {
    this.characters = event.detail;
    console.log('characters have arrived at stat processing centre:', this.characters);
    console.log('compare to this data:', incomingData);
    const processedData = this.processData(this.characters); // repalce with "this.characters" to use api data
    PubSub.publish('StatCalculator:character-stats-ready', processedData);
  });

  // subscribing and publishing season selection
  PubSub.subscribe('NavView:season-selected', (event) => {
    const requestedSeason = event.detail;
    const filteredData = this.filterBySeason(this.characters, requestedSeason, seasons);
    const processedData = this.processData(incomingData);
    PubSub.publish('StatCalculator:character-stats-ready', processedData);
  });
}

//////// Filtering Characters by Season ////////
//////// Could be done by requesting all episode info (format: S##E##), ////////
//////// and cross checking against the episode list for each character ////////
//////// but it's easier to hard code with this few seasons/episdoes    ////////

//////// outsource this into API module?? ////////

StatCalculator.prototype.filterBySeason = function(data, requestedSeason, seasonsList){

// TODO: get this workin'

  const episodesArray = seasonsList[requestedSeason];

  const filteredData = data.filter((character) => {
    return episodesArray.forEach((checkedEpisode) => {
      if (character.episode = `https://rickandmortyapi.com/api/episode/${checkedEpisode}`){
        return true
      }
    });

  });
  console.log('***************filteredData:', filteredData );
  // take big dataset and return only characters where episode is a subset of numbers
}


//////// Data Processing Workflow ////////

StatCalculator.prototype.processData = function(data){
  console.log('Processing characters:', data);
  const allRicks = this.findAllByName(data, 'Rick');
  console.log('found Ricks:', allRicks)
  const allMortys = this.findAllByName(data, 'Morty');

  const rickStats = this.makeStats(allRicks, "Rick");
  console.log('found Mortys:', allMortys)
  const mortyStats = this.makeStats(allMortys, "Morty");

  const rickList = this.makeOccurrenceList(allRicks);
  const mortyList = this.makeOccurrenceList(allMortys);

  const rickData = this.buildCharacterData(rickStats,rickList);
  const mortyData = this.buildCharacterData(mortyStats,mortyList);

  const readyData = [rickData, mortyData];
  console.log('ReadyData:',readyData)
  return readyData;
}


//////// Process Data Sub-Functions ////////

StatCalculator.prototype.findAllByName = function (data, name) {
  console.log('finding name:', name, ' in:', data);
  const ricks = data.filter(character => {return character.name.includes(name)});
  // BUG: This filter does not work..... :(
  console.log('ricks:', ricks);
  return ricks
};

StatCalculator.prototype.makeStats = function (list, name){
  let stats = {
      "name": name,
      "deathCount": this.makeCount("Dead", list),
      "aliveCount": this.makeCount("Alive", list),
      "unknownCount": this.makeCount("unknown", list),
    }

  stats.mortalityRate = this.makeMortalityRate(stats)

  return stats
};

StatCalculator.prototype.makeOccurrenceList = function (listOfCharacters) {
  let list = [];
  listOfCharacters.forEach((character) => {
    list.push(character.name);
  });
  return list;
};

StatCalculator.prototype.buildCharacterData = function (stats, list) {
  stats['list'] = list
  return stats
};


///////// Make Stats Sub-Functions /////////

StatCalculator.prototype.makeCount = function(status, list){
  let count = 0;
  list.forEach((character) => {
    if (character.status === status){
      count ++
    }
  });
  return count;
}

StatCalculator.prototype.makeMortalityRate = function (stats){
  return 100*(stats.deathCount) / ((stats.deathCount)+(stats.aliveCount))
}


module.exports = StatCalculator;
