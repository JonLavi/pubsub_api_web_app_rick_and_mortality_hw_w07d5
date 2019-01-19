const ListView = function (targetContainer){
  this.targetContainer = targetContainer;
};

ListView.prototype.makeOccurrenceList = function (character) {

  this.makeListTitle();

  const newList = document.createElement('ul');

  character.list.forEach((occurrence) => {
    const newOccurrence =  document.createElement('li');
    newOccurrence.textContent = occurrence;
    newList.appendChild(newOccurrence);
  })

  this.targetContainer.appendChild(newList);
};

ListView.prototype.makeListTitle = function () {
  const newListTitle = document.createElement('h2');
  newListTitle.textContent = 'Occurrences:'
  this.targetContainer.appendChild(newListTitle);
};

module.exports = ListView;